// @flow

import { createLogger, format, prettyPrint, transports } from 'winston'

// TODO Implement loggin/monitoring for all microservice instances

const options = {
  file: {
    handleExceptions: true,
    json: true,
    maxsize: 5242880, // 5MB
    maxFiles: 5,
    colorize: false,
  },
  console: {
    level: 'debug',
    handleExceptions: true,
    json: false,
    colorize: true,
  },
}

const logger = createLogger({
  level: 'info',
  format: format.combine(
    format.timestamp(),
    format.prettyPrint(),
    format.splat(),
    format.simple(),
  ),
  transports: [
    new transports.File({
      filename: 'logs/error.log',
      level: 'error',
      ...options.file,
    }),
    new transports.File({ filename: 'logs/combined.log', ...options.file }),
  ],
})

if (process.env.NODE_ENV !== 'production') {
  logger.add(new transports.Console(options.console))
}

export default logger
