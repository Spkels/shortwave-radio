'use strict'

// Required modules
const Discordie = require('discordie')
const Events = require('discordie').Events
const fs = require('fs')
const http = require('https')
const logger = require('./logger.js')
const path = require('path')

function generateQueue () {
  var output = []

  for (var i = 0; i < 10; i++) {
    output.push({
      title: new Buffer(String(Math.random()*100)).toString('base64'),
      length: Math.floor(Math.random()*1000),
      service: 'ShortwaveRadio',
      identifier: new Buffer(String(Math.random()*100)).toString('base64'),
      social: {
        likes: 0,
        dislikes: 0
      }
    })
  }

  return output
}

function shuffle (array) {
  var currentIndex = array.length
  var temporaryValue
  var randomIndex

  while (0 !== currentIndex) {

    randomIndex = Math.floor(Math.random() * currentIndex)
    currentIndex -= 1
    
    temporaryValue = array[currentIndex]
    array[currentIndex] = array[randomIndex]
    array[randomIndex] = temporaryValue
  }

  return array;
}

// Run the number bot
exports.run = function (db) {
  return new Promise((resolve, reject) => {
    let client = new Discordie()
    let channels = []
    let channelsMovement = []

    client.Dispatcher.on(Events.GATEWAY_READY, () => {
      logger.info(`Logged in as ${client.User.username}, ready to spook.`)

      client.Channels.get(process.env['BOT_LOGCHANNEL']).sendMessage('Let us begin the ritual, my children. 👀')
      client.Guilds.get(process.env['BOT_GUILDID']).voiceChannels.forEach(chan => {
        channels.push({id: chan.id, position: chan.position, name: chan.name})
        channelsMovement.push(chan.id)
      })

      channelsMovement = shuffle(channelsMovement)

      client.Guilds.get(process.env['BOT_GUILDID']).voiceChannels.forEach(chan => {
        chan.setPosition(channelsMovement.indexOf(chan.id))
        chan.update(new Buffer(String(Math.random()*100)).toString('base64'))
      })

      client.Guilds.get(process.env['BOT_GUILDID']).createChannel('voice', '???').then(vChan => {
        vChan.setPosition(0)
        vChan.join().then(v => {
          let iconPool = fs.readdirSync(path.join(__dirname, '..', 'icons'))
          let stop = false

          fs.readFile(path.join(__dirname, '..', 'default.png'), null, (err, icon) => {
            if (!err) {
              client.Guilds.get(process.env['BOT_STAFFGUILD']).edit(null, icon, null, undefined, null, null)
            }
          })

          // Set server icon every minute
          function setIcon () {
            if (stop) return

            var i = Math.floor(Math.random() * iconPool.length)
            var icon = iconPool[i]
            iconPool.splice(i, 1)

            fs.readFile(path.join(__dirname, '..', 'icons', icon), null, (err, icon) => {
              if (!err) {
                client.Guilds.get(process.env['BOT_GUILDID']).edit(null, icon, null, undefined, null, null)
              }
              setTimeout(setIcon, 3*60*1000)
            })
          }
          setIcon()

          // Set database info every 10s
          let now = new Date()
          function setDb () {
            if (stop) return

            db.get('queue').update({bot: '???'}, {
              $set: {
                bot: '???',
                playStart: now,
                queue: generateQueue(),
                current: {
                  title: new Buffer(String(Math.random()*100)).toString('base64'),
                  length: Math.floor(Math.random()*1000),
                  service: 'ShortwaveRadio',
                  identifier: new Buffer(String(Math.random()*100)).toString('base64'),
                  social: {
                    likes: 0,
                    dislikes: 0
                  }
                }
              }
            }, { upsert: true })

            setTimeout(setDb, 30*1000)
          }
          setDb()

          let pool = fs.readdirSync(path.join(__dirname, '..', 'audio'))
          let played = []
          let finish = new Date((new Date()).getTime() + (5*60*1000)) // 5 minutes

          // Loop playing until we've passed the finish time
          function loopPlay () {
            if (new Date() > finish) {
              stop = true

              fs.readFile(path.join(__dirname, '..', 'default.png'), null, (err, icon) => {
                if (!err) {
                  client.Guilds.get(process.env['BOT_GUILDID']).edit(null, icon, null, undefined, null, null)
                }
              })

              fs.readFile(path.join(__dirname, '..', 'staff.png'), null, (err, icon) => {
                if (!err) {
                  client.Guilds.get(process.env['BOT_STAFFGUILD']).edit(null, icon, null, undefined, null, null)
                }
              })

              db.get('queue').remove({bot: '???'})

              let members = v.voiceConnection.channel.members
              var count = members.length

              for (var i = 0; i < members.length; i++) {
                if (members[i].id != client.User.id && client.Guilds.get(process.env['BOT_GUILDID']).afk_channel_id) members[i].setChannel(client.Guilds.get(process.env['BOT_GUILDID']).afk_channel_id)
              }

              v.voiceConnection.disconnect()

              setTimeout(function () {
                vChan.delete().then(() => {
                  client.Guilds.get(process.env['BOT_GUILDID']).voiceChannels.forEach(chan => {
                    channels.forEach(ch => {
                      if (chan.id === ch.id) {
                        chan.setPosition(ch.position)
                        chan.update(ch.name)
                      }
                    })
                  })
        
                  client.Channels.get(process.env['BOT_LOGCHANNEL']).sendMessage('End of transmission. Enlightened ' + (count - 1) + ' disciples.\nPlayed ' + played.join(', ') + '.')
                  resolve(count)
                  client.disconnect()
                }).catch(e => {
                  logger.error(`Problem deleting transmission channel: ${e.message}`)
                })
              }, 1000)

              return
            }

            var i = Math.floor(Math.random() * pool.length)
            var track = pool[i]
            played.push(track)
            pool.splice(i, 1)

            var encoder = v.voiceConnection.createExternalEncoder({
              type: 'ffmpeg',
              source: path.join(__dirname, '..', 'audio', track)
            })

            encoder.play()
            encoder.on('end', loopPlay)
          }

          loopPlay()
        }).catch(reject)
      }).catch(reject)
    })

    // Do it for the vine
    client.connect({ token: process.env['DISCORD_NUMBERTOKEN'] })
  })
}
