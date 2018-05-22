'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    socket.on(events.attack, data => {
        console.log(`Received attack: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.attack({
            client: socket.stash.client,
            nodeFrom: data.from,
            nodeTo: data.to,
            diceCount: data.dice
        })
    })

}

module.exports = {
    register
}
