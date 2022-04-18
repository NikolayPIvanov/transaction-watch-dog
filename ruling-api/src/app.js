const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const { globalErrorHandler } = require('./utils');
const routes = require('./routes');

const { logger, successHandler: successLog, errorHandler: errorLog } = require('./log');

const app = express();

app.use(cors());
app.use(compression());
app.use(helmet());
app.use(express.json());

app.use(successLog);
app.use(errorLog);

app.use('/api', routes);

app.use(globalErrorHandler.handleError);

const listen = async (port) => {
  app.listen(port, () => {
    logger.info(`Listening to port ${port}`);
  });
};

module.exports = listen;
