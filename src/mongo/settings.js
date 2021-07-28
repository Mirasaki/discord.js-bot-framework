const { Schema, model } = require('mongoose')
const TIME_IN_ONE_HOUR = 1000 * 60 * 60

const settingSchema = Schema({
  _guildId: { type: String, required: true },
  prefixes: { type: Array, default: ['!!'] },
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
    console.log('Fetching settings from DB!')
    const guildSettings = await getSettingsFromDB(guildId)
    data = guildSettings
    settingsCache.set(guildId, data)
  }
  cacheTimeout(guildId)
  return data
}

const getSettingsFromDB = async (_guildId) => {
  let guildSettings
  try {
    guildSettings = await GuildModel.findOne({ _guildId })
    if (!guildSettings) {
      const newData = new GuildModel({ _guildId })
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
