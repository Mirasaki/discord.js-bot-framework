const { exec } = require('child_process');
const { MessageEmbed } = require('discord.js');
const Command = require('../../classes/Command');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  const startTime = process.hrtime();
  exec(args[0].value, (err, consoleOutput) => {

    const stopTime = process.hrtime(startTime);

    const execEmbed = new MessageEmbed()
      .setColor(client.json.colors.main)
      .setDescription(`\`\`\`xl\n${consoleOutput || err}\`\`\``)
      .addField('Time Taken', `\`\`\`fix\n${(((stopTime[0] * 1e9) + stopTime[1])) / 1e6}ms\`\`\``, true);

    if (consoleOutput.length <= 2000) {
      interaction.reply({
        embeds: [execEmbed]
      });
    } else {
      interaction.reply({
        content: 'Content too long, output:',
        files: [{
          attachment: Buffer.from(consoleOutput),
          name: 'execOutput.txt'
        }]
      });
    }

  });
}, {
  permLevel: 'Developer',
  data: {
    description: 'Execute console commands',
    clientPermissions: ['ATTACH_FILES', 'EMBED_LINKS'],
    options: [
      {
        type: 'STRING',
        name: 'command',
        description: 'The console command to execute',
        required: true
      }
    ]
  }
});
