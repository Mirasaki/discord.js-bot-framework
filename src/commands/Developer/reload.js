const Command = require('../../classes/Command');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  const commandName = args[0].value;
  const command = client.commands.get(commandName);

  if (!command) {
    return interaction.reply({
      content: `${emojis.response.error} That is not a valid command!`,
      ephemeral: true
    });
  }

  try {
    command.reload(client);
    interaction.reply({
      content: `${emojis.response.success} Successfully reloaded **${command.config.data.name}**!`
    });
  } catch (err) {
    interaction.reply({
      content: `${emojis.response.error} An error has occured while re-loading **${command.config.data.name}**, click to reveal:\n\n||${err.stack || err}||`,
      ephemeral: true
    });
    console.log(err.stack || err);
  }
}, {
  permLevel: 'Developer',
  data: {
    description: 'Reload a command',
    options: [
      {
        name: 'command',
        description: 'The command to reload',
        required: true,
        type: 3
      }
    ],
  }
});
