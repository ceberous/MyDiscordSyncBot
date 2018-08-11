const Eris = require( "eris" );
var discordBot = null;
var discordCreds = null;
var discordConfig = null;

function POST_ID( wMessage , wChannelID ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			await discordBot.createMessage( wChannelID , wMessage );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function POST_LOG( wLog ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			if ( !wLog ) { resolve(); return; }
			if ( typeof wLog !== "string" ) {
				try { wLog = wLog.toString(); }
				catch( e ) { wLog = e; }
			}
			await discordBot.createMessage( discordCreds.channels.log , wLog );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.postLog = POST_LOG;

function POST_ERROR( wError ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !discordBot ) { resolve(); return; }
			if ( !wError ) { resolve(); return; }
			if ( typeof wError !== "string" ) {
				try { wError = wError.toString(); }
				catch( e ) { wError = e; }
			}
			await discordBot.createMessage( discordCreds.channels.error , wError );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.postError = POST_ERROR;


function POST_TWEET( wTweet ) {
	return new Promise( async function( resolve , reject ) {
		try {
			if ( !wTweet ) { resolve(); return; }
			await discordBot.createMessage( discordCreds.channels.twitter , wTweet );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.postTweet = POST_TWEET;

function SHUTDOWN_DISCORD() {
	return new Promise( async function( resolve , reject ) {
		try {
			await discordBot.disconnect();			
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function INITIALIZE( wConfig ) {
	return new Promise( async function( resolve , reject ) {
		try {
			console.log( "Discord Init" );
			discordConfig = wConfig;
			discordCreds = require( "../personal.js" ).DISCORD;
			discordBot = new Eris.CommandClient( discordCreds.token , {} , {
				description: "My Discord Sync",
				owner: discordCreds.bot_id ,
				prefix: "!"
			});

			await discordBot.connect();
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.initialize = INITIALIZE;