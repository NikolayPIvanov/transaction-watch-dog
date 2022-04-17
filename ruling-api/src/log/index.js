const { successHandler, errorHandler } = require('./http-logger');
const logger = require('../../../shared/logging');

module.exports = {
  successHandler,
  errorHandler,
  logger,
};
