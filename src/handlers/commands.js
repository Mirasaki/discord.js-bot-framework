const { Collection } = require('discord.js')
const { getFiles } = require('../utils/tools')
const { validatePermissions, permLevels } = require('./permissions')
const commandPaths = getFiles(process.env.COMMANDS_PATH, '.js')

module.exports.validateCommands = (client, counter = 0) => {
  console.log('\nValidating Commands:')
  client.commands = new Collection()
  for (const path of commandPaths) {
    const cmd = require(path)
    const res = validateCommand(client, cmd, path)
    counter++
    client.commands.set(cmd.slash.name, cmd)
    console.log(res)
  }
  console.log('Finished Validating commands!\n')
}

module.exports.loadSlashCommands = async (client) => {
  const { application } = client
  const { commands } = application
  const globalCommands = await commands.fetch()
  const testServer = client.guilds.cache.get(client.json.config.ids.testServer)

  for await (const path of commandPaths) {
    const cmd = require(path)
    const { slash } = cmd
    const applicationCommandData = {
      name: slash.name,
      description: slash.description,
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
        && e.name === slash.name
      ))
    }

    const globalCommand = globalCommands.find((e) => e.name === slash.name && e.guildId === null)

    if (slash.enabled === false) {
      console.log(`Disabling Slash Command: ${slash.name}`)
      try {
        if (globalCommand) commands.delete(globalCommand) && console.log('    G Disabled global command')
        if (testCommand && testServer) testServer.commands.delete(testCommand) && console.log('    T Disabled test command')
        for (const entry of client.guilds.cache.filter((guild) => guild.id !== client.json.config.ids.testServer)) {
          const guild = entry[1]
          const guildCmds = await guild.commands.fetch()
          const guildClientCmd = guildCmds.find((e) => e.name === slash.name && e.client.user.id === client.user.id)
          if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && console.log(`    S Disabled server specific command for <${guild.name}>`)
        }
      } catch (err) {
        return console.log(`Error encountered while disabling slash command ${slash.name}\n${err.stack || err}`)
      }
      console.log(`Successfully Disabled: ${slash.name}\n`)
      continue
    }

    if (slash.reload !== true) continue

    console.log(`Reloading Slash Command: ${slash.name}`)

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
      for (const entry of client.guilds.cache.filter((guild) => !slash.serverIds.includes(guild.id) && guild.id !== client.json.config.ids.testServer)) {
        const guild = entry[1]
        const guildCmds = await guild.commands.fetch()
        const guildClientCmd = guildCmds.find((e) => e.name === slash.name && e.client.user.id === client.user.id)
        if (guildClientCmd) guild.commands.delete(guildClientCmd.id) && console.log(`    S Deleted server specific command for <${guild.name}>`)
      }
      for (const serverId of slash.serverIds) {
        const guild = client.guilds.cache.get(serverId)
        if (!guild || guild.id === client.json.config.ids.testServer) continue
        const guildCmds = await guild.commands.fetch()
        const guildClientCmd = guildCmds.find((e) => e.name === slash.name && e.client.user.id === client.user.id)
        if (!guildClientCmd) guild.commands.create(applicationCommandData) && console.log(`    S Created server specific command for <${guild.name}>`)
        else guild.commands.edit(guildClientCmd, applicationCommandData) && console.log(`    S Edited server specific command for <${guild.name}>`)
      }
    }
    console.log(`Finished Reloading: ${slash.name}\n`)
  }
}

