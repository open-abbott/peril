'use strict'

const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    socket.on(events.disconnect, () => {
        console.log("Received disconnect")
        if (null == socket.stash) {
            return
        }

        // if game not over, concede
        // emit refresh
        rooms.part(socket.stash.client)
    })

}

module.exports = {
    register
}
