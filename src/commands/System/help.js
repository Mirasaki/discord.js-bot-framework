/* eslint-disable indent */
const { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js');
const { titleCase, getBotInvite } = require('../../utils/tools');
const { permLevels } = require('../../handlers/permissions');
const { stripIndents } = require('common-tags');
const Command = require('../../classes/Command');

module.exports = new Command(({ client, interaction, guildSettings, args, emojis }) => {
  const { channel, member, guild } = interaction;
  const { permissionLevel } = member.perms;

  if (!args[0]) {
    const authorCommands = client.commands.filter(cmd => permLevels[cmd.config.permLevel] <= permissionLevel);
    const commands = authorCommands
      .sort((a, b) => a.config.data.category > b.config.data.category
        ? 1
        : ((a.config.data.name > b.config.data.name && a.config.data.category === b.config.data.category)
          ? 1
          : -1));

    let embedText = '';
    let currentCategory = '';

    commands.forEach(command => {
      const workingCategory = titleCase(command.config.data.category);
      if (currentCategory !== workingCategory) {
        embedText += `\n\n***__${workingCategory}__***\n`;
        currentCategory = workingCategory;
      }
      embedText += `\`${command.config.data.name}\` `;
    });
    return interaction.reply({
      embeds: [
        new MessageEmbed()
          .setAuthor(client.user.username, client.user.avatarURL({ dynamic: true }) || client.extras.defaultImageLink)
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setColor(client.json.colors.main)
          .setDescription(embedText)
          .addField('Detailed Command Information', '**/**help <any command name>')
      ],
      components: [
        new MessageActionRow()
          .addComponents(new MessageButton({
            style: 'LINK',
            label: 'Invite me',
            emoji: '☑️',
            url: getBotInvite(client)
          }),
          new MessageButton({
            style: 'LINK',
            label: 'Get Support',
            emoji: '🙋',
            url: client.json.config.links.supportServer
          })
        )  
      ]
    });
  }

  const commandName = args[0].value.toLowerCase();
  const command = client.commands.get(commandName);
  if (!command) {
    return interaction.reply({
      content: `${emojis.response.error} That's not a valid command!`,
      ephemeral: true
    });
  }
  const { config } = command;
  const { data } = config;
  const { throttling } = config;
  const fields = [];

  if (
    permLevels[config.permLevel]
    > permissionLevel
  ) {
    return interaction.reply({
      content: `${emojis.response.error} ${member}, you don't have permission to use that command!`,
      ephemeral: true
    });
  }

  interaction.reply({
    embeds: [
      new MessageEmbed({ fields })
        .setColor(client.json.colors.main)
        .setAuthor(titleCase(data.name))
        .setDescription(stripIndents`${data.description}${config.nsfw === true ? `\n\n**SFW:** ${emojis.response.error}\n` : '\n\n'
        }**Category:** ${config.data.category}
        **Max Uses:** ${throttling
          ? `${throttling.usages === 1 ? '1 time' : `${throttling.usages} times`} in ${throttling.duration === 1 ? '1 second' : `${throttling.duration} seconds`}`
          : 'No cooldown!'
        }
        ${config.testCommand ? `**Test Command:** ${emojis.response.success}\n` : ''
        }**Can Be Disabled:** ${config.required ? emojis.response.success : emojis.response.error}
        `)
        .addField('My Permissions', `${
          config.clientPermissions[0]
            ? `> ${getPermString(client, config.clientPermissions, channel, client.user.id)}`
            : `> ${emojis.response.success} None required!`
        }`, true)
        .addField('Your Permissions', `${
          config.userPermissions[0]
            ? `> ${getPermString(client, config.userPermissions, channel, member.id)}`
            : `> ${emojis.response.success} None required!`
        }`, true)
        .setFooter('')
    ],
  });

}, {
  permLevel: 'User',
  clientPermissions: ['EMBED_LINKS'],
  throttling: {
    usages: 3,
    duration: 10
  },
  globalCommand: true,
  testCommand: false,
  data: {
    description: 'Get help with commands!',
    options: [
      {
        type: 3,
        name: 'command',
        required: false,
        description: 'The command to receive information for - use /help without this argument to see all your options!'
      }
    ]
  }
});

const getPermString = (client, arr, channel, id) => {
  const temp = [];
  arr.forEach((perm) => {
    const check = channel.permissionsFor(id) && channel.permissionsFor(id).has(perm);
    perm = perm.toLowerCase().split(/[ _]+/);
    for (let i = 0; i < perm.length; i++) perm[i] = perm[i].charAt(0).toUpperCase() + perm[i].slice(1);
    if (check) temp.push(`${client.json.emojis.response.success} ${perm.join(' ')}`);
    else temp.push(`${client.json.emojis.response.error} ${perm.join(' ')}`);
  });
  return temp.join('\n> ');
};
