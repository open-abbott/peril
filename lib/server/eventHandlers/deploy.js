'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    // deploy spare armies before battle
    socket.on(events.deploy, data => {
        console.log(`Received deploy: ${JSON.stringify(data || {})}}`)
        const game = rooms.game(socket.stash.client)
        game.deploy(socket.stash.client, data.node, data.armies)
    })

}

module.exports = {
    register
}
