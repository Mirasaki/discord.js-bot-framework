/* eslint-disable indent */
const { MessageEmbed, MessageActionRow, MessageButton, MessageSelectMenu } = require('discord.js');
const { titleCase, getBotInvite } = require('../../utils/tools');
const { permLevels } = require('../../handlers/permissions');
const { stripIndents } = require('common-tags');
const Command = require('../../classes/Command');
const calledRecently = new Set();

module.exports = new Command(async ({ client, interaction, guildSettings, args, emojis }) => {
  if (calledRecently.has(interaction.channel.id)) {
    return interaction.reply({
      content: `${emojis.response.error} ${interaction.member.toString()}, \`${interaction.commandName}\` is already active in **#${interaction.channel.name}**, please try again later.`,
      ephemeral:  true
    });
  } else calledRecently.add(interaction.channel.id);
  const { channel, member, guild } = interaction;
  const { permissionLevel } = member.perms;

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

  const components = [];
  const authorCommandsSorted = authorCommands.sort((a, b) => a.config.data.name.localeCompare(b.config.data.name));
  const workableCommands = Array.from(authorCommandsSorted, (cmd) => {
    return cmd[1];
  });
  for (let i = 0; i < Math.ceil(authorCommandsSorted.size / 25); i++) {
    const options = Array.from(workableCommands.splice(0, 25), (cmd) => {
      return {
        label: cmd.config.data.name,
        value: cmd.config.data.name,
        description: cmd.config.data.description
      };
    });
    components.push(
      new MessageActionRow()
      .addComponents(new MessageSelectMenu({
        customId: `help_0${i}`,
        placeholder: `Detailed information: ${options[0].label.charAt(0).toUpperCase()}-${options[options.length - 1].label.charAt(0).toUpperCase()}`,
        minValues: 1,
        maxValues: 1,
        options
      }))
    );
  }

  await interaction.reply({
    embeds: [
      new MessageEmbed()
        .setAuthor(client.user.username, client.user.avatarURL({ dynamic: true }) || client.extras.defaultImageLink)
        .setThumbnail(guild.iconURL({ dynamic: true }))
        .setColor(client.json.colors.main)
        .setDescription(embedText)
    ],
    components: components.concat([
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
    ])
  });

  const collector = interaction.channel.createMessageComponentCollector({ componentType: 'SELECT_MENU', time: 120000 });
  collector.on('collect', (i) => {
    if (i.user.id !== interaction.user.id) {
      return i.reply({
        content: `${emojis.response.error} This menu isn't available to you, call the command yourself by typing **/help**.`,
        ephemeral: true
      });
    }
    const command = client.commands.get(i.values[0]);
    const { config } = command;
    const { data } = config;
    const { throttling } = config;
    const fields = [];
    i.reply({
      ephemeral: true,
      embeds: [new MessageEmbed({ fields })
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
        .setFooter('')]
    });
  });

  collector.on('end', () => {
    calledRecently.delete(interaction.channel.id);
  });

  return setTimeout(() => {
    interaction.editReply({
      content: 'This **/help** menu has expired.',
      embeds: [
        new MessageEmbed()
          .setAuthor(client.user.username, client.user.avatarURL({ dynamic: true }) || client.extras.defaultImageLink)
          .setThumbnail(guild.iconURL({ dynamic: true }))
          .setColor(client.json.colors.main)
          .setDescription(embedText)
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
  }, 120000);
}, {
  permLevel: 'User',
  clientPermissions: ['EMBED_LINKS'],
  throttling: {
    usages: 1,
    duration: 120
  },
  globalCommand: true,
  testCommand: false,
  data: {
    description: 'Get help with commands!'
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
