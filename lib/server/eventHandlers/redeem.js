'use strict'

const events = require('../events')

const register = (socket) => {

    // redeem card sets
    socket.on(events.redeem, data => {
        console.log(`Received redeem: ${JSON.stringify(data || {})}`)
        //io.sockets.in(socket.stash.r).emit("update", update_data)
    } );

}

module.exports = {
    register
}
