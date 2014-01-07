module.exports.create = function () {
    return new Emitter();
};

function Emitter() {
    this.counter = 0;
}

Emitter.prototype.emit = function ( socket, name, data ) {

    ++this.counter;

    if ( null == data ) {
        data = {};
    }

    data.sequence = this.counter;

    console.log( [ "Emitting", this.counter, name, JSON.stringify( data ) ].join( ": " ) );
    return socket.emit( name, data );

};
