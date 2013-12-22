module.exports.create = function ( options ) {

    return new CQueue( options );

};


function CQueue( options ) {

    this.index = -1;
    this.array = [];
    this.first = null;

}


CQueue.prototype.addItem = function ( item ) {

    if ( null == this.first ) {
        this.first = item;
    }

    this.array.push( item );

};


CQueue.prototype.randomize = function () {
    return;
};


CQueue.prototype.reset = function () {

    this.index = -1;

};


CQueue.prototype.next = function () {

    if ( 1 > this.array.length ) {
        return null;
    }

    ++this.index;

    if ( this.index >= this.array.length ) {
        this.index = 0;
    }

    return this.array[ this.index ];

};
