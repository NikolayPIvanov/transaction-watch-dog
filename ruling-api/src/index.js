const { database, serverConfig } = require('../config');
const { globalErrorHandler } = require('./utils');
const app = require('./app');

database.connect(serverConfig.mongoUri)
  .then(app(serverConfig.port));

process.on('uncaughtException', (error) => {
  globalErrorHandler.handleError(error);
});

process.on('unhandledRejection', (reason) => {
  globalErrorHandler.handleError(reason);
});
