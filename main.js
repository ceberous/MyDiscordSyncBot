const Masto = require( "mastodon" );
const Reporter = require( "lilreporter" );
//const RMU = require( "redis-manager-utils" );

const Sleep = require( "./utils/generic.js" ).sleep;

const Personal = require( "./personal.js" );

( async ()=> {

	//var MyRedis = new RMU( 2 );
	//await MyRedis.init();

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

	var latest_id = "";
	setInterval( async function() {

		var latest = await MyMastodon.get( "timelines/home" , {
			since_id: latest_id
		});
		if ( latest.data ) {
			console.log( "We Have Data" );
			//console.log( latest.data );
			for ( var i = ( latest.data.length - 1 ); i > -1; i-- ) {
				//console.log( "\nMessage: [ " + i.toString() + " ] === " );
				if ( latest_id !== latest.data[ i ].id ) { latest_id = latest.data[ i ].id; }
				//console.log( "latest_id === " + latest_id );
				//console.log( latest.data[ i ].content );
				var new_status = latest.data[ i ].content.replace( "<br />" , " " );
				new_status = new_status.replace( "<br/>" , " " );
				new_status = new_status.replace( "<br>" , " " );
				new_status = new_status.replace( /<[^>]+>/g , "" );
				//console.log( new_status );
				await MyDiscord.post( new_status );
				await Sleep( 1000 );

			}
		}
		else { console.log( "No Data BibleThump" ); }
	} , 30000 );


})();