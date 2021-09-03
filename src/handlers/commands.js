const { getFiles, titleCase, getBotInvite } = require('../utils/tools');
const { Collection } = require('discord.js');
const { log } = require('./logger');
const { isEqual } = require('lodash');
const CommandError = require('../classes/CommandError');
const nodePath = require('path');
const { setDefaultSlashPerms } = require('./permissions');

module.exports.topLevelCommandFolder = nodePath.join('src', 'commands');

module.exports.registerCommands = (client) => {
  client.commands = new Collection();
  for (const path of getFiles(this.topLevelCommandFolder, '.js')) {
    try {
      require(path).load(client, path);
    } catch (err) {
      throw new CommandError({
        path,
        message: `Encountered error while loading command:\n${err}`
      });
    }
  }

  client.commands.sortByCategory = () => {
    let currentCategory = '';
    const sorted = [];
    client.commands.forEach(command => {
      const workingCategory = titleCase(command.config.data.category);
      if (currentCategory !== workingCategory) {
        sorted.push({
          category: workingCategory,
          commands: [command]
        });
        currentCategory = workingCategory;
      } else sorted.find(e => e.category === currentCategory).commands.unshift(command);
    });
    return sorted;
  };

  console.log();
  client.commands.sortByCategory()
    .forEach(categoryObj => {
      const count = categoryObj.commands.length;
      log(`Successfully loaded ${count} ${categoryObj.commands[0].config.data.category} command${
        count === 1 ? '' : 's'
      }: [${categoryObj.commands.map(cmd => cmd.config.data.name).join(', ')}]`, 'success');
    });
};

