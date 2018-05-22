const gameFactory = require('./game')
emitterFactory = require('./emitter')

const rooms = {}
const clientDb = {}

class Room {
    constructor(options) {
        this.name = options.name
        this.emitter = emitterFactory.create()
        this.game = null
    }
}

const exists = (client) => {
    return null != clientDb[client.getID()]
}

const join = (client) => {

    if (!exists(client)) {
        clientDb[client.getID()] = {
            inRoom: {},
            roomCount: 0
        }
    }

    const clientEntry = clientDb[client.getID()]

    const room = client.getRoom()
    clientEntry.inRoom[room] = true
    clientEntry.roomCount++

    if (null == rooms[room]) {

        rooms[room] = new Room({ name: room })
        rooms[room].game = gameFactory.create({
            room: rooms[room],
            playerCount: client.getPlayerCount(),
            callbacks: {
                endGame: function () {
                    delete rooms[room]
                }
            }
        })

    }

    rooms[room].game.addClient(client)
}

const part = (client) => {

    const clientEntry = clientDb[client.getID()]

    if (null == clientEntry) {
        return
    }

    const room = client.getRoom()
    if (null != rooms[room]) {
        rooms[room].game.removeClient(client)
    }

    if (null != clientEntry.inRoom) {
        delete clientEntry.inRoom[client.getRoom()]
    }

    clientEntry.roomCount--
    if (1 > clientEntry.roomCount) {
        delete clientDb[client.getID()]
    }

}

const present = (client) => {
    if (!exists(client)) {
        return false
    }
    return clientDb[client.getID()].inRoom[client.getRoom()] || false
}

const game = (client) => {
    const game = rooms[client.getRoom()].game
    if (game.participating(client)) {
        return game
    }
    return null
}

module.exports = {
    clientDb,
    exists,
    join,
    part,
    present,
    game
}
