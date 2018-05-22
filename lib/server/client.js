'use strict'

const defaultRoom = 'top'

const isValidRoom = (room) => {
    return (/^[a-z][-_a-z0-9]*$/).test(room || "")
}

class Client {

    constructor(options) {

        const { id, observer, playerCount, room, socket } = options

        this.id = id
        this.socket = socket
        this.room = isValidRoom(room) ? room : defaultRoom
        this.observer = !!observer
        this.playerCount = Number(playerCount)

        if (2 > this.playerCount || 6 < this.playerCount) {
            this.playerCount = 6
        }

    }

    getID() {
        return this.id
    }

    getRoom() {
        return this.room
    }

    isObserver() {
        console.log(`Client is observer? ${this.observer}`)
        return this.observer
    }

    getSocket() {
        return this.socket
    }

    getPlayerCount() {
        return this.playerCount
    }

    toSerializable() {
        return {
            id: this.getID(),
            room: this.getRoom()
        }
    }

}

module.exports = {
    create: (options) => {
        return new Client(options)
    }
}
