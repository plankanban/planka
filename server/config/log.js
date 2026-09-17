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

/* eslint-disable no-console */

const winston = require('winston');

// The levels Winston actually has. Every other logger anyone has used has
// `trace`; Winston does not, and a name it does not recognise is not a quieter
// setting but no setting at all — the comparison never passes, the process
// runs completely mute, and nothing says why.
const LEVELS = Object.keys(winston.config.npm.levels);

// What utils/logger.js settles on when LOG_LEVEL is unset. Restated here
// rather than imported because it is the behaviour being promised unchanged.
const DEFAULT_LEVEL = 'warn';

// Said with console rather than through the logger: the logger is the thing
// being configured, and at this point it may be about to swallow everything.
const warn = (message) => console.warn(`Warning: ${message}`);

const resolveLevel = () => {
  if (!process.env.LOG_LEVEL) {
    return DEFAULT_LEVEL;
  }

  if (LEVELS.includes(process.env.LOG_LEVEL)) {
    return process.env.LOG_LEVEL;
  }

  warn(
    `LOG_LEVEL is set to "${process.env.LOG_LEVEL}", which is not a level PLANKA can log at. ` +
      `The levels are: ${LEVELS.join(', ')}. Logging at "${DEFAULT_LEVEL}" instead.`,
  );

  return DEFAULT_LEVEL;
};

// Which levels go to stderr instead of stdout. Empty unless asked for, because
// every existing instance sends all of it to stdout and where somebody's
// output lands is not a thing to change under them. `LOG_STDERR_LEVELS=error,warn`
// is what a container log pipeline wants, so that a failure is distinguishable
// from a routine line without anything having to parse it.
const resolveStderrLevels = () => {
  const levels = (process.env.LOG_STDERR_LEVELS || '')
    .split(',')
    .map((level) => level.trim())
    .filter((level) => level);

  const unknownLevels = levels.filter((level) => !LEVELS.includes(level));

  if (unknownLevels.length > 0) {
    warn(
      `LOG_STDERR_LEVELS names ${unknownLevels.join(', ')}, which PLANKA cannot log at. ` +
        `The levels are: ${LEVELS.join(', ')}. Ignoring those, keeping the rest.`,
    );
  }

  return levels.filter((level) => LEVELS.includes(level));
};

// utils/logger.js fixes the level of each transport the moment it is required,
// which is before anything here has had a chance to read what LOG_LEVEL says,
// so the settled values are applied to the transports it already built. The
// console one is replaced rather than adjusted because `stderrLevels` is only
// taken by the constructor; its format is carried across so that there stays
// exactly one definition of what a log line looks like.
const applyToCustomLogger = () => {
  // eslint-disable-next-line global-require
  const { customLogger } = require('../utils/logger');

  const level = resolveLevel();
  const stderrLevels = resolveStderrLevels();

  const consoleTransport = customLogger.transports.find(
    (transport) => transport instanceof winston.transports.Console,
  );

  customLogger.transports.forEach((transport) => {
    // eslint-disable-next-line no-param-reassign
    transport.level = level;
  });

  if (consoleTransport) {
    customLogger.remove(consoleTransport);

    customLogger.add(
      new winston.transports.Console({
        level,
        format: consoleTransport.format,
        stderrLevels,
      }),
    );
  }
};

// That logger is only wired up in production, and requiring it opens the log
// file as a side effect — so outside production there is nothing here to
// configure, and nothing that should be created by looking.
if (process.env.NODE_ENV === 'production') {
  applyToCustomLogger();
}

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
   * > In production the custom Winston logger wired up in config/env/production.js
   * > does the filtering, at the level resolved from LOG_LEVEL above.
   *
   */
  // level: 'info',
};
