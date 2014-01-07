var Peril = {};
Peril.GameFactory = require( "./peril.game" );
Peril.EmitterFactory = require( "./peril.emitter" );


var Rooms = {};


function Room( options ) {
    this.name = options.name;
    this.emitter = Peril.EmitterFactory.create();
    this.game = null;
}


module.exports = {

    clientDB: {},

    exists: function ( client ) {
        return null != this.clientDB[client.getID()];
    },

    join: function ( client ) {

        if ( !this.exists( client ) ) {
            this.clientDB[client.getID()] = {
                inRoom: {},
                roomCount: 0
            };
        }

        var client_entry = this.clientDB[client.getID()];

        var room = client.getRoom();
        client_entry.inRoom[room] = true;
        client_entry.roomCount++;

        if ( null == Rooms[room] ) {

            Rooms[room] = new Room( { name: room } );

            Rooms[room].game = Peril.GameFactory.create( {
                room: Rooms[room],
                playerCount: client.getPlayerCount(),
                callbacks: {
                    endGame: function () {
                        delete Rooms[room];
                    }
                }
            } );

        }

        Rooms[room].game.addClient( client );
    },

    part: function ( client ) {

        var client_entry = this.clientDB[client.getID()];

        if ( null == client_entry ) {
            return;
        }

        var room = client.getRoom();
        if ( null != Rooms[room] ) {
            Rooms[room].game.removeClient( client );
        }

        if ( null != client_entry.inRoom ) {
            delete client_entry.inRoom[client.getRoom()];
        }        

        client_entry.roomCount--;
        if ( 1 > client_entry.roomCount ) {
            delete this.clientDB[client.getID()];
        }

    },

    present: function ( client ) {
        if ( !this.exists( client ) ) {
            return false;
        }
        return this.clientDB[client.getID()].inRoom[client.getRoom()] || false;
    },

    game: function ( client ) {
        var game = Rooms[client.getRoom()].game;
        if ( game.participating( client ) ) {
            return game;
        }
        return null;
    }

};
