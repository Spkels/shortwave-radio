'use strict'

// Required modules
const Mustache = require('mustache')
const util = require('util')

// Eval response formatting
var responses = {
  regularOutput: '`{{{input}}}` =>\n```xl\n{{{output}}}\n```',
  trueOutput: '`{{{input}}}` => 👍🏻',
  falseOutput: '`{{{input}}}` => 👎🏻',
  undefinedOutput: '`{{{input}}}` => `undefined`',
  nullOutput: '`{{{input}}}` => `null`',
  error: 'You dun goofed... `{{{input}}}` =>\n```\n{{{error}}}\n```'
}

var evalCmd = function (client, message, args) {
  return new Promise(function (resolve, reject) {
    if (args.length === 0) {
      return
    }

    var parts = message.content.substr(3).split(' ')
    parts.shift()
    var evalString = parts.join(' ')

    try {
      var chan = message.channel
      var channel = message.channel
      var server = message.channel.guild
      var guild = message.channel.guild
      var mention = message.mentions.length > 0 ? message.mentions[0] : {}

      var returned = eval(evalString)

      var predefined = [
        [undefined, responses.undefinedOutput],
        [null, responses.nullOutput],
        [true, responses.trueOutput],
        [false, responses.falseOutput]
      ]

      for (var i = 0; i < predefined.length; i++) {
        if (returned === predefined[i][0]) {
          return resolve(message.channel.sendMessage(Mustache.render(predefined[i][1], {input: evalString})))
        }
      }

      var str = util.inspect(returned, { depth: 1 })

      // Strip auth details
      str = str.replace(new RegExp(client.token, 'gi'), '[insert auth token here]')

      // Shorten string so it fits
      if (str.length > 1900) {
        str = str.substr(0, 1897)
        str = str + '...'
      }

      // Send the message
      message.channel.sendMessage(Mustache.render(responses.regularOutput, {input: evalString, output: str}))
        .then(function (msg) {
          // Edit on promise resolution
          if (typeof returned.then === 'function') {
            returned.then((output) => {
              var str = util.inspect(returned, { depth: 1 })

              if (str.length > 1900) {
                str = str.substr(0, 1897)
                str = str + '...'
              }

              resolve(message.edit(Mustache.render(responses.regularOutput, {input: evalString, output: str})))
            })
          } else {
            resolve()
          }
        }).catch(reject)
    } catch (error) {
      message.channel.sendMessage(Mustache.render(responses.error, {input: evalString, error: error}))
      reject()
    }
  })
}

module.exports = {
  name: 'Eval',
  command: 'eval',
  help: {
    description: "Evaluates the given input with Javascript's `eval()` function.",
    usage: '<string to eval>'
  },
  cmd: evalCmd
}
