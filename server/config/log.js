/**
 * Built-in Log Configuration
 * (sails.config.log)
 *
 * Configure the log level for your app, as well as the transport
 * (Underneath the covers, Sails uses Winston for logging, which
 * allows for some pretty neat custom transports/adapters for log messages)
 *
 * For more information on the Sails logger, check out:
 * https://sailsjs.com/docs/concepts/logging
 */

const { customLogger } = require('../utils/logger');

module.exports.log = {
  /**
   *
   * Valid `level` configs: i.e. the minimum log level to capture with
   * sails.log.*()
   *
   * The order of precedence for log levels from lowest to highest is:
   * silly, verbose, info, debug, warn, error
   *
   * You may also set the level to "silent" to suppress all logs.
   *
   */

  /**
   * Passthrough plain log message(s) to
   * custom Winston console and file logger.
   *
   * Note that Winston's log levels override Sails' log levels.
   * Refer: https://github.com/winstonjs/winston#logging
   */
  custom: customLogger,
  inspect: false,

  /**
   * Removes the Sail.js init success logs
   * (ASCII ship art) for production instances.
   */
  noShip: process.env.NODE_ENV === 'production',
};
