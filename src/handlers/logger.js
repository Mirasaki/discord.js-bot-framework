const { createLogger: CreateLogger, format, transports, addColors } = require('winston')
const { combine, timestamp, prettyPrint, colorize, printf } = format

const colors = {
  error: 'redBG bold white',
  warn: 'redBG black',
  info: 'blueBG white'
}

const date = new Date().toLocaleTimeString()
const logFormat = printf(function (info) {
  return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`
})

const customFormat = combine(
  timestamp(),
  prettyPrint()
)

addColors(colors)
const logger = CreateLogger({
  transports: [
    new (transports.Console)({
      format: combine(
        colorize(),
        logFormat
      )
    }),
    new transports.File({
      level: 'error',
      format: customFormat,
      filename: 'logs/error.log'
    }),
    new transports.File({
      level: 'warn',
      format: combine(
        timestamp(),
        prettyPrint()
      ),
      filename: 'logs/warn.log'
    }),
    new transports.File({
      level: 'info',
      format: customFormat,
      filename: 'logs/info.log'
    }),
    new transports.File({
      level: 'debug',
      format: customFormat,
      filename: 'logs/debug.log'
    }),
    new transports.File({
      format: customFormat,
      filename: 'logs/combined.log'
    })
  ]
})

module.exports = logger
