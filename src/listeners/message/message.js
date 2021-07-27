const { getSettingsCache } = require('../../mongo/helpers/settings');
const { checkPermissionLevel, getLevelCache, checkDiscordPermissions } = require('../../handlers/permissions');
const { checkHasRequiredArgs } = require('../../handlers/arguments');
// const { specialPermissions } = require('../../handlers/permissions');
let cmdCooldown = [];
const Discord = require('discord.js');

module.exports = async (client, message) => {

    const { channel, guild, author, member, content } = message;

    if (
        author.bot
        || !guild
        || !guild.available
        || !channel.permissionsFor(client.user.id)
        || !channel.permissionsFor(client.user.id).has('SEND_MESSAGES')
    ) return;

    const tagExecutor = author.toString();

    let guildSettings;
    try { guildSettings = await getSettingsCache(guild.id); }
    catch(err) { return console.log(err); }

    const { prefix } = guildSettings;
    if (content == `<@!${client.user.id}>`) return client.send('no', message, `my prefix here is \`${guildSettings.prefix}\``);
    if (!content.startsWith(prefix)) return;

    const inputArray = content.slice(prefix.length).trim().split(/ +/g);
    const args = inputArray.filter(arg => !arg.startsWith('--'));
    args.flags = inputArray.filter(arg => arg.startsWith('--'));
    const command = args.shift().toLowerCase();
    if (!member) await guild.members.fetch(author);
    const cmd = client.commands.get(command) || client.commands.get(client.aliases.get(command));
    if (!cmd) return;

    const perms = await checkPermissionLevel(message, cmd);
    const { permissionLevel, permissionName } = perms;
    const clientHasEmbedPerm = channel.permissionsFor(client.user.id) && channel.permissionsFor(client.user.id).has('EMBED_LINKS');

    const cmdChannelID = guildSettings.channels.restrict_cmds_channel;
    if (cmdChannelID != null) {
        const cmdChannel = guild.channels.cache.find(c => c.id == cmdChannelID);
        if (
            (cmdChannel
            && member
            && permissionLevel <= 1
        ) &&
            channel.id != cmdChannelID
        ) {
            await message.delete().catch(() => {
                // We don't care if the message was already deleted or we dont perms to do so
            });
            return await channel.send(`${client.extras.noIcon} ${author.toString()}, you can only use commands in **${cmdChannel.toString()}**!`)
            .then((msg) => {
                msg.delete({ timeout: 5000 }).catch(() => {
                    // Once again, we don't care if anyone else deleted our message
                });
            });
        }
    }

    if (!perms.willPass && guildSettings.permissions.permission_notice) {
        const levelCache = getLevelCache();
        const noPermissionEmbed = new Discord.MessageEmbed()
        .setTitle('You do not have permission to use this command!')
        .setColor('RED')
        .setDescription(`Your permission level is ${permissionLevel} (${permissionName})\nThis command requires level ${levelCache[cmd.config.permLevel]} (${cmd.config.permLevel})`);
        if (clientHasEmbedPerm) return channel.send(noPermissionEmbed).then(msg => msg.delete({ timeout: 3500 }));
        else return client.send('no', message, `your permission level is ${permissionLevel} (${permissionName})\nThis command requires level ${levelCache[cmd.config.permLevel]} (${cmd.config.permLevel})`);
    }

    const cmdSpecificPerms = checkDiscordPermissions(client, message, cmd);
    if (!cmdSpecificPerms.willPass) {

        const cmdPermsEmbed = new Discord.MessageEmbed()
        .setColor('RED')
        .setDescription(`**${author.tag}**, the command can't be executed because of missing permissions in ${channel.toString()}!`)
        .setTimestamp();

        const missingBotPerms = cmdSpecificPerms.missingBotPermissions;
        const missingUserPerms = cmdSpecificPerms.missingUserPermissions;
        if (typeof missingBotPerms !== 'boolean') cmdPermsEmbed.addField(`I lack the required permission${missingBotPerms.length === 1 ? '' : 's'}:`, `${missingBotPerms.join('\n').replace(/_/g, ' ').toProperCase()}`, true);
        if (typeof missingUserPerms !== 'boolean') cmdPermsEmbed.addField(`You lack the required permission${missingUserPerms.length === 1 ? '' : 's'}`, `${missingUserPerms.join('\n').replace(/_/g, ' ').toProperCase()}`, true);

        if (clientHasEmbedPerm) return channel.send(cmdPermsEmbed);
        else return client.send('no', message, 'I can\'t execute that command because of missing permissions, however, I can\'t send you the overview because I don\'t have the `Embed Links` permission in this channel!');
    }

    if (guildSettings.disabled_cmds.find(v => v === cmd.help.name)) return channel.send(`${client.extras.noIcon} ${tagExecutor}, the server admins have disabled that command!`);

    if (!checkHasRequiredArgs(prefix, message, cmd, args)) return;

    const cdString = `${author.id}-${guild.id}-${cmd.help.name}-${Date.now() + (cmd.config.cooldown * 1000)}`;
    if (cmd.config.cooldown > 0) {
        const userString = cmdCooldown.find(string => string.startsWith(`${author.id}-${guild.id}-${cmd.help.name}`));
        if (userString) {
            const cdExpires = userString.slice(userString.length - 13, userString.length);
            return channel.send(`${tagExecutor}, you can use \`${cmd.help.name}\` again in ${Math.round((cdExpires - Date.now()) / 1000) === 1 ? '1 second!' : `${Math.round((cdExpires - Date.now()) / 1000)} seconds!`}`);
        }
    }

    console.log(`${permissionName} ${author.tag} used command ${cmd.help.name}`);

    cmd.run({
        client,
        message,
        args,
        guildSettings
    });

    if (
        permissionLevel <= 4
        && cmd.config.cooldown > 0
    ) {
        cmdCooldown.push(cdString);
        setTimeout(() => {
            cmdCooldown = cmdCooldown.filter((string) => {
                return string !== cdString;
            });
        }, cmd.config.cooldown * 1000);
    }
};
