const { httpCodes, ApiError } = require('./errors');

const errorConverter = (errorResult) => {
  // Joi (validation) error
  if (errorResult?.error && errorResult?.error?.isJoi) {
    const details = {
      type: errorResult.type,
      validations: errorResult.error.details.map((d) => d.message.replaceAll('"', "'")),
    };
    return {
      known: true,
      error: new ApiError('Validation error', httpCodes.BAD_REQUEST, 'A validation error has occurred', true, details),
    };
  }

  // Different from Api Error
  if (!(errorResult.error instanceof ApiError)) {
    const statusCode = errorResult.error.statusCode
      ? httpCodes.BAD_REQUEST : httpCodes.INTERNAL_SERVER_ERROR;
    const message = errorResult.message || 'Unspecifed';
    return {
      known: true,
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
  };

  res.status(statusCode).send(response);
};

const crashIfUntrustedErrorOrSendResponse = (error, responseStream) => {
  const errorResult = errorConverter({ known: true, error: error?.error || error });
  // For now all of the errors will be known
  if (errorResult.known) {
    responseErrorHandler(errorResult.error, responseStream);
  }
};

class GlobalErrorHandler {
  constructor() {
    // eslint-disable-next-line no-unused-vars
    this.handleError = async (error, request, responseStream, next) => {
      crashIfUntrustedErrorOrSendResponse(error, responseStream);
    };
  }
}

module.exports = new GlobalErrorHandler();
