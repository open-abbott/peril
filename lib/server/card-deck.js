'use strict'

class Card {
    constructor() {
        this.node = null
        this.type = null
    }
}

class CardDeck {

    constructor() {
        this.cards = [];
        this.bonus = 4;
    }

    addCard() {
    }

    draw() {
        return this.cards.pop()
    }

    incrementBonus() {

        let bonus = this.bonus;

        if (12 < this.bonus) {
            this.bonus += 5
        }
        else if (10 < this.bonus) {
            this.bonus += 3
        }
        else {
            this.bonus += 2
        }

        return bonus

    }

    redeem(cards) {

        var armies = null;

        // if cards are valid, check set
        // if set is valid

        armies = this.incrementBonus()
        return armies

    }

}

module.exports = {
    create: (options) => {
        return new CardDeck(options)
    }
}
