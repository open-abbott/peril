module.exports.create = function ( options ) {

    return new CQueue( options );

};


function CQueue( options ) {

    this.index = -1;
    this.array = [];

}


CQueue.prototype.addItem = function ( item ) {

    this.array.push( item );

};


CQueue.prototype.randomize = function () {
    return;
};


CQueue.prototype.next = function () {

    if ( 1 > this.array.length ) {
        return null;
    }

    ++this.index;

    if ( this.index >= this.array.length ) {
        this.index = 0;
    }

    return this.array[this.index];

};
