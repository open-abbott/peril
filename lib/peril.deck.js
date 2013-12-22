module.exports.create = function ( options ) {

    return new Deck( options );

};


function Deck( options ) {
    this.cards = [];
    this.bonus = 4;
}


Deck.prototype.Card = function ( options ) {
    this.node = null;
    this.type = null;
};


Deck.prototype.addCard = function () {



};


Deck.prototype.draw = function () {
    return this.cards.pop();
};


Deck.prototype.incrementBonus = function () {
    var bonus = this.bonus;

    if ( 12 < this.bonus ) {
        this.bonus += 5;
    }
    else if ( 10 < this.bonus ) {
        this.bonus += 3;
    }
    else {
        this.bonus += 2;
    }

    return bonus;
};


Deck.prototype.redeem = function ( cards ) {
    var armies = null;

    // if cards are valid, check set
    // if set is valid

    armies = this.incrementBonus();
    return armies;
};
