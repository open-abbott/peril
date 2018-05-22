'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    // end of turn army arrangement
    socket.on(events.fortify, data => {
        console.log(`Received fortify: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.fortify({
            client: socket.stash.client,
            nodeFrom: data.from,
            nodeTo: data.to
        })
    })

}

module.exports = {
    register
}
