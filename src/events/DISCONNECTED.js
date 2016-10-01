'use strict'

// Required modules
const Events = require('discordie').Events
const logger = require('../lib/logger.js')

// DISCONNECTED event processing
module.exports = function (client) {
  client.Dispatcher.on(Events.DISCONNECTED, function (e) {
    // Log the error
    logger.error('Disconnected from Discord App:')
    logger.error('' + e.error)

    // Kill the process
    process.exit(1)
  })
}
