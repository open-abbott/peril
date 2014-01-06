( function () {

    function Connection() {
        this.id = null;
        this.player = {};
        this.host = PERIL_URL;
        this.socket = null;
        this.listeners = {};
    };

    Connection.prototype.createSocket = function () {

        var my = this;

        this.socket = io.connect( this.host );

        var events = [
            "connected",
            "disconnected",
            "refresh",
            "acquire",      // emit territory to acquire
            "deploy",       // receive number of armies, emit where the armies should go
            "attack",       // emit attack from and to
            "defend",       // emit count of defense dice
            "fortify",      // emit from/to pairs for moving armies
            "gameOver"
        ];

        function make_event_handler( name, data ) {
            return function () {
                console.log(
                    "Client event received - "
                    + name + ": " + JSON.stringify( data || {} )
                );
                my.listeners[name] && my.listeners[name].apply( null, arguments );
            };
        }

        for ( var i = 0; i < events.length; ++i ) {
            this.socket.on( events[i], make_event_handler( events[i] ) );
        }
    };

    Connection.prototype.open = function ( options ) {

        console.log( "Attempting to open as: " + JSON.stringify( options ) );

        this.createSocket();
        this.emit( "connect", options );

    };

    Connection.prototype.emit = function ( name, data ) {
        return this.socket.emit( name, data );
    };

    Connection.prototype.setListener = function ( name, callback ) {
        this.listeners[name] = callback;
    };


    var Peril = {};

    Peril.Map = {

        width: 540,
        height: 315,
       
        clusters: {

            "0": {
                id: 0,
                nodes: {
                    "25": { id: "01", a: [   0,  50 ], r: 0 },
                    "50": { id: "02", a: [ 540,  66 ], r: 0 }
                }
            },

            "1": {
                id: 1,
                nodes: {
                    "10": { id: "10", a: [ 249, 285 ], r: 15 },
                    "11": { id: "11", a: [ 215, 257 ], r: 15 },
                    "12": { id: "12", a: [ 257, 245 ], r: 15 },
                    "13": { id: "13", a: [ 254, 207 ], r: 15 },
                    "14": { id: "14", a: [ 289, 272 ], r: 20 },
                    "15": { id: "15", a: [ 208, 209 ], r: 25 }
                }
            },

            "2": {
                id: 2,
                nodes: {
                    "20": { id: "20", a: [ 336, 152 ], r: 25 },
                    "21": { id: "21", a: [ 405, 163 ], r: 35 },
                    "22": { id: "22", a: [ 354, 200 ], r: 15 },
                    "23": { id: "23", a: [ 471,  96 ], r: 19 },
                    "24": { id: "24", a: [ 518, 133 ], r: 10 },
                    "25": { id: "25", a: [ 516,  66 ], r: 20 },
                    "26": { id: "26", a: [ 303, 196 ], r: 15 },
                    "27": { id: "27", a: [ 471, 149 ], r: 26 },
                    "28": { id: "28", a: [ 396, 219 ], r: 15 },
                    "29": { id: "29", a: [ 426, 105 ], r: 20 },
                    "2a": { id: "2a", a: [ 371,  96 ], r: 29 },
                    "2b": { id: "2b", a: [ 457,  52 ], r: 20 }
                }
            },

            "3": {
                id: 3,
                nodes: {
                    "30": { id: "30", a: [ 495, 271 ], r: 20 },
                    "31": { id: "31", a: [ 446, 226 ], r: 15 },
                    "32": { id: "32", a: [ 485, 228 ], r: 15 },
                    "33": { id: "33", a: [ 449, 267 ], r: 15 }
                }
            },

            "4": {
                id: 4,
                nodes: {
                    "40": { id: "40", a: [ 199, 129 ], r: 11 },
                    "41": { id: "41", a: [ 183,  93 ], r: 15 },
                    "42": { id: "42", a: [ 249, 125 ], r: 20 },
                    "43": { id: "43", a: [ 238,  69 ], r: 29 },
                    "44": { id: "44", a: [ 273, 164 ], r: 18 },
                    "45": { id: "45", a: [ 300,  92 ], r: 30 },
                    "46": { id: "46", a: [ 218, 160 ], r: 15 }
                }
            },

            "5": {
                id: 5,
                nodes: {
                    "50": { id: "50", a: [  26,  50 ], r: 20 },
                    "51": { id: "51", a: [  47,  92 ], r: 15 },
                    "52": { id: "52", a: [  83, 164 ], r: 20 },
                    "53": { id: "53", a: [ 112, 130 ], r: 15 },
                    "54": { id: "54", a: [ 137,  47 ], r: 28 },
                    "55": { id: "55", a: [  76,  54 ], r: 20 },
                    "56": { id: "56", a: [  91,  96 ], r: 15 },
                    "57": { id: "57", a: [ 132,  97 ], r: 15 },
                    "58": { id: "58", a: [  66, 127 ], r: 15 }
                }
            },

            "6": {
                id: 6,
                nodes: {
                    "60": { id: "60", a: [  97, 280 ], r: 15 },
                    "61": { id: "61", a: [ 116, 243 ], r: 20 },
                    "62": { id: "62", a: [  76, 246 ], r: 15 },
                    "63": { id: "63", a: [  92, 206 ], r: 15 }
                }
            }

        },

        edges: [
            { a: { c: "1", n: "10" }, b: { c: "1", n:"14" } },
            { a: { c: "1", n: "10" }, b: { c: "1", n:"12" } },
            { a: { c: "1", n: "10" }, b: { c: "1", n:"11" } },

            { a: { c: "1", n: "11" }, b: { c: "1", n:"12" } },
            { a: { c: "1", n: "11" }, b: { c: "1", n:"15" } },

            { a: { c: "1", n: "12" }, b: { c: "1", n:"13" } },
            { a: { c: "1", n: "12" }, b: { c: "1", n:"14" } },
            { a: { c: "1", n: "12" }, b: { c: "1", n:"15" } },
            { a: { c: "1", n: "12" }, b: { c: "2", n:"26" } },

            { a: { c: "1", n: "13" }, b: { c: "1", n:"15" } },
            { a: { c: "1", n: "13" }, b: { c: "2", n:"26" } },
            { a: { c: "1", n: "13" }, b: { c: "4", n:"44" } },

            { a: { c: "1", n: "15" }, b: { c: "4", n:"44" } },
            { a: { c: "1", n: "15" }, b: { c: "4", n:"46" } },
            { a: { c: "1", n: "15" }, b: { c: "6", n:"61" } },

            { a: { c: "2", n: "20" }, b: { c: "2", n:"21" } },
            { a: { c: "2", n: "20" }, b: { c: "2", n:"22" } },
            { a: { c: "2", n: "20" }, b: { c: "2", n:"26" } },
            { a: { c: "2", n: "20" }, b: { c: "2", n:"2a" } },
            { a: { c: "2", n: "20" }, b: { c: "4", n:"45" } },

            { a: { c: "2", n: "21" }, b: { c: "2", n:"22" } },
            { a: { c: "2", n: "21" }, b: { c: "2", n:"27" } },
            { a: { c: "2", n: "21" }, b: { c: "2", n:"28" } },
            { a: { c: "2", n: "21" }, b: { c: "2", n:"29" } },
            { a: { c: "2", n: "21" }, b: { c: "2", n:"2a" } },

            { a: { c: "2", n: "22" }, b: { c: "2", n:"26" } },
            { a: { c: "2", n: "22" }, b: { c: "2", n:"28" } },

            { a: { c: "2", n: "23" }, b: { c: "2", n:"25" } },
            { a: { c: "2", n: "23" }, b: { c: "2", n:"27" } },
            { a: { c: "2", n: "23" }, b: { c: "2", n:"29" } },
            { a: { c: "2", n: "23" }, b: { c: "2", n:"2b" } },

            { a: { c: "2", n: "24" }, b: { c: "2", n:"25" } },
            { a: { c: "2", n: "24" }, b: { c: "2", n:"27" } },

            { a: { c: "2", n: "25" }, b: { c: "2", n:"27" } },
            { a: { c: "2", n: "25" }, b: { c: "2", n:"2b" } },
            { a: { c: "2", n: "25" }, b: { c: "0", n:"50" } },

            { a: { c: "2", n: "26" }, b: { c: "4", n:"44" } },
            { a: { c: "2", n: "26" }, b: { c: "4", n:"45" } },

            { a: { c: "2", n: "27" }, b: { c: "2", n:"29" } },

            { a: { c: "2", n: "28" }, b: { c: "3", n:"31" } },

            { a: { c: "2", n: "29" }, b: { c: "2", n:"2a" } },
            { a: { c: "2", n: "29" }, b: { c: "2", n:"2b" } },

            { a: { c: "2", n: "2a" }, b: { c: "4", n:"45" } },

            { a: { c: "3", n: "30" }, b: { c: "3", n:"32" } },
            { a: { c: "3", n: "30" }, b: { c: "3", n:"33" } },

            { a: { c: "3", n: "31" }, b: { c: "3", n:"32" } },
            { a: { c: "3", n: "31" }, b: { c: "3", n:"33" } },

            { a: { c: "3", n: "32" }, b: { c: "3", n:"33" } },

            { a: { c: "4", n: "40" }, b: { c: "4", n:"41" } },
            { a: { c: "4", n: "40" }, b: { c: "4", n:"42" } },
            { a: { c: "4", n: "40" }, b: { c: "4", n:"43" } },
            { a: { c: "4", n: "40" }, b: { c: "4", n:"46" } },

            { a: { c: "4", n: "41" }, b: { c: "4", n:"43" } },
            { a: { c: "4", n: "41" }, b: { c: "5", n:"54" } },

            { a: { c: "4", n: "42" }, b: { c: "4", n:"43" } },
            { a: { c: "4", n: "42" }, b: { c: "4", n:"44" } },
            { a: { c: "4", n: "42" }, b: { c: "4", n:"45" } },
            { a: { c: "4", n: "42" }, b: { c: "4", n:"46" } },

            { a: { c: "4", n: "43" }, b: { c: "4", n:"45" } },

            { a: { c: "4", n: "44" }, b: { c: "4", n:"45" } },
            { a: { c: "4", n: "44" }, b: { c: "4", n:"46" } },

            { a: { c: "5", n: "50" }, b: { c: "5", n:"51" } },
            { a: { c: "5", n: "50" }, b: { c: "5", n:"55" } },
            { a: { c: "5", n: "50" }, b: { c: "0", n:"25" } },

            { a: { c: "5", n: "51" }, b: { c: "5", n:"55" } },
            { a: { c: "5", n: "51" }, b: { c: "5", n:"56" } },
            { a: { c: "5", n: "51" }, b: { c: "5", n:"58" } },

            { a: { c: "5", n: "52" }, b: { c: "5", n:"53" } },
            { a: { c: "5", n: "52" }, b: { c: "5", n:"58" } },
            { a: { c: "5", n: "52" }, b: { c: "6", n:"63" } },

            { a: { c: "5", n: "53" }, b: { c: "5", n:"56" } },
            { a: { c: "5", n: "53" }, b: { c: "5", n:"57" } },
            { a: { c: "5", n: "53" }, b: { c: "5", n:"58" } },

            { a: { c: "5", n: "54" }, b: { c: "5", n:"55" } },
            { a: { c: "5", n: "54" }, b: { c: "5", n:"56" } },
            { a: { c: "5", n: "54" }, b: { c: "5", n:"57" } },

            { a: { c: "5", n: "55" }, b: { c: "5", n:"56" } },

            { a: { c: "5", n: "56" }, b: { c: "5", n:"57" } },
            { a: { c: "5", n: "56" }, b: { c: "5", n:"58" } },

            { a: { c: "6", n: "60" }, b: { c: "6", n:"61" } },
            { a: { c: "6", n: "60" }, b: { c: "6", n:"62" } },

            { a: { c: "6", n: "61" }, b: { c: "6", n:"62" } },
            { a: { c: "6", n: "61" }, b: { c: "6", n:"63" } },

            { a: { c: "6", n: "62" }, b: { c: "6", n:"63" } }
        ]

    };


    Peril.Connection = new Connection();


    Peril.SignIn = {};
    Peril.SignIn.Controller = function ( $scope, $location ) {

        console.log( "Starting SignIn controller" );

        var my = this;

        $scope.id = "dave";
        $scope.room = "test";
        $scope.observer = false;
        $scope.playerCount = 2;
        $scope.playerCountOptions = [ 2, 3, 4, 5, 6 ];
        $scope.navigateTo = null;

        $scope.$watch( "navigateTo", function () {
            if ( null != $scope.navigateTo ) {
                $location.path( $scope.navigateTo );
            }
        } );

        $scope.connect = function () {

            Peril.Connection.setListener( "connected", function ( data ) {
                console.log( "Attempting to reroute..." );
                Peril.Connection.id = data.id;
                $scope.navigateTo = "/" + [ data.room, data.id ].join( "/" );
                $scope.$apply();
            } );

            Peril.Connection.open( {
                id: $scope.id,
                room: $scope.room,
                observer: $scope.observer,
                playerCount: Number( $scope.playerCount )
            } );

        };

    };


    Peril.Room = {};
    Peril.Room.Controller = function ( $scope, $route, $rootScope ) {

        var my = this;

        $scope.id = $route.current.params.id;
        $scope.room = $route.current.params.room;
        $scope.player = Peril.Connection.player;
        $scope.state = null;

        $scope.roomClasses = function () {

            var classes = [];

            if ( $scope.player.color ) {
                classes.push( "player-" + $scope.player.color );
            }

            return classes.join( " " );

        };

        if ( null == Peril.Connection.socket ) {

            Peril.Connection.open( {
                id: $scope.id,
                room: $scope.room
            } );

        }

        var click_listener_unbind = $rootScope.$on( "nodeClick", function ( event, data ) {

            console.log( "Room captured click event: " + JSON.stringify( data ) );

            if ( my.isCurrentPlayer() ) {

                switch ( $scope.state.phase ) {

                case "main":
                    my.prepareForTurn();
                    break;

                case "acquiring":
                    Peril.Connection.emit( "acquire", data );
                    break;

                case "placing":
                    data.armies = 1;
                    Peril.Connection.emit( "deploy", data );
                    break;

                default:
                    break;

                }

            }

            event.stopPropagation();

        } );
        $scope.$on( "$destroy", click_listener_unbind );

        this.isCurrentPlayer = function () {
            return $scope.state
                && $scope.state.player
                && $scope.state.player.id == $scope.state.currentPlayer;
        };

        this.prepareForTurn = function () {
            // configure for deployment
            // configure for attack
            // configure for fortification
        };

        Peril.Connection.setListener( "refresh", function ( data ) {

            console.log( "Room controller refresh: " + JSON.stringify( data ) );
            $scope.state = data;

            if ( null != $scope.state.player && null == Peril.Connection.player.color ) {
                angular.extend(
                    Peril.Connection.player,
                    $scope.state.players[$scope.state.player.id]
                );
            }

            $scope.$apply();

        } );

    };


    Peril.Map.Controller = function ( $scope, $rootScope ) {

        var my = this;

        $scope.map = Peril.Map;

        $scope.clickNode = function ( node_id ) {
            console.log( "Clicked: " + node_id );
            $rootScope.$emit( "nodeClick", { node: node_id } );
        };

        $scope.nodeClasses = function ( node_id ) {

            if (    null == $scope.state
                 || null == $scope.state.nodes
                 || null == $scope.state.nodes[node_id]) {
                return;
            }

            var classes = [];
            var node = $scope.state.nodes[node_id];

            if ( null != node.owner ) {
                classes.push( "owned" );
                classes.push( "player-" + $scope.state.players[ node.owner ].color );
            }

            if ( my.isCurrentPlayer() ) {
                if ( my.canAcquire( node ) || my.canFortify( node ) ) {
                    classes.push( "selectable" );
                }
            }

            return classes.join( " " );

        };

        $scope.isFalseNode = function ( id ) {
            return "0" == String( id ).charAt( 0 );
        };

        this.canAcquire = function ( node ) {
            return null == node.owner;
        };

        this.canFortify = function ( node ) {
            return node.owner == $scope.state.player.id;
        };

        this.isCurrentPlayer = function () {
            return $scope.state
                && $scope.state.player
                && $scope.state.player.id == $scope.state.currentPlayer;
        };

    };


    var Module = angular.module(
        "peril",
        [ "ngRoute" ]
    ).config( function ( $httpProvider, $routeProvider ) {

        delete $httpProvider.defaults.headers.common["X-Requested-With"];

        $routeProvider.when( "/:room/:id", {

            controller: Peril.Room.Controller,
            templateUrl: "Peril.Room.template.html"
            
        } ).otherwise( {

            controller: Peril.SignIn.Controller,
            templateUrl: "Peril.SignIn.template.html"
            
        } );

    } ).directive(
        "perilMap",
        [ function () {

            return {
                restrict: "E",
                scope: {
                    state: "="
                },
                controller: Peril.Map.Controller,
                templateUrl: "Peril.Map.template.html",
                replace: true
            };

        } ]
    );

} )();
