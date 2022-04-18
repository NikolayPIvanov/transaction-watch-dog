const morgan = require('morgan');
const { serverConfig } = require('../../config');
const logger = require('../../../shared/logging');

morgan.token('message', (req, res) => res.locals.errorMessage || '');

const getIpFormat = () => (serverConfig.env === 'production' ? ':remote-addr - ' : '');
const successResponseFormat = `:date[iso] ${getIpFormat()}:method :url :status - :response-time ms`;
const errorResponseFormat = `:date[iso] ${getIpFormat()}:method :url :status - :response-time ms`;

const successHandler = morgan(successResponseFormat, {
  skip: (req, res) => res.statusCode >= 400,
  stream: { write: (message) => logger.info(message.trim()) },
});

const errorHandler = morgan(errorResponseFormat, {
  skip: (req, res) => res.statusCode < 400,
  stream: { write: (message) => logger.error(message.trim()) },
});

module.exports = {
  successHandler,
  errorHandler,
};
