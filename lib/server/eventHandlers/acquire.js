'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    // initial territory acquisition
    socket.on(events.acquire, data => {
        console.log(`Received acquire: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.acquire(socket.stash.client, data.node)
    })

}

module.exports = {
    register
}
