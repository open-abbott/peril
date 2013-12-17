var Http = require( "http" );
var NodeStatic = require( "node-static" );
var Peril = {}
Peril.ClientFactory = require( "./lib/peril.client" );
Peril.Rooms = require( "./lib/peril.rooms" );
var Socket = {};
Socket.IO = require( "socket.io" );


var port = 9001;

var file_server = new NodeStatic.Server( "./public", { cache: false } );

var server = Http.createServer(
    function ( request, response ) {

        request.setEncoding( "utf8" );

        request.on( "end", function () {

            console.log( "Request: " + request.url );

            switch ( true ) {
            default:
                file_server.serve(
                    request,
                    response,
                    function ( error, result ) {
                        // handle 404s and the like from error.status
                    }
                );
                break;
            }
        } );

        request.resume();
    }
);


server.listen( port );

var io = Socket.IO.listen( server, { log: 1 } );
io.set( "log level", 1 );


io.sockets.on(
    "connection",
    function ( socket ) {

        socket.on( "connect", function ( data ) {
            console.log( "Received connect: " + JSON.stringify( data ) );

            var client = Peril.ClientFactory.create( {
                socket: socket,
                id: data.id,
                observer: !!data.observer,
                room: ( /^[a-z][-_a-z0-9]*$/ ).test( data.room || "" ) ? data.room : "top"
            } );

            socket.stash = {
                client: client
            };

            if ( Peril.Rooms.present( client ) ) {
                var disconnected_data = {
                    message: "A client already exists with that identity"
                };
                console.log( "Disconnecting duplicate client " + socket.stash.client.getID() );
                socket.emit( "disconnected", disconnected_data );
                return;
            }

            socket.join( socket.stash.client.getRoom() );
            Peril.Rooms.join( client );

            var connected_data = socket.stash.client.toSerializable();
            console.log( "Emitting connected confirmation");
            socket.emit( "connected", connected_data );
        } );

        socket.on( "disconnect", function () {
            console.log( "Received disconnect" );
            if ( null == socket.stash ) {
                return;
            }

            Peril.Rooms.part( socket.stash.client );
                
            // if game not over, concede
            // emit refresh
        } );

        socket.on( "refresh", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        // initial territory acquisition
        socket.on( "acquire", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        // deploy spare armies before battle
        socket.on( "deploy", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        // redeem card sets
        socket.on( "redeem", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        socket.on( "attack", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        socket.on( "defend", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        // end of turn army arrangement
        socket.on( "fortify", function ( data ) {
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

    }
);
