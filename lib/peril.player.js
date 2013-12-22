module.exports.create = function ( options ) {

    return new Player( options );

};


function Player( options ) {

    this.client = options.client;
    this.cards = [];
    this.armies = 0;

    switch ( options.playerCount ) {
    case 3:
        this.armies = 35;
        break;
    case 4:
        this.armies = 30;
        break;
    case 5:
        this.armies = 25;
        break;
    default:
        this.armies = 20;
        break;
    }

}


Player.prototype.getID = function () {
    return this.client.getID();
};


Player.prototype.getSocket = function () {
    return this.client.getSocket();
};


Player.prototype.addCard = function ( card ) {
    this.cards.push( card );
};


Player.prototype.toSerializable = function () {
    return {};
};


Player.prototype.allocateArmies = function ( board ) {
    // nodes/3 rounded down or 3 (whichever greater)
    // cluster bonus
    // redeem cards
};