module.exports.loadSlashCommands = async (client) => {
  const { application } = client;
  const { commands } = application;
  let globalCommands = await commands.fetch();
  const testServer = client.guilds.cache.get(client.json.config.ids.testServer);
  if (!testServer) throw new Error(`Please provide a testServer id in config/config.json and make sure you added the bot to that server.\nHeres an invite link: ${getBotInvite(client)}`);

  // await commands.set([]);
  // return await testServer.commands.set([]);

  for (const cmd of client.commands) {
    const consoleOutput = [];
    const { config } = cmd[1];
    const { data } = config;

    const dataChanged = (commandData, apiData) => (
      commandData.description !== apiData.description
      || commandData.defaultPermission !== apiData.defaultPermission
      || !isEqual(commandData.options, apiData.options)
    );

    const allTestServerCommands = await testServer.commands.fetch();
    const testCommand = allTestServerCommands.find((e) => (
      e.client.user.id === client.user.id
      && e.name === data.name
    ));

    const globalCommand = globalCommands.find((e) => e.name === data.name && e.guildId === null);
  
    if (config.enabled === false) {
      consoleOutput.push(`Disabling Slash Command: ${data.name}`);
      try {
        if (globalCommand) commands.delete(globalCommand) && consoleOutput.push('    G Disabled global command');
        if (testCommand && testServer) testServer.commands.delete(testCommand) && consoleOutput.push('    T Disabled test command');
        for (const entry of client.guilds.cache.filter((guild) => guild.id !== client.json.config.ids.testServer)) {
          const guild = entry[1];
          const guildCmds = await guild.commands.fetch();
          const guildClientCmd = guildCmds.find((e) => e.name === data.name && e.client.user.id === client.user.id);
          if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && consoleOutput.push(`    S Disabled server specific command for <${guild.name}>`);
        }
      } catch (err) {
        return console.log(`Error encountered while disabling slash command ${data.name}\n${err.stack || err}`);
      }
      consoleOutput.push(`Successfully Disabled: ${data.name}\n`);
      console.log(consoleOutput.join('\n'));
      continue;
    }

    if (config.globalCommand === true) config.testCommand = false;
    else if (config.testCommand === true) config.globalCommand = false;

    // Removed cuz our approach here would only work
    // if the client was online when added to a server

    // if (
    //   (
    //     config.permLevel === 'Moderator'
    //     || config.permLevel === 'Administrator'
    //     || config.permLevel === 'Server Owner'
    //   )
    //   && config.globalCommand
    // ) data.defaultPermission = false;
    // else data.defaultPermission = true;

    if (data.defaultPermission === undefined) data.defaultPermission = true;

    consoleOutput.push(`Reloading Slash Command: ${data.name}`);
    if (config.globalCommand === true) {
      if (globalCommand && dataChanged(data, globalCommand)) commands.edit(globalCommand, data) && consoleOutput.push('    G Editing global command with new data (Can take up to 1 hour to take effect)');
      else if (!globalCommand) commands.create(data) && consoleOutput.push('    G Creating global command (Can take up to 1 hour to take effect)');
    }
    else if (globalCommand) commands.delete(globalCommand) && consoleOutput.push('    G Deleting global command (Can take up to 1 hour to take effect)');

    // Test server - Test commands setup
    if (config.testCommand === true) {
      // Update Permissions for slash commands
      if (testCommand) setDefaultSlashPerms(testServer, testCommand.id);
      if (testCommand && dataChanged(data, testCommand)) testServer.commands.edit(testCommand, data) && consoleOutput.push('    T Edited test command with new data');
      else if (!testCommand) {
        const cmd = await testServer.commands.create(data);
        consoleOutput.push('    T Created Test Command');
        await setDefaultSlashPerms(testServer, cmd.id);
      }
    }
    else if (testCommand) testServer.commands.delete(testCommand) && consoleOutput.push('    T Deleted test command');

    if (Array.isArray(config.serverIds)) {
      for (const entry of client.guilds.cache.filter((guild) => !config.serverIds.includes(guild.id) && guild.id !== client.json.config.ids.testServer)) {
        const guild = entry[1];
        const guildCmds = await guild.commands.fetch(); 
        const guildClientCmd = guildCmds.find((e) => e.name === data.name && e.client.user.id === client.user.id);
        if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && consoleOutput.push(`    S Deleted server specific command for <${guild.name}>`);
      }
      for (const serverId of config.serverIds) {
        const guild = client.guilds.cache.get(serverId);
        if (!guild || guild.id === client.json.config.ids.testServer) continue;
        const guildCmds = await guild.commands.fetch();
        const guildClientCmd = guildCmds.find((e) => e.name === data.name && e.client.user.id === client.user.id);
        if (!guildClientCmd) guild.commands.create(data) && consoleOutput.push(`    S Created server specific command for <${guild.name}>`);
        else if (guildClientCmd && dataChanged(data, guildClientCmd)) guild.commands.edit(guildClientCmd, data) && consoleOutput.push(`    S Edited server specific command for <${guild.name}>`);
      }
    }
    consoleOutput.push(`Finished Reloading: ${data.name}\n`);
    if (consoleOutput.length > 2) console.log(consoleOutput.join('\n'));
  }
  globalCommands = await commands.fetch();
  log(`Loaded ${globalCommands.size} global slash commands!`, 'success');
  console.table(globalCommands.map((globalCmd) => {
    const cmd = client.commands.get(globalCmd.name);
    return {
      id: globalCmd.id,
      name: globalCmd.name,
      category: cmd.config.data.category,
      edited: cmd.config._fileStats.lastEdit
    };
  }));

  const testCommands = await testServer.commands.fetch();
  console.log();
  log(`Loaded ${testCommands.size} test commands!`, 'success');
  console.table(testCommands.map((testCmd) => {
    const cmd = client.commands.get(testCmd.name);
    return {
      id: testCmd.id,
      name: testCmd.name,
      category: cmd.config.data.category,
      edited: cmd.config._fileStats.lastEdit
    };
  }));
};

module.exports.checkExpired = async (client) => {
  const globalCommands = await client.application.commands.fetch();
  for (let cmd of globalCommands) {
    cmd = cmd[1];
    if (!client.commands.get(cmd.name)) {
      log(`Deleting GLOBAL application command <${cmd.name}> because the file was deleted.`, 'error');
      await client.application.commands.delete(cmd.id);
    }
  }

  const testServer = client.guilds.cache.get(client.json.config.ids.testServer);
  const testCommands = await testServer.commands.fetch();
  for (let cmd of testCommands) {
    cmd = cmd[1];
    if (!client.commands.get(cmd.name)) {
      log(`Deleting TEST application command <${cmd.name}> because the file was deleted.`, 'error');
      await testServer.commands.delete(cmd.id);
    }
  }

  // Check old server-specific commands
};
