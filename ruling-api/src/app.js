const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const ApiError = require('./utils/api-error');

const errorHandler = require('./utils/error-handler');
const { logger, successHandler: successHandlerLog, errorHandler: errorHandlerLog } = require('./log');
const routes = require('./routes');
const { serverConfig } = require('./config');
const httpStatusCodes = require('./utils/http-codes');

const app = express();

app.use(cors()); // Enable All CORS

app.use(compression()); // Add compression

app.use(helmet()); // Adding Security Headers

app.use(express.json()); // JSON parsing
app.use(successHandlerLog);
app.use(errorHandlerLog);

app.use('/api', routes);

app.use('*', (req, res, next) => {
  next(new ApiError('Route not found', httpStatusCodes.NOT_FOUND, 'Invalid route'));
});

// Error handling middleware, we delegate the handling to the centralized error handler
// eslint-disable-next-line no-unused-vars
app.use(async (err, req, res, next) => {
  await errorHandler.handleError(err, req, res); // The error handler will send a response
});

process.on('uncaughtException', (error) => {
  errorHandler.handleError(error);
});

process.on('unhandledRejection', (reason) => {
  errorHandler.handleError(reason);
});

const start = async (port) => {
  await mongoose.connect(serverConfig.mongoUri);
  const serverPort = port || serverConfig.port;
  app.listen(serverPort, () => {
    logger.info(`Listening to port ${serverPort}`);
  });
};

module.exports = start;
