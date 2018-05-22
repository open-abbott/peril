const config = require('../config')
const events = require('./events')
const http = require('http')
const static = require('node-static')

const fileServer = new static.Server( '../../public', { cache: false } )

const server = http.createServer((request, response) => {
    request.setEncoding('utf8')
    request.on('end', () => {
        console.debug(`Request for ${request.url}`)
        fileServer.serve(request, response, (error, result) => {
            // handle 404s and the like from error.status
        })
    })
    request.resume()
})

server.listen(config.server.port)
const io = require('io')(server)

io.on('connection', socket => {
    Object.keys(events).forEach(event => {
        const name = events[event]
        const module = require(`./eventHandlers/${name}`)
        module.register(socket)
    })
})
