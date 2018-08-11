( async ()=> {

	await require( "./utils/discord.js" ).initialize();

	process.on( "unhandledRejection" , function( reason , p ) {
		var xPrps = Object.keys( reason );
		console.log( xPrps ); 
		console.error( reason , "Unhandled Rejection at Promise" , p );
		console.trace();
		if ( !reason ) { return; }
		if ( reason === "Error: read ECONNRESET" ) { require( "./utils/twitter.js" ).reconnect(); }
		require( "./utils/discord.js" ).postError( reason );
	});

	process.on( "uncaughtException" , function( err ) {
		console.error( err , "Uncaught Exception thrown" );
		console.trace();
		if ( !err ) { return; }
		const x11 = err.toString();
		if ( x11 === "Error: read ECONNRESET" ) {
			setTimeout( function() {
				// require( "./utils/twitter.js" ).reconnect();
			} , 3000 );
		}		
		require( "./utils/discord.js" ).postError( err );
	});
	
	await require( "./utils/generic.js" ).sleep( 2000 );
	
	await require( "./utils/twitter.js" ).reconnect();

})();