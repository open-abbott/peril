'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    socket.on(events.defend, data => {
        console.log(`Received defend: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.defend({
            client: socket.stash.client,
            diceCount: data.dice
        })
    })

}

module.exports = {
    register
}
