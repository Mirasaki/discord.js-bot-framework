const { connect, connection } = require('mongoose');
const { log } = require('../handlers/logger');

module.exports = async () => {
  await connect(process.env.MONGO_LINK, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useFindAndModify: false
  }).catch(error => console.log(error));
};

connection.once('open', () => {
  log('Connected to MongoDB!', 'success');
});

connection.on('error', console.error.bind(console, 'MongoDB Connection Error:'));
