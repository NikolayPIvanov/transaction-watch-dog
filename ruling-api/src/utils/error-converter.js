const httpStatus = require('./http-codes');
const { serverConfig } = require('../config');
const ApiError = require('./api-error');

const errorConverter = (err) => {
  let errorResult = {
    known: true,
    error: err,
  };

  if (errorResult?.error && errorResult.error.isJoi) {
    const details = {
      type: errorResult.type,
      validations: errorResult.error.details.map((d) => d.message.replaceAll('"', "'")),
    };
    errorResult = {
      known: true,
      error: new ApiError('Validation error', httpStatus.BAD_REQUEST, 'A validation error has occurred', true, details),
    };
  } else if (!(errorResult.error instanceof ApiError)) {
    const statusCode = errorResult.error.statusCode
      ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = errorResult.message || 'Unspecifed';
    errorResult = {
      known: true,
      error: new ApiError('Generic error', statusCode, message, true, null, err.stack),
    };
  }
  return errorResult;
};

const errorHandler = (err, res) => {
  const {
    name, statusCode, message, details,
  } = err;

  const response = {
    message: name,
    code: statusCode,
    description: message,
    details,
    ...(serverConfig.env === 'development' && { stack: err.stack }),
  };

  res.status(statusCode).send(response);
};

module.exports = {
  errorConverter,
  errorHandler,
};
