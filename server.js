var Http = require( "http" );
var Identicon = require( "identicon" );
var NodeStatic = require( "node-static" );
var Socket = {
    IO: require( "socket.io" )
};

var port = 9001;

var file_server = new NodeStatic.Server( "./public", { cache: false } );

function generate_identicon( identity, callback ) {
    Identicon.generate(
        identity,
        128,
        function ( error, buffer ) {
            if ( error ) {
                console.log( "Error generating identicon: " + error.message );
                console.log( error.stack );
                console.trace( "Here!" );
                return;
            }
            callback( buffer );
        }
    );
}

function generate_expiration() {
    var d = new Date();
    d.setFullYear( d.getFullYear() + 1 );
    return d.toUTCString();
}

var server = Http.createServer(
    function ( request, response ) {

        var server_pattern = {
            identicon: /^\/identicon\/(.*)$/
        };

        request.setEncoding( "utf8" );

        request.on( "end", function () {

            console.log( "Request: " + request.url );

            switch ( true ) {
            case server_pattern.identicon.test( request.url ):
                var identity = ( server_pattern.identicon.exec( request.url ) )[1]
                console.log( "Serving identicon for " + identity );
                generate_identicon(
                    identity,
                    function ( buffer ) {
                        response.writeHeader(
                            200,
                            {
                                "Cache-Control": "public",
                                "Content-Length": buffer.length,
                                "Content-Type": "image/png",
                                "Expires": generate_expiration(),
                                "Pragma": "cache"
                            }
                        );
                        response.write( buffer );
                        response.end();
                    }
                );
                break;
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

var Clients = {
    _db: {
        "Server": {}
    },

    exists: function ( client ) {
        return null != this._db[client];
    },

    join: function ( client, r ) {
        if ( !this.exists( client ) ) {
            this._db[client] = {
                r: {},
                r_count: 0
            };
        }
        this._db[client].r[r] = true;
        this._db[client].r_count++;
    },

    part: function ( client, r ) {
        if ( null == this._db[client] ) {
            return;
        }
        if ( null != this._db[client].r ) {
            delete this._db[client].r[r];
        }
        this._db[client].r_count--;
        if ( 1 > this._db[client].r_count ) {
            delete this._db[client];
        }
    },

    isIn: function ( client, r ) {
        if ( !this.exists( client ) ) {
            return false;
        }
        return this._db[client].r[r] || false;
    },

    rCensus: function ( r ) {
        var clients = {};
        for ( var client in this._db ) {
            if ( null != this._db[client].r && this._db[client].r[r] ) {
                clients[client] = true;
            }
        }
        return clients;
    }
};

io.sockets.on(
    "connection",
    function ( socket ) {

        socket.on( "send", function ( data ) {
            var update_data = {
                client: socket.stash.client,
                action: "message",
                payload: {
                    message: data.message,
                    r: socket.stash.r
                }
            };
            console.log( "Received command: " + JSON.stringify( data ) );
            console.log( "Emitting update: " + JSON.stringify( update_data ) );
            io.sockets.in( socket.stash.r ).emit( "update", update_data );
        } );

        socket.on( "anonymous", function () {
            console.log( "Anonymous connection" );
            var data = {
                client: null,
                key: null
            };
            socket.emit( "anonymous", data );
        } );

        socket.on( "connect", function ( data ) {
            console.log( "Received connect: " + JSON.stringify( data ) );

            socket.stash = {
                client: data.client,
                r: ( /^[a-z][-_a-z0-9]*$/ ).test( data.r || "" ) ? data.r : "top"
            };

            console.log( "socket.stash: " + JSON.stringify( socket.stash ) );

            if ( Clients.isIn( socket.stash.client, socket.stash.r ) ) {
                var disconnected_data = {
                    message: "A client already exists with that identity"
                };
                console.log( "Disconnecting duplicate client " + socket.stash.client );
                socket.emit( "disconnected", disconnected_data );
                return;
            }

            socket.join( socket.stash.r );
            Clients.join( socket.stash.client, socket.stash.r );

            var connected_data = {
                client: socket.stash.client,
                r: socket.stash.r
            };
            console.log( "Emitting connected confirmation");
            socket.emit( "connected", connected_data );

            var update_data = {
                client: "Server",
                action: "connect",
                payload: {
                    client: socket.stash.client,
                    r: socket.stash.r
                }
            };
            console.log( "Emitting update: " + JSON.stringify( update_data ) );
            socket.broadcast.to( socket.stash.r ).emit( "update", update_data );

            console.log( "Emitting refreshclients" );
            io.sockets
                .in( socket.stash.r )
                .emit( "refreshclients", Clients.rCensus( socket.stash.r ) );
        } );

        socket.on( "disconnect", function () {
            console.log( "Received disconnect" );
            if ( null == socket.stash ) {
                return;
            }

            Clients.part( socket.stash.client, socket.stash.r );
                
            console.log( "Emitting refreshclients" );
            io.sockets
                .in( socket.stash.r )
                .emit( "refreshclients", Clients.rCensus( socket.stash.r ) );

            var update_data = {
                client: "Server",
                action: "disconnect",
                payload: {
                    client: socket.stash.client,
                    r: socket.stash.r
                }
            };
            console.log( "Emitting update: " + JSON.stringify( update_data ) );
            socket.broadcast.to( socket.stash.r ).emit( "update", update_data );
        } );

    }
);
