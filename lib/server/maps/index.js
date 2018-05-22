'use strict'

const classic = require('./classic.json')
const extend = require('extend')

const getClassic = () => {
    return extend(true, {}, classic)
}

module.exports = {
    getClassic
}
