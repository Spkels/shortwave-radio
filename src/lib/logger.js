'use strict'

// Required modules
const winston = require('winston')

// Winston logger.
var logger = new (winston.Logger)({
  levels: { error: 0, warn: 1, info: 2, trace: 3 },
  colors: { error: 'red', warn: 'yellow', info: 'green', trace: 'magenta' },

  transports: [
    new (winston.transports.Console)({
      level: 'trace',
      colorize: true,
      prettyPrint: true
    }),

    new winston.transports.File({
      level: 'debug',
      colorize: false,
      prettyPrint: false,
      timestamp: true,
      filename: './bot.log',
      maxSize: 40000,
      maxFiles: 10,
      json: false
    })
  ]
})

// Log the creation of the logger
logger.info('created winston logger')

// Expose logger
module.exports = logger
