'use strict'

// Required modules
const ChanceTimer = require('./lib/ChanceTimer')
const Discordie = require('discordie')
const http = require('https')
const logger = require('./lib/logger.js')

// .env
require('dotenv').config({silent: true})

// Required environment variables
;[
  'BOT_CHANCE', // Chance to stream on each roll as a percentage (should be 10)
  'BOT_FREQUENCY', // Frequency of rolls for broadcasts in minutes (should be 120)
  'BOT_GUILDID', // Guild ID to run in
  'BOT_STAFFGUILD', // Staff guild ID (for setting the default icon to pretend nothing is happening)
  'BOT_LOGCHANNEL', // Channel ID to log statistics and stream events to
  'BOT_MGMNTCHANNEL', // Channel to accept commands from
  'DISCORD_NUMBERTOKEN', // Discord authentication token for the streaming bot
  'DISCORD_WATCHERTOKEN', // Discord authentication token for the commands watcher
  'MONGO_URI', // MongoDB connection URI
  //'PUSHBULLET_KEY' // [?] Pushbullet access token
].forEach(env => {
  if (!process.env.hasOwnProperty(env)) {
    throw new Error(`missing required environment variable "${env}"`)
  }
})

// Create watcher client
const client = new Discordie({ autoReconnect: true })
client.internal = {}

// Connect to MongoDB
const db = require('monk')(process.env['MONGO_URI'])

// Run function
client.internal.run = function () {
  if (client.internal.running) {
    // Already running
    return
  }

  client.internal.running = true
  logger.info('Preparing to spook.')

  if (process.env.hasOwnProperty('PUSHBULLET_KEY')) {
    var options = {
      method: "POST",
      hostname: "api.pushbullet.com",
      port: null,
      path: "/v2/pushes",
      headers: {
        "content-type": "application/json",
        "access-token": process.env['PUSHBULLET_KEY']
      }
    }

    var req = http.request(options, function (res) {
      logger.trace('Successfully pinged pushbullet.')
    })

    req.write(JSON.stringify({
      type: 'note',
      title: '??? (Shortwave Broadcast)',
      body: new Buffer(String(Math.random()*100)).toString('base64'),
      channel_tag: 'discordfm-number-broadcast'
    }))

    req.end()
  }

  require('./lib/numbers.js').run(db).then(function (d) {
    logger.info('Finished enlightening ' + (d - 1) + ' disciples.')
    client.internal.running = false
  }).catch(function (err) {
    logger.error('Failed to spook: ' + err)
    client.internal.running = false
  })
}

// Command injection
client.internal.commands = {
  'eval': require('./commands/eval.js')
}

// Event injection
require('./events/GATEWAY_READY.js')(client)
require('./events/MESSAGE_CREATE.js')(client)
require('./events/DISCONNECTED.js')(client)

// Create timer
if (isNaN(Number(process.env['BOT_FREQUENCY']))) {
  throw new TypeError('invalid BOT_FREQUENCY environment variable')
}
if (isNaN(Number(process.env['BOT_CHANCE']))) {
  throw new TypeError('invalid BOT_CHANCE environment variable')
}

client.internal.timer = new ChanceTimer(Number(process.env['BOT_FREQUENCY'])/60/1000, Number(process.env['BOT_CHANCE']))
client.internal.timer.on('run', client.internal.run)

// Authenticate into DiscordApp
client.connect({
  token: process.env['DISCORD_WATCHERTOKEN']
})
