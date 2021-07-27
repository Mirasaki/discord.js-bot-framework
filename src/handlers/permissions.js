// https://discord.com/developers/docs/topics/permissions

const { getSettings } = require('../mongo/helpers/settings');
const levelCache = {};

module.exports.specialPermissions = {
    support: [],
    admins: [],
    developers: ['290182686365188096']
};

module.exports.getLevelCache = () => {
    checkLevelCache();
    return levelCache;
};

module.exports.getPermissionLevel = async (message) => {

    let permLevel = {
        permissionLevel: 0,
        permissionName: 'User'
    };

    const permOrder = permissionLevels.slice(0).sort((a, b) => a.level < b.level ? 1 : -1);

    while (permOrder.length) {
        const currentLevel = permOrder.shift();
        if (await currentLevel.hasLevel(message)) {
            permLevel = {
                permissionLevel: currentLevel.level,
                permissionName: currentLevel.name
            };
            break;
        }
    }

    return permLevel;

};

module.exports.checkPermissionLevel = async (message, cmd) => {
    checkLevelCache();
    const { permissionLevel, permissionName } = await this.getPermissionLevel(message);
    const permLevel = {
        permissionLevel,
        permissionName,
        willPass: permissionLevel < levelCache[cmd.config.permLevel] ? false : true
    };
    return permLevel;
};

module.exports.checkDiscordPermissions = (client, message, cmd) => {

    let permissions = cmd.config.clientPermissions;
    if (permissions.length && typeof permissions === 'string') permissions = [permissions];

    let userPermissions = cmd.config.userPermissions;
    if (userPermissions.length && typeof permissions === 'string') userPermissions = [userPermissions];

    let botPermsAreValid = true;
    let userPermsAreValid = true;

    if (!message.guild.me.hasPermission('ADMINISTRATOR')) {
        if (!message.channel.permissionsFor(client.user.id)) {
            botPermsAreValid = permissions;
        } else {
            const missingBotPermissions = permissions.filter(perm => !message.channel.permissionsFor(client.user.id).has(perm));
            if (missingBotPermissions.length >= 1) botPermsAreValid = missingBotPermissions;
        }
    }

    if (!message.member.hasPermission('ADMINISTRATOR')) {
        if (!message.channel.permissionsFor(message.author.id)) {
            userPermsAreValid = userPermissions;
        } else {
            const missingUserPermissions = userPermissions.filter(perm => !message.channel.permissionsFor(message.author.id).has(perm));
            if (missingUserPermissions.length >= 1) userPermsAreValid = missingUserPermissions;
        }
    }

    return {
        missingBotPermissions: botPermsAreValid,
        missingUserPermissions: userPermsAreValid,
        willPass: typeof botPermsAreValid === 'boolean' && typeof userPermsAreValid === 'boolean' ? true : false
    };

};

module.exports.validatePermissions = (permissions, name) => {
    for (const permission of permissions) {
        if (!validPermissions.includes(permission)) {
            throw new Error(`Unknown permission node "${permission}" called in ${name}.js`);
        }
    }
};

const checkLevelCache = () => {
    if (!levelCache.size) {
        for (let i = 0; i < permissionLevels.length; i++) {
            const thisLevel = permissionLevels[i];
            levelCache[thisLevel.name] = thisLevel.level;
        }
    }
};

const permissionLevels = [

    {
        level: 0,
        name: 'User',
        hasLevel: () => true
    },

    {
        level: 1,
        name: 'Helper',
        hasLevel: async (message) => {
            const guildSettings = await getSettings(message.guild.id);
            const helperRole = message.guild.roles.cache.get(guildSettings.permissions.helper_role);
            if (helperRole && message.member.roles.cache.has(helperRole.id)) return true;
            return false;
        }
    },

    {
        level: 2,
        name: 'Moderator',
        hasLevel: async (message) => {
            const guildSettings = await getSettings(message.guild.id);
            const modRole = message.guild.roles.cache.get(guildSettings.permissions.mod_role);
            if (modRole && message.member.roles.cache.has(modRole.id)) return true;
            return false;
        }
    },

    {
        level: 3,
        name: 'Administrator',
        hasLevel: async (message) => {
            if (message.member.hasPermission('ADMINISTRATOR')) return true;
            const guildSettings = await getSettings(message.guild.id);
            const adminRole = message.guild.roles.cache.get(guildSettings.permissions.admin_role);
            if (adminRole && message.member.roles.cache.has(adminRole.id)) return true;
            return false;
        }
    },

    {
        level: 4,
        name: 'Server Owner',
        hasLevel: (message) => {
            if (!message.guild || !message.guild.owner || !message.guild.ownerID) return false;
            if (message.author.id == message.guild.ownerID) return true;
            return false;
        }
    },

    {
        level: 5,
        name: 'Bot Support',
        hasLevel: (message) => this.specialPermissions.support.includes(message.author.id)
    },

    {
        level: 6,
        name: 'Bot Administrator',
        hasLevel: (message) => this.specialPermissions.admins.includes(message.author.id)
    },

    {
        level: 7,
        name: 'Developer',
        hasLevel: (message) => this.specialPermissions.developers.includes(message.author.id)
    },

    {
        level: 8,
        name: 'Bot Owner',
        hasLevel: (message) => message.author.id == process.env.OWNER_ID
    }

];

const validPermissions = [
    'ADMINISTRATOR',
    'CREATE_INSTANT_INVITE',
    'KICK_MEMBERS',
    'BAN_MEMBERS',
    'MANAGE_CHANNELS',
    'MANAGE_GUILD',
    'ADD_REACTIONS',
    'VIEW_AUDIT_LOG',
    'PRIORITY_SPEAKER',
    'STREAM',
    'VIEW_CHANNEL',
    'SEND_MESSAGES',
    'SEND_TTS_MESSAGES',
    'MANAGE_MESSAGES',
    'EMBED_LINKS',
    'ATTACH_FILES',
    'READ_MESSAGE_HISTORY',
    'MENTION_EVERYONE',
    'USE_EXTERNAL_EMOJIS',
    'VIEW_GUILD_INSIGHTS',
    'CONNECT',
    'SPEAK',
    'MUTE_MEMBERS',
    'DEAFEN_MEMBERS',
    'MOVE_MEMBERS',
    'USE_VAD',
    'CHANGE_NICKNAME',
    'MANAGE_NICKNAMES',
    'MANAGE_ROLES',
    'MANAGE_WEBHOOKS',
    'MANAGE_EMOJIS'
];
