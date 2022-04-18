const { httpStatus } = require('./errors');
const { serverConfig } = require('../../config');
const ApiError = require('./errors/api-error');

const errorConverter = (errorResult) => {
  if (errorResult?.error && errorResult.error.isJoi) {
    const details = {
      type: errorResult.type,
      validations: errorResult.error.details.map((d) => d.message.replaceAll('"', "'")),
    };
    return {
      ...errorResult.error,
      error: new ApiError('Validation error', httpStatus.BAD_REQUEST, 'A validation error has occurred', true, details),
    };
  }

  if (!(errorResult.error instanceof ApiError)) {
    const statusCode = errorResult.error.statusCode
      ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
    const message = errorResult.message || 'Unspecifed';
    return {
      ...errorResult.error,
      error: new ApiError('Generic error', statusCode, message, true, null, errorResult.error.stack),
    };
  }

  return errorResult;
};

const responseErrorHandler = (err, res) => {
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

const crashIfUntrustedErrorOrSendResponse = (error, responseStream) => {
  const errorResult = errorConverter({ known: true, error });
  // For now all of the errors will be known
  if (errorResult.known) {
    responseErrorHandler(errorResult.error, responseStream);
  }
};

class GlobalErrorHandler {
  constructor() {
    this.handleError = async (error, request, responseStream) => {
      crashIfUntrustedErrorOrSendResponse(error, responseStream);
    };
  }
}

module.exports = new GlobalErrorHandler();
