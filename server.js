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

        // connect and join need broken apart
        socket.on( "connect", function ( data ) {
            console.log( "Received connect: " + JSON.stringify( data ) );

            var client = Peril.ClientFactory.create( {
                socket: socket,
                id: data.id,
                room: data.room,
                observer: data.observer,
                playerCount: data.playerCount
            } );

            socket.stash = {
                client: client
            };

            // instead of dumping, just increment user id
            if ( Peril.Rooms.present( client ) ) {
                var disconnected_data = {
                    message: "A client already exists with that identity"
                };
                console.log( "Disconnecting duplicate client " + socket.stash.client.getID() );
                socket.emit( "disconnected", disconnected_data );
                socket.disconnect();
                return;
            }

            socket.join( socket.stash.client.getRoom() );
            Peril.Rooms.join( client );

            var connected_data = socket.stash.client.toSerializable();
            console.log( "Emitting connected confirmation");
            socket.emit( "connected", connected_data );

            Peril.Rooms.game( socket.stash.client ).refresh( socket.stash.client );
        } );

        socket.on( "disconnect", function () {
            console.log( "Received disconnect" );
            if ( null == socket.stash ) {
                return;
            }

            // if game not over, concede
            // emit refresh
            Peril.Rooms.part( socket.stash.client );
        } );

        socket.on( "refresh", function ( data ) {
            console.log( "Received refresh: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.refresh( socket.stash.client );
        } );

        // initial territory acquisition
        socket.on( "acquire", function ( data ) {
            console.log( "Received acquire: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.acquire( socket.stash.client, data.node );
        } );

        // deploy spare armies before battle
        socket.on( "deploy", function ( data ) {
            console.log( "Received deploy: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.deploy( socket.stash.client, data.node, data.armies );
        } );

        // redeem card sets
        socket.on( "redeem", function ( data ) {
            console.log( "Received redeem: " + JSON.stringify( data || {} ) );
            //io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        socket.on( "attack", function ( data ) {
            console.log( "Received attack: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.attack( {
                client: socket.stash.client,
                nodeFrom: data.from,
                nodeTo: data.to,
                diceCount: data.dice
            } );
        } );

        socket.on( "defend", function ( data ) {
            console.log( "Received defend: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.defend( {
                client: socket.stash.client,
                diceCount: data.dice
            } );
        } );

        // successful capture of node
        socket.on( "occupy", function ( data ) {
            console.log( "Received occupy: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.occupy( {
                client: socket.stash.client,
                nodeFrom: data.from,
                nodeTo: data.to,
                armies: data.armies
            } );
        } );

        // end of turn army arrangement
        socket.on( "fortify", function ( data ) {
            console.log( "Received fortify: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.fortify( {
                client: socket.stash.client,
                nodeFrom: data.from,
                nodeTo: data.to
            } );
        } );

        socket.on( "endTurn", function ( data ) {
            console.log( "Received endTurn: " + JSON.stringify( data || {} ) );
            var game = Peril.Rooms.game( socket.stash.client );
            game.endTurn( {
                client: socket.stash.client
            } );
        } );

    }
);
