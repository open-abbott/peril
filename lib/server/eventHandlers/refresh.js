'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    socket.on(events.refresh, data => {
        console.log(`Received refresh: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.refresh(socket.stash.client)
    })

}

module.exports = {
    register
}
