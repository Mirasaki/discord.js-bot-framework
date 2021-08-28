const nodePath = require('path');
const { permLevels, validatePermissions } = require('../handlers/permissions');
const { titleCase, getTimeSince } = require('../utils/tools');
const fs = require('fs');
const CommandError = require('../classes/CommandError.js');
const { topLevelCommandFolder } = require('../handlers/commands');
const typeMap = {
  1: 'SUB_COMMAND',
  2: 'SUB_COMMAND_GROUP',
  3: 'STRING',
  4: 'INTEGER',
  5: 'BOOLEAN',
  6: 'USER',
  7: 'CHANNEL',
  8: 'ROLE',
  9: 'MENTIONABLE',
  10: 'NUMBER'
};

module.exports = class Command {
  constructor (func, props) {
    if (typeof func !== 'function') throw new TypeError('Expected a function!');
    else this.run = func;
    this.config = {

      // Permissions
      permLevel: null,
      clientPermissions: [],
      userPermissions: [],

      // Status
      enabled: true,
      required: true,
      nsfw: false,

      // Command Cooldown
      cooldown: {
        usages: 1,
        duration: 2
      },

      // Command State
      globalCommand: false,
      testCommand: true,
      serverIds: [],

      // Slash Command data
      data: {
        name: null,
        description: null,
        category: null,
        options: [],
        defaultPermission: true,
      },
    
      ...props
    };
  }

  getOptions (options) {
    if (
      options == null
      || (typeof options[Symbol.iterator] === 'function') === false
    ) return options;
  
    for (const option of options) {
      if (option.type && !isNaN(option.type)) option.type = typeMap[option.type];
      if (!option.options) option.options = undefined;
      if (
        option.type === 'SUB_COMMAND_GROUP'
        || option.type === 'SUB_COMMAND'
      ) {
        option.required = undefined;
        option.options = this.getOptions(option.options);
      }
      if (option.type === 'SUB_COMMAND' || option.type === 'SUB_COMMAND_GROUP') option.required = undefined;
      if (typeof option.required === 'undefined') {
        (
          option.type === 'SUB_COMMAND_GROUP' || option.type === 'SUB_COMMAND'
            ? option.required = undefined
            : option.required = false
        );
      }
      if (typeof option.choices === 'undefined') option.choices = undefined;
    }
    return options;
  }

  load (client, path) {
    const formattedPath = path.replaceAll(nodePath.sep, '\\');
    const { config } = this;
    
    // If no category is provided, it will default to the parent name folder
    const splitPath = path.split(nodePath.sep);
    if (!config.data.category) {
      nodePath.basename(nodePath.dirname(path)) === topLevelCommandFolder.split('/').pop()
        ? config.data.category = 'Uncategorized'
        : config.data.category = titleCase(splitPath[splitPath.length - 2]);
    }

    // Permissions
    if (permLevels[config.permLevel] === undefined) throw new CommandError({
      path: formattedPath,
      message: `Unsupported permission level! Supported values are: [${Object.keys(permLevels).join(', ')}]`
    });
    if (typeof config.clientPermissions === 'string') config.clientPermissions = [config.clientPermissions];
    const invalidClientPerms = validatePermissions(config.clientPermissions);
    if (invalidClientPerms[0]) throw new CommandError({
      path: formattedPath,
      message: `Invalid clientPermissions provided: [${invalidClientPerms.join(', ')}]`
    });
    if (typeof config.userPermissions === 'string') config.userPermissions = [config.userPermissions];
    const invalidUserPerms = validatePermissions(config.userPermissions);
    if (invalidUserPerms[0]) throw new CommandError({
      path: formattedPath,
      message: `Invalid userPermissions provided: [${invalidUserPerms.join(', ')}]`
    });
    
    // Status
    if (typeof config.enabled !== 'boolean') config.enabled = true;
    if (typeof config.required !== 'boolean') config.required = false;
    if (typeof config.nsfw !== 'boolean') config.nsfw = false;
    
    // Command Cooldown
    let { cooldown } = config;
    if (cooldown === undefined) cooldown = { usages: 1, duration: 2 };
    else if (cooldown.usages === undefined || cooldown.duration === undefined) {
      for (const [key, value] of Object.entries(cooldown)) {
        if (typeof value !== 'number') cooldown[key] = Number(value);
      }
      if (!cooldown[0]) cooldown = { usages: 1, duration: 2 };
    }
    
    // Slash Command Data
    const { data } = config;
    if (!data.name) data.name = splitPath[splitPath.length - 1].slice(0, splitPath.lastIndexOf('.') - 2);
    data.options = Array.isArray(data.options) ? this.getOptions(data.options) : [];
    data.type = 'CHAT_INPUT';
    if (!data.description) throw new CommandError({
      path: formattedPath,
      message: 'No description was provided, this is required!'
    });
    
    // Checking if a single or multiple Component Listeners were provided
    if (!Array.isArray(config.listeners)) config.listeners = [config.listeners];
    
    const fileStats = fs.statSync(path);
    config._fileStats = {
      path,
      pathFromProjectRoot: path.slice(path.indexOf(topLevelCommandFolder), path.length),
      size: fileStats.size + ' bytes',
      created: getTimeSince(fileStats.birthtimeMs) + ' ago',
      lastEdit: getTimeSince(fileStats.mtimeMs) + ' ago'
    };
    client.commands.set(data.name, this);  
  }

  reload (client) {
    const config = this.config;
    const path = config._fileStats.path;
    const module = require.cache[require.resolve(path)];
    delete require.cache[require.resolve(path)];
    for (let i = 0; i < module.children.length; i++) {
      if (module.children[i] === module) {
        module.children.splice(i, 1);
        break;
      }
    }
    client.commands.delete(config.data.name);
    const newCmd = require(path);
    newCmd.load(client, path);
  }
};
