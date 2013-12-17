( function () {

    var url_parameters = ( function ( url_parameters ) {
        var params = {};
        if ( "" == url_parameters ) return params;
        for ( var i = 0; i < url_parameters.length; ++i ) {
            var pair = url_parameters[i].split( "=" );
            if ( 2 != pair.length ) continue;
            params[pair[0]] = decodeURIComponent( pair[1].replace( /\+/g, " " ) );
        }
        return params;
    } )( window.location.search.substr( 1 ).split( "&" ) );


    var host = "http://daveabbott.com:9001";
    var socket = io.connect( host );


    var connect_data = {
        id: url_parameters.c,
        room: url_parameters.r
    };
    socket.emit( "connect", connect_data );


    socket.on( "connected", function ( data ) {
        document.title = "Peril [" + data.room + ":" + data.id + "]";
    } );

    socket.on( "disconnected", function ( data ) {
        alert( data.message );
        window.location.reload( true );
    } );

    socket.on( "refresh", function ( data ) {
        console.log( "Caught refresh event: " + JSON.stringify( data, null, 4 ) );
    } );

    socket.on( "acquire", function () {
        // emit territory to acquire
    } );

    socket.on( "deploy", function () {
        // receive number of armies
        // emit where the armies should go
    } );

    socket.on( "attack", function () {
        // emit attack from and to
    } );

    socket.on( "defend", function () {
        // emit count of defense dice
    } );

    socket.on( "fortify", function () {
        // emit from/to pairs for moving armies
    } );

} )();
