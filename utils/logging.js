const {
  createLogger,
  transports,
  format,
  level,
} = require('winston');
require('winston-mongodb');

const loggingFormat = format.combine(
  format.timestamp(),
  format.json(),
  format.printf(info => {
    return `[${info.level.toUpperCase().padEnd(7)}] - ${
      info.message
    } - ${info.timestamp} - ${info.user}`;
  }),
  format.metadata()
);

const logger = createLogger({
  format: loggingFormat,
  // level: 'debug',
  transports: [
    new transports.File({
      filename: 'log.log',
      level: 'info',
      // format: format.combine(format.timestamp(), format.json()),
    }),

    // new transports.Console({
    //   level: 'info',
    //   // format: format.combine(format.timestamp(), format.json()),
    // }),

    new transports.MongoDB({
      level: 'info',
      options: { useUnifiedTopology: true },
      db: process.env.DATABASE.replace(
        '<password>',
        process.env.DATABASE_PASSWORD
      ),
      collection: 'attendence-logs',
      name: 'attendece',
    }),

    // new transports.MongoDB({
    //   level: 'error',
    //   options: { useUnifiedTopology: true },
    //   db: process.env.DATABASE.replace(
    //     '<password>',
    //     process.env.DATABASE_PASSWORD
    //   ),
    //   collection: 'logs',
    // }),
  ],
});

module.exports = logger;
