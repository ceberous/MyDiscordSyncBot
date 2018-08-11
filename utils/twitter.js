// https://github.com/AvianFlu/ntwitter
const twitter = require( "ntwitter" );

//const Twitter = require( "twitter-node-client" ).Twitter;

const TwitterMain = require( "../personal.js" ).twitter_main;
var twit = null;

const TWITTER_STATUS_BASE = "https://twitter.com/";
const TWITTER_STATUS_BASE_P2 = "/status/";

const ScanTextAndResolveLinks = require( "./generic.js" ).scanTextAndResolveLinks;
function FORMAT_STATUS_SELF_TIMELINE( wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			var finalStatus = "";
			if ( wStatus.retweeted_status ) {
				finalStatus = finalStatus + "@" + wStatus.retweeted_status.user.screen_name + " ";
				var wText = ( wStatus.retweeted_status.extended_tweet ) ? wStatus.retweeted_status.extended_tweet.full_text : wStatus.retweeted_status.text;
				wText = await ScanTextAndResolveLinks( wText );
				wText = await ScanTextAndResolveLinks( wText );
				finalStatus = finalStatus + wText + " ";
				if ( wStatus.retweeted_status.user.screen_name !== TwitterMain.username ) {
					if ( finalStatus.indexOf( "/photo/" ) === -1 && finalStatus.indexOf( "/video/" ) === -1 ) {
						finalStatus = finalStatus + " <" + TWITTER_STATUS_BASE + wStatus.retweeted_status.user.screen_name + TWITTER_STATUS_BASE_P2 + wStatus.retweeted_status.id_str + ">";
					}
				}				
			}
			else {
				var wText = ( wStatus.extended_tweet ) ? wStatus.extended_tweet.full_text : wStatus.text;
				wText = await ScanTextAndResolveLinks( wText );
				wText = await ScanTextAndResolveLinks( wText );
				finalStatus = finalStatus + wText + " ";
				if ( wStatus.user.screen_name !== TwitterMain.username ) {
					if ( finalStatus.indexOf( "/photo/" ) === -1 && finalStatus.indexOf( "/video/" ) === -1 ) {
						finalStatus = finalStatus + " <" + TWITTER_STATUS_BASE + wStatus.user.screen_name + TWITTER_STATUS_BASE_P2 + wStatus.id_str + ">";
					}
				}

			}
			finalStatus = finalStatus.trim();
			resolve( finalStatus );
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function SYNC_SELF_TIMELINE( wStatus ) {
	return new Promise( async function( resolve , reject ) {
		try {
			const NewStatus = await FORMAT_STATUS_SELF_TIMELINE( wStatus );
			console.log( "\n" + "SELF-TIMELINE\n" );
			console.log( NewStatus );
			await require( "./discord.js" ).postTweet( NewStatus );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}

function RECONNECT_TWITTER_CLIENTS() {
	return new Promise( async function( resolve , reject ) {
		try {

			if ( twit !== null ) {
				if ( twit.stream !== null ) {
					if ( typeof twit.stream.destroySilent === "function" ) {
						twit.stream.destroySilent();
						await W_SLEEP( 1000 );
						twit = null;
					}
					else {
						twit = null;
						await W_SLEEP( 3000 );
					}
				}
			}

			twit = new twitter( TwitterMain.creds );

			twit.stream( "user" , function( stream ) {
				stream.on( "data" , function ( data ) {
					if ( data.id ) {
						//console.log( data );
						if ( data.user.screen_name === TwitterMain.username ) {
							SYNC_SELF_TIMELINE( data );
						}
						//else { MASTODON_POST_FOLLOWERS_TIMELINE( data ); }
					}
				});
				stream.on( "end" , function ( response ) {
					require( "./discord.js" ).postError( "Twitter Feed - OFFLINE" );
				});
				stream.on( "destroy" , function ( response ) {
					require( "./discord.js" ).postError( "Twitter Feed - OFFLINE" );
				});
			});
			await require( "./generic.js" ).sleep( 1000 );
			console.log( "Twitter Init" );
			resolve();
		}
		catch( error ) { console.log( error ); reject( error ); }
	});
}
module.exports.reconnect = RECONNECT_TWITTER_CLIENTS;

// function GET_LATEST_SELF_TWEETS( wCount ) {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			console.log( "Starting ????" );
// 			wCount = wCount || "20";
// 			// twit.getUserTimeline({ screen_name: TwitterMain.username , count: wCount } , 
// 			// 	function( error ) { console.log( error ); } ,
// 			// 	function( sucess ) { console.log( sucess ); }
// 			//);
// 			function errorFN( wErr ) { console.log( wErr ); }
// 			function successFN( wSuccess ) { console.log( wSuccess ); console.log( "Done ????" ); resolve(); }
// 			twit.getUserTimeline({ screen_name: TwitterMain.username , count: wCount } , errorFN , successFN );
// 			//console.log( latest20 );
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }

// function RECONNECT_TWITTER_CLIENT() {
// 	return new Promise( async function( resolve , reject ) {
// 		try {
// 			twit = new Twitter( TwitterMain.creds );
// 			await GET_LATEST_SELF_TWEETS();
// 			resolve();
// 		}
// 		catch( error ) { console.log( error ); reject( error ); }
// 	});
// }
// module.exports.reconnect = RECONNECT_TWITTER_CLIENT;