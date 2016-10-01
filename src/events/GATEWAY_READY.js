'use strict'

// Required modules
const Events = require('discordie').Events
const logger = require('../lib/logger.js')

// GATEWAY_READY event logging
module.exports = function (client) {
  client.Dispatcher.on(Events.GATEWAY_READY, function (e) {
    logger.info('(re)Connected to Discord App successfully.')
  })
}
