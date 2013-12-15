$(function () {
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

    var send_click = function ( pane ) {
        var message = pane.editBox.val();
        pane.editBox.clear();
        var data = {
            message: message,
            r: pane.r
        };
        socket.emit( "send", data );
    };

    var options = {
        sendClick: send_click
    };
    var pane = new EChat.ChatPane( options )
        .appendTo( $(document.body) );

    var host = "http://daveabbott.com:9001";
    var socket = io.connect( host );

    var connect_dialog_options = {
        connectClick: function ( dialog ) {
            var connect_data = {
                client: dialog.getClient(),
                r: url_parameters.r
            };
            socket.emit( "connect", connect_data );
        }
    };
    var connect_dialog = new EChat.ConnectDialog( connect_dialog_options );

    // ask for (optional) handle
    // ask for (optional) PIN
    socket.on( "connect", function () {
        connect_dialog.open();
    } );

    socket.on( "connected", function ( data ) {
        document.title = "EChat [" + data.r + "]";
        pane.identify( data );
        pane.editBox.focus();
    } );

    socket.on( "disconnected", function ( data ) {
        alert( data.message );
        window.location.reload( true );
    } );

    socket.on( "update", function ( data ) {
        pane.update( data );
    } );

    socket.on( "refreshclients", function ( data ) {
        pane.refreshClients( data );
    } );
});
