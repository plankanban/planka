const winston = require('winston');

/**
 * The default timestamp used by the logger.
 * Format example: "2022-08-18 6:30:02"
 */
const defaultLogTimestampFormat = 'YYYY-MM-DD HH:mm:ss';

const logfile = `${process.cwd()}/logs/planka.log`;

/**
 * Log level for both console and file log sinks.
 *
 * Refer {@link https://github.com/winstonjs/winston#logging here}
 * for more information on Winston log levels.
 */
const logLevel = 'warn'; // process.env.NODE_ENV === 'production' ? 'info' : 'debug';

const logFormat = winston.format.combine(
  winston.format.uncolorize(),
  winston.format.timestamp({ format: defaultLogTimestampFormat }),
  winston.format.printf((log) => `${log.timestamp} [${log.level[0].toUpperCase()}] ${log.message}`),
);

// eslint-disable-next-line new-cap
const customLogger = new winston.createLogger({
  transports: [
    new winston.transports.File({
      level: logLevel,
      format: logFormat,
      filename: logfile,
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
