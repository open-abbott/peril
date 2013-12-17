module.exports.create = function ( options ) {

    return new Game( options );

};


var Maps = require( "./peril.maps" );
var CQueueFactory = require( "./cqueue" );


function Player( options ) {

    this.client = options.client;

}

Player.prototype.toSerializable = function () {
    return {};
};


function Game( options ) {

    this.options = {
        playerCount: 6
    };

    this.board = Maps.Classic();
    this.playerCount = 0;
    this.clients = {};
    this.players = {};
    this.playerQueue = CQueueFactory.create();
    this.phase = this.Phase.Aquisition;
    this.currentPlayer = null;

}


Game.prototype.Phase = {
    Aquisition: 0,
    Deployment: 1,
    Main: 2
};


Game.prototype.addClient = function ( client ) {

    this.clients[client.getID()] = client;

    if ( client.isObserver() || ( this.options.playerCount >= this.playerCount ) ) {
        return;
    }

    var player = new Player( {
        client: client
    } );
    this.players[client.getID()] = player;
    this.playerQueue.addItem( player );
    ++this.playerCount;

    if ( this.options.playerCount >= this.playerCount ) {
        this.start();
    }

};


Game.prototype.start = function () {

    this.playerQueue.randomize();
    this.step();

};


Game.prototype.step = function () {

    this.currentPlayer = this.playerQueue.next();

    switch ( this.phase ) {
    case this.Phase.Main:
        break;
    case this.Phase.Deployment:
        break;
    case this.Phase.Aquisition:
        break;
    default:
        break;
    }

};


Game.prototype.participating = function ( client ) {
    return null != this.players[client.getID()];
};


Game.prototype.toSerializable = function ( client ) {

    var payload = {
        board: this.board
    };

    if ( null != client && this.participating( client ) ) {
        payload.client = this.players[client.getID()].toSerializable();
    }

    return payload;

};


Game.prototype.refresh = function ( client ) {

    if ( null == client ) {

        for ( var id in this.clients ) {
            this.refresh( this.clients[id] );
        }

    }

    if ( !this.participating( client ) ) {
        return;
    }

    client.socket.emit( "refresh", this.toSerializable( client ) );

};
