module.exports = (client, message) => {
  if (message.content === 't') {
    client.emit('guildCreate', (message.guild));
  }
};
