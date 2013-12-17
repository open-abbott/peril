module.exports.create = function ( options ) {

    return new Game( options );

};


var Maps = require( "./peril.maps" );
var CQueueFactory = require( "./cqueue" );


function Game( options ) {

    this.options = {
        playerCount: 6
    };

    this.board = Maps.Classic();
    this.playerCount = 0;
    this.clients = {};
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

    this.playerQueue.addItem( client );
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


Game.prototype.refresh = function () {
};
