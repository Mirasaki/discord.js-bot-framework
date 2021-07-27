const { Schema, model } = require('mongoose')
const TIME_IN_ONE_HOUR = 1000 * 60 * 60

const settingSchema = Schema({
  _guildId: { type: String, required: true },
  _prefix: { type: String, required: true, default: '!!' },
  permissions: {
    helper_role: { type: String, default: '' },
    mod_role: { type: String, default: '' },
    admin_role: { type: String, default: '' },
    permission_notice: { type: Boolean, default: true }
  },
  channels: {
    mod_log_channel: { type: String, default: '' },
    restrict_cmds_channel: { type: String, default: '' }
  },
  disabled_cmds: { type: Array, default: [] }
})

const GuildModel = model('settings', settingSchema)
module.exports.GuildModel = GuildModel

const settingsCache = new Map()

module.exports.getSettingsCache = async (guildId) => {
  let data = settingsCache.get(guildId)
  if (!settingsCache.has(guildId)) {
    const guildSettings = await getSettingsFromDB(guildId)
    data = {
      prefix: guildSettings._prefix,
      permissions: guildSettings.permissions,
      channels: guildSettings.channels,
      disabled_cmds: guildSettings.disabled_cmds
    }
    settingsCache.set(guildId, data)
  }
  cacheTimeout(guildId)
  return data
}

module.exports.updateSettingsCache = async (guildId, newData) => {
  if (!newData || typeof newData !== 'object') throw new Error('Provide a valid data object!')
  const oldData = await getSettingsFromDB(guildId)
  oldData._prefix = newData.prefix
  oldData.permissions = newData.permissions
  oldData.channels = newData.channels
  oldData.disabled_cmds = newData.disabled_cmds
  try {
    await oldData.save()
  } catch (err) {
    return console.log(err)
  }
  settingsCache.set(guildId, newData)
  cacheTimeout(guildId)
  return newData
}

const getSettingsFromDB = async (_guildId) => {
  let guildSettings
  try {
    guildSettings = await GuildModel.findOne({ _guildId })
    if (!guildSettings) {
      const newData = new GuildModel({
        _guildId,
        _prefix: '!!'
      })
      guildSettings = await newData.save()
    }
  } catch (err) {
    return console.log(err)
  }
  return guildSettings
}

const cacheTimeout = (guildId) => {
  setTimeout(() => {
    settingsCache.delete(guildId)
  }, TIME_IN_ONE_HOUR)
}
