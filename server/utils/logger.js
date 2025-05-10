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
 */
const logLevel = process.env.LOG_LEVEL || 'warn';

const logFormat = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: defaultLogTimestampFormat }),
  winston.format.printf((log) => `${log.timestamp} [${log.level[0].toUpperCase()}] ${log.message}`),
);

const logFile = process.env.LOG_FILE || `${process.cwd()}/logs/planka.log`;

// eslint-disable-next-line new-cap
const customLogger = new winston.createLogger({
  transports: [
    new winston.transports.File({
      level: logLevel,
      format: logFormat,
      filename: logFile,
    }),
    new winston.transports.Console({
      level: logLevel,
      format: logFormat,
    }),
  ],
});

module.exports = {
  customLogger,
};
