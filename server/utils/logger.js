/*!
 * Copyright (c) 2024 PLANKA Software GmbH
 * Licensed under the Fair Use License: https://github.com/plankanban/planka/blob/master/LICENSE.md
 */

const winston = require('winston');

/**
 * The default timestamp used by the logger.
 * Format example: "2022-08-18 6:30:02"
 */
const defaultLogTimestampFormat = 'YYYY-MM-DD HH:mm:ss';

/**
 * Log level for both console and file log sinks.
 *
 * Refer {@link https://github.com/winstonjs/winston#logging here}
 * for more information on Winston log levels.
 *
 * Whether LOG_LEVEL names a level Winston actually has is settled in
 * config/log.js, which resets the level of every transport built below once it
 * knows. Deciding it a second time here is how the two answers drift apart.
 */
const logLevel = process.env.LOG_LEVEL || 'warn';

const logFormat = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: defaultLogTimestampFormat }),
  winston.format.printf((log) => `${log.timestamp} [${log.level[0].toUpperCase()}] ${log.message}`),
);

/**
 * Everything is written to the console as well, and that is what Docker and
 * Kubernetes collect. The file is therefore a second copy: useful on a host
 * where nobody reads `docker logs`, redundant where a log collector is already
 * running — and there it also fills up the container's ephemeral storage.
 *
 * The transport has to be left unbuilt rather than added and removed again:
 * Winston creates the directory and opens the file inside the constructor, so
 * a transport that is built and then dropped stops writing but still leaves an
 * empty logs/planka.log behind, on every start, forever.
 *
 * Set LOG_FILE=none to keep the console output only.
 */
const logFile = process.env.LOG_FILE || `${process.cwd()}/logs/planka.log`;
const isLogFileEnabled = logFile !== 'none';

/**
 * Without a bound the file grows for as long as the process runs, and the first
 * anyone hears of it is a full disk. Ten megabytes across three files is far
 * more than a `warn`-level log produces in normal operation, and still bounded
 * when the level is turned up to debug to chase something.
 *
 * `tailable` keeps the newest lines in the file LOG_FILE actually names, so
 * whatever was reading that path — `tail -f`, a collector, a support request
 * asking for logs/planka.log — goes on finding them where it found them before.
 */
const LOG_FILE_MAX_SIZE = 10 * 1024 * 1024;
const LOG_FILE_MAX_COUNT = 3;

const transports = [
  new winston.transports.Console({
    level: logLevel,
    format: logFormat,
  }),
];

if (isLogFileEnabled) {
  transports.unshift(
    new winston.transports.File({
      level: logLevel,
      format: logFormat,
      filename: logFile,
      maxsize: LOG_FILE_MAX_SIZE,
      maxFiles: LOG_FILE_MAX_COUNT,
      tailable: true,
    }),
  );
}

// eslint-disable-next-line new-cap
const customLogger = new winston.createLogger({
  transports,
});

module.exports = {
  customLogger,
};
