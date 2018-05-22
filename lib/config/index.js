'use strict'

const config = require('./defaults.json')
const extend = require('extend')
const path = require('path')
const process = require('process')
const Q = require('q')

config.fromCli = (opts, args) => {
    const deferred = Q.defer()
    try {
        const configPath = path.resolve(process.cwd(), opts.configFilename)
        const customConfig = require(configPath)
        extend(true, config, customConfig)
        deferred.resolve(config)
    }
    catch (error) {
        deferred.reject(error)
    }
    return deferred.promise
}

module.exports = config
