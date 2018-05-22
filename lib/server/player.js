'use strict'

const getStartingArmies = (playerCount) => {
    const offset = 6 - playerCount
    return 20 + offset * 5
}

class Player {

    constructor(options) {
        this.game = options.game
        this.client = options.client
        this.color = options.color
        this.cards = []
        this.startingArmies = getStartingArmies(options.playerCount)
        this.armies = 0
    }

    getID() {
        return this.client.getID()
    }

    getSocket() {
        return this.client.getSocket()
    }

    getColor() {
        return this.color
    }

    emit(eventName, data) {
        return this.game.emitter.emit(
            this.getSocket(),
            eventName,
            data
        )
    }

    addCard(card) {
        this.cards.push(card)
    }

    toSerializable() {

        const p = {
            id: this.getID(),
            armies: this.armies,
            cards: this.cards.map(c => c.toSerializable())
        }

        if (0 < this.startingArmies) {
            p.startingArmies = this.startingArmies
        }

        return p

    }

    allocateArmies(board) {

        // redeem cards

        let owned = 0
        const clusters = {}

        for (const id in board.clusters) {
            clusters[id] = {
                total: board.clusters[id].nodes.length,
                owned: 0
            }
        }

        for (const id in board.nodes) {
            if (this.getID() === board.nodes[id].owner) {
                console.log(this.getID() + " owns " + id)
                clusters[(id.replace(/[a-f]/g, "0") / 10) >> 0].owned++
                ++owned
            }
        }

        // this may not be right by using this
        if (12 > owned) {
            this.armies += 3
        }
        else {
            this.armies += (owned / 3) >> 0
        }

        console.log(`${this.getID()} granted ${this.armies} for territory ownership`)

        for (const id in clusters) {
            console.log(JSON.stringify(clusters[id]))
            if (clusters[id].total === clusters[id].owned) {
                console.log(this.getID() + " owns " + board.clusters[id].name)
                console.log(this.getID() + " granted " + board.clusters[id].bonus + " armies")
                this.armies += board.clusters[id].bonus
            }
        }

        console.log(`Allocated ${this.armies} armies to ${this.getID()}`)

    }

}

module.exports = {
    create: (options) => {
        return new Player( options )
    }
}
