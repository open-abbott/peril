'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    socket.on(events.endTurn, data => {
        console.log(`Received endTurn: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.endTurn({
            client: socket.stash.client
        })
    })

}

module.exports = {
    register
}
