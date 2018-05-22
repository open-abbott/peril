'use strict'

class ShufflingQueue {

    constructor() {
        this.index = -1;
        this.array = [];
        this.first = null;
    }

    addItem(item) {
        if (null == this.first) {
            this.first = item
        }
        this.array.push(item)
    }

    randomize() {

        function shuffle(a) {
            let i = a.length
            let r
            let v

            while (i--) {
                r = (Math.random() * i) | 0
                v = a[i]
                a[i] = a[r]
                a[r] = v
            }

            return a;
        }

        return shuffle(this.array)

    }

    reset() {
        this.index = -1;
    }

    next() {

        if (1 > this.array.length) {
            return null
        }

        ++this.index

        if (this.index >= this.array.length) {
            this.index = 0
        }

        return this.array[this.index]

    }

}

module.exports = {
    create: ( options ) => {
        return new ShufflingQueue( options )
    }
}
