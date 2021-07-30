const { loadSlashCommands } = require('../../handlers/commands')
const { logger, log } = require('../../handlers/logger')

module.exports = async (client) => {
  log('READY: Now receiving events and interactions\n', 'success')
  logger.info(`Logged in as ${client.user.tag}`)
  loadSlashCommands(client)
}
