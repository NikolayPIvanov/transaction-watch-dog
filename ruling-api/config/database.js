const mongoose = require('mongoose');
const logger = require('../../shared/logging');

exports.connect = async (uri, options) => {
  try {
    const databaseOpt = options || { keepAlive: true, keepAliveInitialDelay: 300000 };
    mongoose.connect(uri, databaseOpt);
    mongoose.connection.on('error', (err) => logger.error(err));
  } catch (error) {
    logger.error(error);
  }
};
