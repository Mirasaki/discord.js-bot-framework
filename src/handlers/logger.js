const chalk = require('chalk');
const moment = require('moment');
const { createLogger: CreateLogger, format, transports, addColors } = require('winston');
const { combine, timestamp, prettyPrint, colorize, printf } = format;

const customFormat = combine(
  timestamp(),
  prettyPrint()
);
const colors = {
  error: 'redBG bold white',
  warn: 'redBG black',
  info: 'blueBG white'
};
addColors(colors);

const date = new Date().toLocaleTimeString();
const logFormat = printf(function (info) {
  return `${date}-${info.level}: ${JSON.stringify(info.message, null, 4)}\n`;
});

exports.logger = CreateLogger({
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
});

exports.log = (content, type = 'log') => {
  const timestamp = `[${chalk.yellowBright(`${moment().format('MM-DD HH:mm:ss')}`)}]`;
  let str = `${timestamp} `;
  switch (type) {
    case 'log': str += `${chalk.bgBlue(type.toUpperCase())}`; break;
    case 'error': str += `${chalk.bgRed(type.toUpperCase())}`; break;
    case 'debug': str += `${chalk.bgMagenta(type.toUpperCase())}`; break;
    case 'warning': str += `${chalk.bgRed(type.toUpperCase())}`; break;
    case 'slash': str += `${chalk.black.bgWhite(type.toUpperCase())}`; break;
    case 'success': str += `${chalk.bgGreen(type.toUpperCase())}`; break;
    case 'info': str += `${chalk.bgWhite(type.toUpperCase())}`; break;
    case 'blank': str = str.slice(0, -1); break;
    default: throw new TypeError(`Unknown type provided! Must be one of: [
      ${chalk.bgBlue('log')},
      ${chalk.bgRedBright('error')},
      ${chalk.bgMagenta('debug')},
      ${chalk.bgRed('warning')},
      ${chalk.black.bgWhite('cmd')},
      ${chalk.black.bgWhite('slash')},
      ${chalk.bgGreen('success')},
      ${chalk.black.bgWhite('info')},
      blank
    ]`);
  }
  str += ` ${content}`;
  console.log(str);
};
