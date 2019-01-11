const Masto = require( "mastodon" );
const Reporter = require( "lilreporter" );
const RMU = require( "redis-manager-utils" );

const Sleep = require( "./utils/generic.js" ).sleep;

const Personal = require( "./personal.js" );
const LatestID_Key = "MY.DISCORD_SYNC.LATEST_ID";


function escapeMastodonHtml( text ) {
	text = text.replace( /&amp;/g , "&" );
	text = text.replace( /&lt;/g , "<" );
	text = text.replace( /&gt;/g , ">" );
	text = text.replace( /&quot;/g , '"' );
	text = text.replace( /&#039;/g , "'" );
	text = text.replace( /&apos;/g , "'" );
	text = text.replace( /<br\/>/g , "\n" );
	text = text.replace( /<br\ \/>/g , "\n" );
	text = text.replace( /<br>/g , "\n" );
	text = text.replace( /<[^>]+>/g , "" );
	return text;
}

( async ()=> {

	var MyRedis = new RMU( 2 );
	await MyRedis.init();

	var MyDiscord = new Reporter( Personal.reporters );
	await MyDiscord.init();

	var MyMastodon = new Masto({
		access_token: Personal.mastodon.token ,
		timeout_ms: 60*1000 ,
		api_url: Personal.mastodon.api_url ,
	});

	process.on( "unhandledRejection" , function( reason , p ) {
		var xPrps = Object.keys( reason );
		console.log( xPrps );
		console.error( reason , "Unhandled Rejection at Promise" , p );
		console.trace();
		if ( !reason ) { return; }
		if ( reason === "Error: read ECONNRESET" ) { require( "./utils/twitter.js" ).reconnect(); }
		MyDiscord.error( reason );
	});

	process.on( "uncaughtException" , function( err ) {
		console.error( err , "Uncaught Exception thrown" );
		console.trace();
		if ( !err ) { return; }
		const x11 = err.toString();
		MyDiscord.error( err );
	});


	await Sleep( 2000 );

	let latest_id = await MyRedis.keyGet( LatestID_Key );
	if ( !latest_id ) { latest_id = ""; }
	setInterval( async function() {

		let latest = await MyMastodon.get( "timelines/home" , {
			since_id: latest_id
		});
		if ( latest.data ) {
			console.log( "We Have Data" );
			//console.log( latest.data );
			for ( var i = ( latest.data.length - 1 ); i > -1; i-- ) {
				//console.log( "\nMessage: [ " + i.toString() + " ] === " );

				// ID Stuff
				if ( latest_id !== latest.data[ i ].id ) { latest_id = latest.data[ i ].id; }
				//console.log( "latest_id === " + latest_id );
				await MyRedis.keySet( LatestID_Key , latest_id );

				// Message Content Stuff
				let message = escapeMastodonHtml( latest.data[ i ].content );
				message = message + " \n<" + Personal.mastodon.statuses_url + latest_id + ">";
				console.log( message );
				await MyDiscord.post( message );
				await Sleep( 1000 );

			}
		}
		else { console.log( "No Data BibleThump" ); }
	} , 30000 );

})();