const tempCommands = []
const validateCommand = (client, cmd, path) => {
  let problems = []
  path = path.replace(/\\/g, '/')
  const shortPath = path.slice(
    path.indexOf(process.env.COMMANDS_PATH), path.length
  )
  const { config, slash } = cmd
  if (!config || !cmd.run) {
    throw new Error(`Missing ${
      config
      ? 'exports.run'
      : 'exports.config'
    }\n    at ${shortPath}`)
  }

  const splitPath = path.split('/')
  const commandNameFromFile = splitPath[splitPath.length - 1].slice(0, -3)
  const commandCategoryFromFile = splitPath[splitPath.length - 2]

  if (!slash.name) slash.name = commandNameFromFile
  if (!slash.category) slash.category = slash.category === 'commands' ? 'Uncategorized' : commandCategoryFromFile
  if (!slash.listeners) slash.listeners = []
  if (!config.clientPermissions) config.clientPermissions = []
  if (!config.userPermissions) config.userPermissions = []
  if (!config.throttling) config.throttling = false

  const thisObj = { name: slash.name, origin: path }
  const check = tempCommands.find((e) => e.name === slash.name)
  if (check) throw new Error(`Duplicate Command: ${slash.name} already registered!\nOriginal command: ${check.origin}\nRequested event: ${path}`)
  tempCommands.push(thisObj)
  const logStr = `    ${
      config.enabled === false
      ? 'X'
      : tempCommands.indexOf(thisObj) + 1
    } ${slash.name}: ${thisObj.origin.slice(
      thisObj.origin
      .indexOf(process.env.COMMANDS_PATH), thisObj.origin.length
    )}`
  if (
    config
    && config.enabled === false
  ) {
    tempCommands.splice(tempCommands.indexOf(thisObj), 1)
    return logStr
  }

  const confExports = validateExports(configTypes, config)
  if (Array.isArray(confExports)) problems = problems.concat(confExports)

  const slashExports = validateExports(slashTypes, slash)
  if (Array.isArray(slashExports)) problems = problems.concat(slashExports)

  const stopIfInvalid = () => {
    if (problems[0]) {
      problems.push(`    at ${path}`)
      throw new Error(`CommandExportsValidationError:\n${problems.join('\n')}`)
    }
  }

  // Stop Initializing if not all the required properties/exports are present
  stopIfInvalid()
  // Additional check on those present properties afterwards

  if (permLevels[config.permLevel] === undefined) problems.push(`Unsupported permission level: ${config.permLevel}`)

  const invalidClientPerms = validatePermissions(config.clientPermissions)
  const invalidUserPerms = validatePermissions(config.userPermissions)
  if (invalidClientPerms[0]) invalidClientPerms.forEach((perm) => problems.push(`Invalid clientPermission: "${perm}"`))
  if (invalidUserPerms[0]) invalidUserPerms.forEach((perm) => problems.push(`Invalid userPermission: "${perm}"`))

  if (slash.description.length === 0) problems.push('Invalid slash.description!')

  stopIfInvalid()
  counter = 0
  return logStr
}

let counter = 0
const validateExports = (originalObj, targetObj) => {
  const exports = 'exports.' + (counter === 0 ? 'config' : 'slash')
  const problems = []
  Object.entries(originalObj).forEach(([key, value]) => {
    const { throttling } = targetObj
    if (key === 'throttling' && targetObj[key] === false) return
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
    ) problems.push(`Invalid ${exports}.throttling property provided.\n    Valid example: throttling: { usages: 2, duration: 20 }`)
    // We turn the eslint warning off because we only touch Objects with hardcoded keys
    // eslint-disable-next-line no-prototype-builtins
    else if (!targetObj.hasOwnProperty(key)) problems.push(`Missing ${exports} property <${key}> (type ${typeof value})`)
    else if (value === 'array' && Array.isArray(targetObj[key]) === false) problems.push(`Wrong ${exports} type ${key}: expected array, received ${typeof targetObj[key]}`)
    else if (value !== 'array' && typeof targetObj[key] !== typeof value) problems.push(`Wrong ${exports} type ${key}: expected ${typeof value} received ${typeof targetObj[key]}>`)
  })
  counter++
  if (problems[0]) return problems
  else return true
}

const configTypes = {
  enabled: true,
  required: true,
  permLevel: '',
  clientPermissions: 'array',
  userPermissions: 'array',
  throttling: {}
}

const slashTypes = {
  name: '',
  category: '',
  description: '',
  enabled: true,
  reload: true,
  globalCommand: true,
  testCommand: true,
  serverIds: 'array',
  options: 'array',
  listeners: []
}
