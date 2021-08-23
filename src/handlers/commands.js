const { Collection } = require('discord.js');
const { getFiles } = require('../utils/tools');
const { validatePermissions, permLevels } = require('./permissions');
const commandPaths = getFiles(process.env.COMMANDS_PATH || 'src/commands', '.js');
const tempCommands = [];
const nodePath = require('path');
const { isEqual } = require('lodash');
const { log } = require('./logger');

module.exports.validateCommands = (client) => {
  client.commands = new Collection();
  const table = [];
  for (const path of commandPaths) {
    const cmd = require(path);
    const res = validateCommand(client, cmd, path);
    client.commands.set(cmd.slash.name, cmd);
    table.push(res);
  }
  console.log();
  log('Successfully validated all commands!', 'success');
  console.table(table.map((cmd) => {
    return {
      command: cmd.split(':')[0].trim(),
      path: cmd.split(':')[1].trim(),
      enabled: cmd.split(':')[2]
    };
  }));
  console.log();
};

module.exports.reloadCommand = (client, cmd) => {
  const { config, slash } = cmd;
  const { path } = config;
  const check = tempCommands.find((e) => e.name === slash.name);
  if (check) tempCommands.splice(tempCommands.indexOf(check), 1);
  const module = require.cache[require.resolve(path)];
  delete require.cache[require.resolve(path)];
  for (let i = 0; i < module.children.length; i++) {
    if (module.children[i] === module) {
      module.children.splice(i, 1);
      break;
    }
  }
  const newCmd = require(path);
  validateCommand(client, newCmd, path);
  client.commands.set(newCmd.slash.name, newCmd);
};

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

const isIterable = (obj) => {
  if (obj == null) return false;
  else return typeof obj[Symbol.iterator] === 'function';
};

