module.exports = {

    keys: {},

    emit: function ( key, socket, name, data ) {

        if ( null == this.keys[key] ) {
            this.keys[key] = 0;
        }

        ++this.keys[key];

        if ( null == data ) {
            data = { sequence: this.keys[key] };
        }

        return socket.emit( name, data );

    },

    flush: function ( key ) {

        delete this.keys[key];

    }

};
