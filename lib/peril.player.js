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
        id: this.getID(),
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

    // redeem cards

    var owned = 0;
    var clusters = {};

    for ( var id in board.clusters ) {
        clusters[id] = {
            total: board.clusters[id].nodes.length,
            owned: 0
        };
    }

    for ( var id in board.nodes ) {
        if ( this.getID() == board.nodes[id].owner ) {
            console.log( this.getID() + " owns " + id );
            clusters[ ( id.replace( /[a-f]/g, "0" ) / 10 ) >> 0 ].owned++;
            ++owned;
        }
    }

    if ( 12 > owned ) {
        this.armies += 3;
    }
    else {
        this.armies += ( owned / 3 ) >> 0;
    }

    console.log( this.getID() + " granted " + this.armies + " for territory ownership." );

    for ( var id in clusters ) {
        console.log( JSON.stringify( clusters[id] ) );
        if ( clusters[id].total == clusters[id].owned ) {
            console.log( this.getID() + " owns " + board.clusters[id].name );
            console.log( this.getID() + " granted " + board.clusters[id].bonus + " armies" );
            this.armies += board.clusters[id].bonus;
        }
    }

    console.log( "Allocated " + this.armies + " armies to " + this.getID() );

};