const getOptions = (options) => {
  if (!isIterable(options)) return options;
  for (const option of options) {
    if (option.type && !isNaN(option.type)) option.type = typeMap[option.type];
    if (!option.options) option.options = undefined;
    if (
      option.type === 'SUB_COMMAND_GROUP'
      || option.type === 'SUB_COMMAND'
    ) {
      option.required = undefined;
      option.options = getOptions(option.options);
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
};

module.exports.loadSlashCommands = async (client) => {
  const { application } = client;
  const { commands } = application;
  const globalCommands = await commands.fetch();
  const testServer = client.guilds.cache.get(client.json.config.ids.testServer);

  for await (const path of commandPaths) {
    const consoleOutput = [];
    const cmd = require(path);
    const { slash } = cmd;
    const applicationCommandData = {
      name: slash.name,
      description: slash.description,
      options: (
        Array.isArray(slash.options)
          ? getOptions(slash.options)
          : []
      ),
      type: 'CHAT_INPUT',
      defaultPermission: slash.defaultPermission
    };

    let testCommand;
    if (testServer) {
      const allTestServerCommands = await testServer.commands.fetch();
      testCommand = allTestServerCommands.find((e) => (
        e.client.user.id === client.user.id
        && e.name === slash.name
      ));
    }

    const globalCommand = globalCommands.find((e) => e.name === slash.name && e.guildId === null);

    if (slash.enabled === false) {
      consoleOutput.push(`Disabling Slash Command: ${slash.name}`);
      try {
        if (globalCommand) commands.delete(globalCommand) && consoleOutput.push('    G Disabled global command');
        if (testCommand && testServer) testServer.commands.delete(testCommand) && consoleOutput.push('    T Disabled test command');
        for (const entry of client.guilds.cache.filter((guild) => guild.id !== client.json.config.ids.testServer)) {
          const guild = entry[1];
          const guildCmds = await guild.commands.fetch();
          const guildClientCmd = guildCmds.find((e) => e.name === slash.name && e.client.user.id === client.user.id);
          if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && consoleOutput.push(`    S Disabled server specific command for <${guild.name}>`);
        }
      } catch (err) {
        return console.log(`Error encountered while disabling slash command ${slash.name}\n${err.stack || err}`);
      }
      consoleOutput.push(`Successfully Disabled: ${slash.name}\n`);
      console.log(consoleOutput.join('\n'));
      continue;
    }

    consoleOutput.push(`Reloading Slash Command: ${slash.name}`);

    const dataChanged = (commandData, apiData) => (
      commandData.description !== apiData.description
      || !isEqual(applicationCommandData.options, apiData.options)
    );

    if (slash.globalCommand === true) {
      if (globalCommand && dataChanged(applicationCommandData, globalCommand)) commands.edit(globalCommand, applicationCommandData) && consoleOutput.push('    G Editing global command with new data (Can take up to 1 hour to take effect)');
      else if (!globalCommand) commands.create(applicationCommandData) && consoleOutput.push('    G Creating global command (Can take up to 1 hour to take effect)');
    } else if (slash.globalCommand === false && globalCommand) commands.delete(globalCommand) && consoleOutput.push('    G Deleting global command (Can take up to 1 hour to take effect)');

    if (testServer) {
      if (slash.testCommand === true) {
        if (testCommand && dataChanged(applicationCommandData, testCommand)) testServer.commands.edit(testCommand, applicationCommandData) && consoleOutput.push('    T Edited test command with new data');
        else if (!testCommand) testServer.commands.create(applicationCommandData) && consoleOutput.push('    T Created Test Command');
      } else if (slash.testCommand === false && testCommand) testServer.commands.delete(testCommand) && consoleOutput.push('    T Deleted test command');
    }

    if (Array.isArray(slash.serverIds)) {
      for (const entry of client.guilds.cache.filter((guild) => !slash.serverIds.includes(guild.id) && guild.id !== client.json.config.ids.testServer)) {
        const guild = entry[1];
        const guildCmds = await guild.commands.fetch(); 
        const guildClientCmd = guildCmds.find((e) => e.name === slash.name && e.client.user.id === client.user.id);
        if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && consoleOutput.push(`    S Deleted server specific command for <${guild.name}>`);
      }
      for (const serverId of slash.serverIds) {
        const guild = client.guilds.cache.get(serverId);
        if (!guild || guild.id === client.json.config.ids.testServer) continue;
        const guildCmds = await guild.commands.fetch();
        const guildClientCmd = guildCmds.find((e) => e.name === slash.name && e.client.user.id === client.user.id);
        if (!guildClientCmd) guild.commands.create(applicationCommandData) && consoleOutput.push(`    S Created server specific command for <${guild.name}>`);
        else if (guildClientCmd && dataChanged(applicationCommandData, guildClientCmd)) guild.commands.edit(guildClientCmd, applicationCommandData) && consoleOutput.push(`    S Edited server specific command for <${guild.name}>`);
      }
    }
    consoleOutput.push(`Finished Reloading: ${slash.name}\n`);
    if (consoleOutput.length > 2) console.log(consoleOutput.join('\n'));
  }
  log(`Loaded ${globalCommands.size} global slash commands!`, 'success');
  console.table(globalCommands.map((globalCmd) => {
    return {
      name: globalCmd.name,
      description: globalCmd.description
    };
  }));
  if (testServer) {
    const testCommands = await testServer.commands.fetch();
    console.log();
    log(`Loaded ${testCommands.size} test commands!`, 'success');
    console.table(testCommands.map((testCmd) => {
      return {
        name: testCmd.name,
        description: testCmd.description
      };
    }));
  }
};

const validateCommand = (client, cmd, path) => {
  let problems = [];
  path = path.replaceAll(nodePath.sep, '/');
  const shortPath = path.slice(
    path.indexOf(process.env.COMMANDS_PATH), path.length
  );
  const { config, slash } = cmd;
  if (!config || !cmd.run) {
    throw new Error(`CommandExportsValidationError:\nMissing ${
      config
        ? 'exports.run'
        : 'exports.config'
    }\n    at ${shortPath}`);
  }

  const splitPath = path.split('/');

  if (typeof config.enabled === 'undefined') config.enabled = true;
  if (typeof config.required === 'undefined') config.required = true;
  if (typeof config.clientPermissions === 'undefined') config.clientPermissions = [];
  if (typeof config.userPermissions === 'undefined') config.userPermissions = [];
  if (typeof config.throttling === 'undefined') config.throttling = false;
  if (typeof config.nsfw === 'undefined') config.nsfw = false;
  if (typeof slash.name === 'undefined') slash.name = splitPath[splitPath.length - 1].slice(0, -3);
  if (typeof slash.category === 'undefined') slash.category = slash.category === 'commands' ? 'Uncategorized' : splitPath[splitPath.length - 2];
  if (typeof slash.listeners === 'undefined') slash.listeners = [];
  if (typeof slash.testCommand === 'undefined') slash.testCommand = false;
  if (typeof slash.serverIds === 'undefined') slash.serverIds = [];
  if (typeof slash.listeners === 'undefined') slash.listeners = [];
  if (typeof slash.enabled === 'undefined') slash.enabled = true;
  if (typeof slash.globalCommand === 'undefined') slash.globalCommand = true;
  if (typeof slash.options === 'undefined') slash.options = [];
  if (typeof slash.defaultPermission === 'undefined') slash.defaultPermission = true;

  config.path = path;

  const thisObj = { name: slash.name, origin: path };
  const check = tempCommands.find((e) => e.name === slash.name);

  if (check) throw new Error(`CommandExportsValidationError:\nDuplicate Command: ${slash.name} already registered!\nOriginal command: ${check.origin}\nRequested event: ${path}`);
  tempCommands.push(thisObj);
  const logStr = `    ${slash.name}: ${thisObj.origin.slice(
    thisObj.origin.indexOf(process.env.COMMANDS_PATH), thisObj.origin.length
  )}:${
    config.enabled
      ? 'yes'
      : 'no'
  }`;
  if (
    config
    && config.enabled === false
  ) {
    tempCommands.splice(tempCommands.indexOf(thisObj), 1);
    return logStr;
  }

  const confExports = validateExports(configTypes, config);
  if (Array.isArray(confExports)) problems = problems.concat(confExports);

  const slashExports = validateExports(slashTypes, slash);
  if (Array.isArray(slashExports)) problems = problems.concat(slashExports);

  const stopIfInvalid = () => {
    if (problems[0]) {
      problems.push(`    at ${path}`);
      throw new Error(`CommandExportsValidationError:\n${problems.join('\n')}`);
    }
  };

  stopIfInvalid();

  if (permLevels[config.permLevel] === undefined) problems.push(`Unsupported permission level: ${config.permLevel}`);

  const invalidClientPerms = validatePermissions(config.clientPermissions);
  const invalidUserPerms = validatePermissions(config.userPermissions);
  if (invalidClientPerms[0]) invalidClientPerms.forEach((perm) => problems.push(`Invalid clientPermission: "${perm}"`));
  if (invalidUserPerms[0]) invalidUserPerms.forEach((perm) => problems.push(`Invalid userPermission: "${perm}"`));

  if (slash.description.length === 0) problems.push('Invalid slash.description!');

  stopIfInvalid();
  counter = 0;
  return logStr;
};

let counter = 0;
const validateExports = (originalObj, targetObj) => {
  const exports = 'exports.' + (counter === 0 ? 'config' : 'slash');
  const problems = [];
  Object.entries(originalObj).forEach(([key, value]) => {
    const { throttling } = targetObj;
    if (key === 'throttling' && targetObj[key] === false) return;
    if (
      key === 'throttling'
      && throttling
      && throttling !== false
      && (
        !throttling.usages
        || typeof throttling.usages !== 'number'
        || throttling.usages <= 0
        || !throttling.duration
        || typeof throttling.duration !== 'number'
        || throttling.duration <= 0
      )
    ) problems.push(`Invalid ${exports}.throttling property provided.\n    Valid example: throttling: { usages: 2, duration: 20 }`);
    // We turn the eslint warning off because we only touch Objects with hardcoded keys
    // eslint-disable-next-line no-prototype-builtins
    else if (!targetObj.hasOwnProperty(key)) problems.push(`Missing ${exports} property <${key}> (type ${typeof value})`);
    else if (value === 'array' && Array.isArray(targetObj[key]) === false) problems.push(`Wrong ${exports} type ${key}: expected array, received ${typeof targetObj[key]}`);
    else if (value !== 'array' && typeof targetObj[key] !== typeof value) problems.push(`Wrong ${exports} type ${key}: expected ${typeof value} received ${typeof targetObj[key]}>`);
  });
  counter++;
  if (problems[0]) return problems;
  else return true;
};

const configTypes = {
  enabled: true,
  required: true,
  permLevel: '',
  clientPermissions: 'array',
  userPermissions: 'array',
  throttling: {},
  nsfw: true
};

const slashTypes = {
  name: '',
  category: '',
  description: '',
  enabled: true,
  globalCommand: true,
  testCommand: true,
  serverIds: 'array',
  options: 'array',
  listeners: []
};
