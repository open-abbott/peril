( function () {

    var Peril = {};

    Peril.SignIn = {};
    Peril.SignIn.Controller = function ( $scope, $route ) {
        
    };

    Peril.Room = {};
    Peril.Room.Controller = function ( $scope, $route ) {
    };

    Peril.Map = {};

    Peril.Map.Anchors = {

        "10": [ 249, 285 ],
        "11": [ 215, 257 ],
        "12": [ 257, 245 ],
        "13": [ 254, 207 ],
        "14": [ 289, 272 ],
        "15": [ 208, 209 ],

        "20": [ 336, 152 ],
        "21": [ 405, 163 ],
        "22": [ 354, 200 ],
        "23": [ 471,  96 ],
        "24": [ 518, 133 ],
        "25": [ 516,  66 ],
        "26": [ 303, 196 ],
        "27": [ 471, 149 ],
        "28": [ 396, 219 ],
        "29": [ 426, 105 ],
        "2a": [ 371,  96 ],
        "2b": [ 457,  52 ],

        "30": [ 495, 271 ],
        "31": [ 446, 226 ],
        "32": [ 485, 228 ],
        "33": [ 449, 267 ],

        "40": [ 199, 129 ],
        "41": [ 183,  93 ],
        "42": [ 249, 125 ],
        "43": [ 238,  69 ],
        "44": [ 273, 164 ],
        "45": [ 300,  92 ],
        "46": [ 218, 160 ],

        "50": [  26,  50 ],
        "51": [  47,  92 ],
        "52": [  83, 164 ],
        "53": [ 112, 130 ],
        "54": [ 137,  47 ],
        "55": [  76,  54 ],
        "56": [  91,  96 ],
        "57": [ 132,  97 ],
        "58": [  66, 127 ],

        "60": [  97, 280 ],
        "61": [ 116, 243 ],
        "62": [  76, 246 ],
        "63": [  92, 206 ]

    };

    Peril.Map.Controller = function ( $scope ) {

        $scope.anchors = Peril.Map.Anchors;

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

    };


    var Module = angular.module(
        "peril",
        [ "ngRoute" ]
    ).config( function ( $httpProvider, $routeProvider ) {

        delete $httpProvider.defaults.headers.common["X-Requested-With"];

        $routeProvider.when( "/:room/:client", {

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
                    room: "=",
                    client: "=",
                    isObserver: "=observer"
                },
                controller: Peril.Map.Controller,
                templateUrl: "Peril.Map.template.html",
                replace: true
            };

        } ]
    );

} )();
