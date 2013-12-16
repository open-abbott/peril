var Http = require( "http" );
var NodeStatic = require( "node-static" );
var Socket = {
    IO: require( "socket.io" )
};

var port = 9001;

var file_server = new NodeStatic.Server( "./public", { cache: false } );

function generate_expiration() {
    var d = new Date();
    d.setFullYear( d.getFullYear() + 1 );
    return d.toUTCString();
}

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

var Maps = {
    Classic: function () {
        return {
            clusters: {
                1: {
                    name: "Africa",
                    nodes: [ "10", "11", "12", "13", "14", "15" ],
                    bonus: 3
                },
                2: {
                    name: "Asia",
                    nodes: [
                        "20", "21", "22", "23", "24", "25",
                        "26", "27", "28", "29", "2a", "2b"
                    ],
                    bonus: 7
                },
                3: {
                    name: "Australia",
                    nodes: [ "30", "31", "32", "33" ],
                    bonus: 2
                },
                4: {
                    name: "Europe",
                    nodes: [ "40", "41", "42", "43", "44", "45", "46" ],
                    bonus: 5
                },
                5: {
                    name: "North America"
                    nodes: [ "50", "51", "52", "53", "54", "55", "56", "57" ],
                    bonus: 5
                },
                6: {
                    name: "South America",
                    nodes: [ "60", "61", "62", "63" ],
                    bonus: 2
                }
            },
            nodes: {
                "10": { name: "South Africa" },
                "11": { name: "Congo" },
                "12": { name: "East Africa" },
                "13": { name: "Egypt" },
                "14": { name: "Madagascar" },
                "15": { name: "North Africa" },

                "20": { name: "Afganistan" },
                "21": { name: "China" },
                "22": { name: "India" },
                "23": { name: "Irkutsk" },
                "24": { name: "Japan" },
                "25": { name: "Kamchatka" },
                "26": { name: "Middle East" },
                "27": { name: "Mongolia" },
                "28": { name: "Siam" },
                "29": { name: "Siberia" },
                "2a": { name: "Ural" },
                "2b": { name: "Yakutsk" },

                "30": { name: "Eastern Australia" },
                "31": { name: "Indonesia" },
                "32": { name: "New Guinea" },
                "33": { name: "Western Australia" },

                "40": { name: "Great Britain" },
                "41": { name: "Iceland" },
                "42": { name: "Northern Europe" },
                "43": { name: "Scandinavia" },
                "44": { name: "Southern Europe" },
                "45": { name: "Ukraine" },
                "46": { name: "Western Europe" },

                "50": { name: "Alaska" },
                "51": { name: "Alberta" },
                "52": { name: "Central America" },
                "53": { name: "Eastern United States" },
                "54": { name: "Greenland" },
                "55": { name: "Northwest Territory" },
                "56": { name: "Ontario" },
                "57": { name: "Quebec" },
                "58": { name: "Western United States" },

                "60": { name: "Argentina" },
                "61": { name: "Brazil" },
                "62": { name: "Peru" },
                "63": { name: "Venezuela" }
            },
            directed: false,
            edges: [
                [ "10", "14" ], [ "10", "12" ], [ "10", "11" ],
                [ "11", "12" ], [ "11", "15" ],
                [ "12", "13" ], [ "12", "14" ], [ "12", "15" ], [ "12", "26" ],
                [ "13", "15" ], [ "13", "26" ], [ "13", "44" ],
                [ "15", "44" ], [ "15", "46" ], [ "15", "61" ],
                [ "20", "21" ], [ "20", "22" ], [ "20", "26" ], [ "20", "2a" ], [ "20", "45" ],
                [ "21", "22" ], [ "21", "27" ], [ "21", "28" ], [ "21", "29" ], [ "21", "2a" ],
                [ "22", "26" ], [ "22", "28" ],
                [ "23", "25" ], [ "23", "27" ], [ "23", "29" ], [ "23", "2b" ],
                [ "24", "25" ], [ "24", "27" ],
                [ "25", "27" ], [ "25", "2b" ], [ "25", "50" ],
                [ "26", "44" ], [ "26", "45" ],
                [ "27", "29" ],
                [ "28", "31" ],
                [ "29", "2a" ], [ "29", "2b" ],
                [ "2a", "45" ],
                [ "30", "32" ], [ "30", "33" ],
                [ "31", "32" ], [ "31", "33" ],
                [ "32", "33" ],
                [ "40", "41" ], [ "40", "42" ], [ "40", "43" ], [ "40", "46" ],
                [ "41", "43" ], [ "41", "54" ],
                [ "42", "43" ], [ "42", "44" ], [ "42", "45" ], [ "42", "46" ],
                [ "43", "45" ],
                [ "44", "45" ], [ "44", "46" ],
                [ "50", "51" ], [ "50", "55" ],
                [ "51", "55" ], [ "51", "56" ], [ "51", "58" ],
                [ "52", "53" ], [ "52", "58" ], [ "52", "63" ],
                [ "53", "56" ], [ "53", "57" ], [ "53", "58" ],
                [ "54", "55" ], [ "54", "56" ], [ "54", "57" ],
                [ "55", "56" ],
                [ "56", "57" ], [ "56", "58" ],
                [ "60", "61" ], [ "60", "62" ],
                [ "61", "62" ], [ "61", "63" ],
                [ "62", "63" ]
            ]
        };
    }
};

function Game() {
    this.board = Maps.Classic();
}

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
    }

};

io.sockets.on(
    "connection",
    function ( socket ) {

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

            socket.join( socket.stash.g );
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

            console.log( "Emitting refresh" );
            io.sockets
                .in( socket.stash.r )
                .emit( "refresh", Clients.rCensus( socket.stash.r ) );
        } );

        socket.on( "disconnect", function () {
            console.log( "Received disconnect" );
            if ( null == socket.stash ) {
                return;
            }

            Clients.part( socket.stash.client, socket.stash.r );
                
            console.log( "Emitting refresh" );
            io.sockets
                .in( socket.stash.r )
                .emit( "refresh", Clients.rCensus( socket.stash.r ) );

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
