const { loadSlashCommands } = require('../../handlers/commands');
const { log } = require('../../handlers/logger');

module.exports = async (client) => {
  log(`READY: Logged in as <${client.user.tag}>! Now receiving events and interactions!\n`, 'success');
  loadSlashCommands(client);
};
