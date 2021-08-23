const { loadSlashCommands } = require('../../handlers/commands');
const { log } = require('../../handlers/logger');

module.exports = async (client) => {
  log('READY: Now receiving events and interactions', 'success');
  log(`Logged in as ${client.user.tag}\n`, 'info');
  loadSlashCommands(client);
};
