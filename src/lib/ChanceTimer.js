'use strict'

// Required modules
const EventEmitter = require('events').EventEmitter

/**
 * Chance timer: a timer that runs a chance operation on each elapsed time
 * period. Emits "interval" and "run" when stuff happens.
 */
class ChanceTimer extends EventEmitter {

  /**
   * @param {number} freq Frequency to calculate chance in ms.
   * @param {number} chance Chance as decimal.
   */
  constructor (freq, chance) {
    super()

    if (typeof freq !== 'number') {
      throw new Error('freq is not a number')
    }
    if (typeof chance !== 'number') {
      throw new Error('chance is not a number')
    }

    this._freq = freq
    this._chance = chance
  }

  /**
   * Get timer status.
   * @return {boolean}
   */
  get status () {
    return this._intervalId !== undefined || this._intervalId !== null
  }

  /**
   * Start timer.
   */
  start () {
    if (this.status === true) {
      return
    }

    this._intervalId = setInterval(this._run, this._freq)
  }

  /**
   * Stop timer.
   */
  stop () {
    if (this.status === false) {
      return
    }

    clearInterval(this._intervalId)
    this._intervalId = null
  }

  /**
   * Internal interval function.
   */
  _run () {
    this.emit('interval')

    if (Math.random() > this._chance) {
      this.emit('run')
    }
  }
}

// Expose ChanceTimer
module.exports = ChanceTimer
