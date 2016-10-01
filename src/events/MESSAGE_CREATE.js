'use strict'

// Required modules
const Events = require('discordie').Events
const logger = require('../lib/logger.js')
const splitargs = require('splitargs')

// MESSAGE_CREATE event processing
module.exports = function (client) {
  return client.Dispatcher.on(Events.MESSAGE_CREATE, function (e) {
    // Prefix for any logs
    var logPrefix = '[' + e.message.channel_id + '] > ' + e.message.author.username + '#' + e.message.author.discriminator + ': '

    // Log the message
    // logger.trace(logPrefix + e.message.content)

    try {
      if (e.message.channel_id === process.env['BOT_MGMNTCHANNEL'] && e.message.content.startsWith('???')) {
        // Process the command
        var parts = e.message.content.substr(3).split(' ')
        var commandName = parts.shift().toLowerCase()
        var args = splitargs(parts.join(' '))

        var command = client.internal.commands[commandName]
        if (typeof command !== 'object' || command === null) return

        // Run the command
        logger.trace(logPrefix + ("Running '" + commandName + "' command."))

        return command.cmd(client, e.message, args)
          .then(() => { logger.trace(logPrefix + ("Sucessfully ran '" + commandName + "' command.")) })
          .catch((err) => { logger.trace(logPrefix + ("Failed to run '" + commandName + "' command:\n" + err)) })
      }
    } catch (error) {
      logger.error(logPrefix + 'Failed to process a message:\n' + error.stack)
    }
  })
}
