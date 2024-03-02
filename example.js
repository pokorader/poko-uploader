'use strict'

const Hapi = require('hapi')

const server = new Hapi.Server()
server.connection({ port: 8080 })

server.register({
  register: require('./lib/index'),
  options: {
    upload: {path: './'}
  }
}, (err) => {
  if (err) {
    console.log('Failed loading plugin', err)
    process.exit(1)
  }
  server.start((err) => {
    if (err) {
      console.log('Failed to start the server', err)
      process.exit(1)
    }
    console.log('Server running on - ' + server.info.port)
  })
})
