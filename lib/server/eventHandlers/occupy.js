'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    // successful capture of node
    socket.on(events.occupy, data => {
        console.log(`Received occupy: ${JSON.stringify(data || {})}`)
        const game = rooms.game(socket.stash.client)
        game.occupy({
            client: socket.stash.client,
            nodeFrom: data.from,
            nodeTo: data.to,
            armies: data.armies
        })
    })

}

module.exports = {
    register
}
