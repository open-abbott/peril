'use strict'

class Emitter {

    constructor() {
        this.counter = 0
    }

    emit(socket, name, data) {

        ++this.counter

        if (null == data) {
            data = {}
        }

        data.sequence = this.counter

        console.log([
            'Emitting',
            this.counter,
            name,
            JSON.stringify(data)
        ].join(": "))
        return socket.emit(name, data)

    }

}

module.exports = {
    create: () => {
        return new Emitter()
    }
}
