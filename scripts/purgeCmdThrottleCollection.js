require('dotenv').config({
  path: 'config/.env'
})

const { connection } = require('mongoose')
const { logger } = require('../src/handlers/logger')
const { ThrottleModel } = require('../src/mongo/throttling');

(async () => {
  await require('../src/mongoConnection')()
  await ThrottleModel.deleteMany()
  await connection.close()
  logger.log({
    level: 'info',
    message: 'Command Throttle Collection has been purged!'
  })
})()
