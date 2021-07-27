const { Collection } = require('discord.js')
const { getFiles } = require('../tools')
const { validatePermissions, permLevels } = require('./permissions')
const commandPaths = getFiles(process.env.COMMANDS_PATH, '.js')

module.exports.registerCommands = (client, counter = 0) => {
  client.commands = new Collection()
  client.aliases = new Collection()
  console.log('Initializing Commands:')
  for (const path of commandPaths) {
    const cmd = require(path)
    const res = validateCommand(client, cmd, path)
    counter++
    client.commands.set(cmd.help.name, cmd)
    cmd.config.aliases.forEach(alias => client.aliases.set(alias, cmd.help.name))
    console.log(res)
  }
  console.log('Finished initializing commands!\n')
}

module.exports.loadSlashCommands = async (client) => {
  const { application } = client
  const { commands } = application
  const globalCommands = await commands.fetch()
  const testServer = client.guilds.cache.get(process.env.SLASH_CMD_TEST_SERVER_ID)

  // Delete all your slash commands by calling:
  // commands.set([])
  // testServer.commands.set([])

  for await (const path of commandPaths) {
    const cmd = require(path)
    const { slash } = cmd
    if (!slash) continue
    const applicationCommandData = {
      name: cmd.help.name,
      description: cmd.help.shortDescription,
      options: (
        Array.isArray(slash.options)
          ? slash.options
          : []
      )
    }

    let testCommand
    if (testServer) {
      const allTestServerCommands = await testServer.commands.fetch()
      testCommand = allTestServerCommands.find((e) => (
        e.client.user.id === client.user.id
        && e.name === cmd.help.name
      ))
    }

    const globalCommand = globalCommands.find((e) => e.name === cmd.help.name && e.guildId === null)

    if (slash.enabled === false) {
      console.log(`Disabling Slash Command: ${cmd.help.name}`)
      try {
        if (globalCommand) commands.delete(globalCommand) && console.log('    G Disabled global command')
        if (testCommand && testServer) testServer.commands.delete(testCommand) && console.log('    T Disabled test command')
        // client.guilds.cache.forEach(async (guild) => {
        //   const guildCmds = await guild.commands.fetch()
        //   const guildClientCmd = guildCmds.find((e) => e.name === cmd.help.name && e.client.user.id === client.user.id)
        //   if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && console.log(`    S Deleted server specific command for ${guild.name}`)
        // })
        for (const entry of client.guilds.cache.filter((guild) => guild.id !== process.env.SLASH_CMD_TEST_SERVER_ID)) {
          const guild = entry[1]
          const guildCmds = await guild.commands.fetch()
          const guildClientCmd = guildCmds.find((e) => e.name === cmd.help.name && e.client.user.id === client.user.id)
          if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && console.log(`    S Disabled server specific command for <${guild.name}>`)
        }
      } catch (err) {
        return console.log(`Error encountered while disabling slash command ${cmd.help.name}\n${err.stack || err}`)
      }
      console.log(`Successfully Disabled: ${cmd.help.name}\n`)
      continue
    }

    if (slash.reload !== true) continue

    console.log(`Reloading Slash Command: ${cmd.help.name}`)

    if (slash.globalCommand === true) {
      if (globalCommand) commands.edit(globalCommand, applicationCommandData) && console.log('    G Edited global command with new data')
      else commands.create(applicationCommandData) && console.log('    G Created global command')
    } else if (slash.globalCommand === false && globalCommand) commands.delete(globalCommand) && console.log('    G Deleted global command')

    if (testServer) {
      if (slash.testCommand === true) {
        if (testCommand) testServer.commands.edit(testCommand, applicationCommandData) && console.log('    T Edited test command with new data')
        else testServer.commands.create(applicationCommandData) && console.log('    T Created Test Command')
      } else if (slash.testCommand === false && testCommand) testServer.commands.delete(testCommand) && console.log('    T Deleted test command')
    }

    if (Array.isArray(slash.serverIds)) {
      for (const entry of client.guilds.cache.filter((guild) => !slash.serverIds.includes(guild.id) && guild.id !== process.env.SLASH_CMD_TEST_SERVER_ID)) {
        const guild = entry[1]
        const guildCmds = await guild.commands.fetch()
        const guildClientCmd = guildCmds.find((e) => e.name === cmd.help.name && e.client.user.id === client.user.id)
        if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && console.log(`    S Deleted server specific command for <${guild.name}>`)
      }
      for (const serverId of slash.serverIds) {
        const guild = client.guilds.cache.get(serverId)
        if (!guild || guild.id === process.env.SLASH_CMD_TEST_SERVER_ID) continue
        const guildCmds = await guild.commands.fetch()
        const guildClientCmd = guildCmds.find((e) => e.name === cmd.help.name && e.client.user.id === client.user.id)
        if (!guildClientCmd) guild.commands.create(applicationCommandData) && console.log(`    S Created server specific command for <${guild.name}>`)
        else guild.commands.edit(guildClientCmd, applicationCommandData) && console.log(`    S Edited server specific command for <${guild.name}>`)
      }
    }
    console.log(`Finished Reloading: ${cmd.help.name}\n`)
  }
}

