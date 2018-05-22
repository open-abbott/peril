'use strict'

const clientFactory = require('')
const events = require('../events')
const rooms = require('../rooms')

const register = (socket) => {

    // connect and join need broken apart
    socket.on(events.connect, data => {

        console.log(`Received connect: ${JSON.stringify(data)}`)

        const client = clientFactory.create({
            socket: socket,
            id: data.id,
            room: data.room,
            observer: data.observer,
            playerCount: data.playerCount
        })

        socket.stash = {
            client: client
        }

        // instead of dumping, just increment user id
        if (rooms.present(client)) {
            const disconnectedPayload = {
                message: "A client already exists with that identity"
            }
            console.log(`Disconnecting duplicate client ${socket.stash.client.getID()}`)
            socket.emit('disconnected', disconnectedPayload)
            socket.disconnect()
            return
        }

        socket.join(socket.stash.client.getRoom())
        rooms.join(client)

        const connectedPayload = socket.stash.client.toSerializable()
        console.log('Emitting connected confirmation')
        socket.emit('connected', connectedPayload)

        rooms.game(socket.stash.client).refresh(socket.stash.client)

    })

}

module.exports = {
    register
}
