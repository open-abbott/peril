module.exports.create = function ( options ) {

    return new Player( options );

};


function Player( options ) {

    this.client = options.client;
    this.color = options.color;
    this.cards = [];
    this.startingArmies = 0;
    this.armies = 0;

    switch ( options.playerCount ) {
    case 2:
        this.startingArmies = 40;
        break;
    case 3:
        this.startingArmies = 35;
        break;
    case 4:
        this.startingArmies = 30;
        break;
    case 5:
        this.startingArmies = 25;
        break;
    default:
        this.startingArmies = 20;
        break;
    }

}


Player.prototype.getID = function () {
    return this.client.getID();
};


Player.prototype.getSocket = function () {
    return this.client.getSocket();
};


Player.prototype.getColor = function () {
    return this.color;
};


Player.prototype.emit = function ( name, data ) {

    if ( null == data ) {
        data = {};
    }

    return this.getSocket().emit( name, data );

};


Player.prototype.addCard = function ( card ) {
    this.cards.push( card );
};


Player.prototype.toSerializable = function () {

    var p = {
        armies: this.armies,
        cards: []
    };

    for ( var i = 0; i < this.cards.length; ++i ) {
        p.cards.push( this.cards[i].toSerializable() );
    }

    if ( 0 < this.startingArmies ) {
        p.startingArmies = this.startingArmies;
    }

    return p;

};


Player.prototype.allocateArmies = function ( board ) {
    // nodes/3 rounded down or 3 (whichever greater)
    // cluster bonus
    // redeem cards
};
