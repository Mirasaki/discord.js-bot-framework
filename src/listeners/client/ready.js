const { loadSlashCommands, checkExpired } = require('../../handlers/commands');
const { log } = require('../../handlers/logger');

module.exports = async (client) => {
  log(`READY: Logged in as <${client.user.tag}>! Now receiving events and interactions!\n`, 'success');
  await checkExpired(client);
  await loadSlashCommands(client);
  client.user.setPresence({
    status: 'online',
    activities: [
      {
        name: 'Slash Commands',
        type: 'LISTENING' 
      }
    ]
  });
};
