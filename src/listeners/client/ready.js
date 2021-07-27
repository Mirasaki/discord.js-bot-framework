const { loadSlashCommands } = require('../../handlers/commands')
const logger = require('../../handlers/logger')

module.exports = (client) => {
  logger.info(`Logged in as ${client.user.tag}`)
  // client.application.commands.set([])
  loadSlashCommands(client)
  if (process.env.NODE_ENV !== 'production') {
    // logger.error('error text')
    // logger.warn('warn text')
    // logger.info('info text')
  }
}
