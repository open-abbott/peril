module.exports.create = function ( options ) {

    return new Client( options );

};


function Client( options ) {

    this.options = options;

    var room = this.options.room;
    if ( !( /^[a-z][-_a-z0-9]*$/ ).test( room || "" ) ) {
        room = "top";
    }
    this.options.room = room;

    var observer = this.options.observer;
    if ( null == observer ) {
        observer = false;
    }
    this.options.observer = !!observer;

    var playerCount = Number( this.options.playerCount );
    if ( 0 > playerCount || 6 < playerCount ) {
        playerCount = 6;
    }
    this.options.playerCount = playerCount;

}


Client.prototype.getID = function () {

    return this.options.id;

};


Client.prototype.getRoom = function () {

    return this.options.room;

};


Client.prototype.isObserver = function () {

    console.log( "Client is observer? " + this.options.observer );
    return this.options.observer;

};


Client.prototype.getSocket = function () {

    return this.options.socket;

};


Client.prototype.getPlayerCount = function () {

    return this.options.playerCount;

};


Client.prototype.toSerializable = function () {

    return {
        id: this.getID(),
        room: this.getRoom()        
    };

};

