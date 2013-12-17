module.exports.create = function ( options ) {

    return new Client( options );

};


function Client( options ) {

    this.options = options;

}


Client.prototype.getID = function () {

    return this.options.id;

};


Client.prototype.getRoom = function () {

    return this.options.room;

};


Client.prototype.isObserver = function () {

    return this.options.observer;

};


Client.prototype.getSocket = function () {

    return this.options.socket;

};


Client.prototype.toSerializable = function () {

    return {
        id: this.getID(),
        room: this.getRoom()        
    };

};

