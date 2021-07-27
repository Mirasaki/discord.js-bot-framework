const { loadSlashCommands } = require('../../handlers/commands')
const { logger } = require('../../handlers/logger')

module.exports = async (client) => {
  logger.info(`Logged in as ${client.user.tag}`)
  loadSlashCommands(client)
  if (process.env.NODE_ENV !== 'production') {
    // Only executes in non-production environments
  }
}