const tempCommands = []
const validateCommand = (client, cmd, path) => {
  let problems = []
  path = path.replace(/\\/g, '/')
  const shortPath = path.slice(
    path.indexOf(process.env.COMMANDS_PATH), path.length
  )
  if (!cmd.help || !cmd.config || !cmd.run) {
    throw new Error(`Missing ${
      cmd.help
      ? (
        cmd.config
        ? 'exports.run'
        : 'exports.config'
      )
      : 'exports.help'
    }\n    at ${shortPath}`)
  }

  const splitPath = path.split('/')
  const commandNameFromFile = splitPath[splitPath.length - 1].slice(0, -3)
  const commandCategoryFromFile = splitPath[splitPath.length - 2]

  if (!cmd.help.name) cmd.help.name = commandNameFromFile
  if (!cmd.help.category) cmd.help.category = cmd.help.category === 'commands' ? 'Uncategorized' : commandCategoryFromFile
  if (!cmd.config.aliases) cmd.config.aliases = []
  if (!cmd.config.cooldown) cmd.config.cooldown = -1
  if (!cmd.config.clientPermissions) cmd.config.clientPermissions = []
  if (!cmd.config.userPermissions) cmd.config.userPermissions = []

  const thisObj = { name: cmd.help.name, origin: path }
  const check = tempCommands.find((e) => e.name === cmd.help.name)
  if (check) throw new Error(`Duplicate Command: ${cmd.help.name} already registered!\nOriginal command: ${check.origin}\nRequested event: ${path}`)
  tempCommands.push(thisObj)
  const logStr = `    ${
      cmd.config.enabled === false
      ? 'X'
      : tempCommands.indexOf(thisObj) + 1
    } ${cmd.help.name}: ${thisObj.origin.slice(
      thisObj.origin
      .replace(/\\/g, '/')
      .indexOf(process.env.COMMANDS_PATH), thisObj.origin.length
    )}`
  if (
    cmd.config
      && cmd.config.enabled === false
  ) {
    tempCommands.splice(tempCommands.indexOf(thisObj), 1)
    return logStr
  }

  const helpExports = validateExports(helpTypes, cmd.help)
  const confExports = validateExports(configTypes, cmd.config)
  if (Array.isArray(helpExports)) problems = problems.concat(helpExports)
  if (Array.isArray(confExports)) problems = problems.concat(confExports)

  if (cmd.slash) {
    const slashExports = validateExports(slashTypes, cmd.slash)
    if (Array.isArray(slashExports)) problems = problems.concat(slashExports)
  }

  const stopIfInvalid = () => {
    if (problems[0]) {
      problems.push(`    at ${path}`)
      throw new Error(`CommandExportsValidationError:\n${problems.join('\n')}`)
    }
  }

  // Stop Initializing if not all the required properties/exports are present
  stopIfInvalid()
  // Additional check on those present properties afterwards

  if (permLevels[cmd.config.permLevel] === undefined) problems.push(`Unsupported permission level: ${cmd.config.permLevel}`)

  const invalidClientPerms = validatePermissions(cmd.config.clientPermissions)
  const invalidUserPerms = validatePermissions(cmd.config.userPermissions)
  if (invalidClientPerms[0]) invalidClientPerms.forEach((perm) => problems.push(`Invalid clientPermission: "${perm}"`))
  if (invalidUserPerms[0]) invalidUserPerms.forEach((perm) => problems.push(`Invalid userPermission: "${perm}"`))

  cmd.config.aliases.forEach(alias => {
    if (client.aliases.get(alias)) throw new Error(`Two commands or more commands have the same aliases: ${alias}\n    at: ${path}`)
    client.aliases.set(alias, cmd.help.name)
  })

  stopIfInvalid()
  counter = 0
  return logStr
}

let counter = 0
const validateExports = (originalObj, targetObj) => {
  const exports = 'exports.' + (counter === 0 ? 'help' : (counter === 1 ? 'config' : 'slash'))
  const problems = []
  Object.entries(originalObj).forEach(([key, value]) => {
    // We turn the eslint warning off because we only touch Objects with hardcoded keys
    // eslint-disable-next-line no-prototype-builtins
    if (!targetObj.hasOwnProperty(key)) problems.push(`Missing ${exports} property <${key}> (type ${typeof value})`)
    else if (value === 'array' && Array.isArray(targetObj[key]) === false) problems.push(`Wrong ${exports} type ${key}: expected array, received ${typeof targetObj[key]}`)
    else if (value !== 'array' && typeof targetObj[key] !== typeof value) problems.push(`Wrong ${exports} type ${key}: expected ${typeof value} received ${typeof targetObj[key]}>`)
  })
  counter++
  if (problems[0]) return problems
  else return true
}

const helpTypes = {
  name: '',
  category: '',
  shortDescription: '',
  longDescription: '',
  usage: '',
  examples: 'array'
}

const configTypes = {
  enabled: true,
  required: true,
  aliases: 'array',
  permLevel: '',
  cooldown: 0,
  clientPermissions: 'array',
  userPermissions: 'array'
}

const slashTypes = {
  enabled: true,
  reload: true,
  globalCommand: true,
  testCommand: true,
  serverIds: 'array'
}
