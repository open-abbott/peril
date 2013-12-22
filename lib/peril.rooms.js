var Peril = {};
Peril.GameFactory = require( "./peril.game" );


var Games = {};


module.exports = {

    db: {},

    exists: function ( client ) {
        return null != this.db[client.getID()];
    },

    join: function ( client ) {

        if ( !this.exists( client ) ) {
            this.db[client.getID()] = {
                inRoom: {},
                roomCount: 0
            };
        }

        var entry = this.db[client.getID()];

        var room = client.getRoom();
        entry.inRoom[room] = true;
        entry.roomCount++;

        if ( null == Games[room] ) {
            Games[room] = Peril.GameFactory.create( {
                room: room,
                playerCount: client.getPlayerCount()
            } );
        }
        Games[room].addClient( client );
    },

    part: function ( client ) {
        var entry = this.db[client.getID()];

        if ( null == entry ) {
            return;
        }

        var room = client.getRoom();
        if ( null != Games[room] ) {
            Games[room].removeClient( client );
        }

        if ( null != entry.inRoom ) {
            delete entry.inRoom[client.getRoom()];
        }        

        entry.roomCount--;
        if ( 1 > entry.roomCount ) {
            delete this.db[client.getID()];
        }
    },

    present: function ( client ) {
        if ( !this.exists( client ) ) {
            return false;
        }
        return this.db[client.getID()].inRoom[client.getRoom()] || false;
    },

    game: function ( client ) {
        var game = Games[client.getRoom()];
        if ( game.participating( client ) ) {
            return game;
        }
        return null;
    }

};
