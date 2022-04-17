const { errorConverter, errorHandler: knownErrorHandler } = require('./error-converter');

const crashIfUntrustedErrorOrSendResponse = (error, responseStream) => {
  const errorResult = errorConverter(error);
  if (errorResult.known) {
    knownErrorHandler(errorResult.error, responseStream);
  }
};

class ErrorHandler {
  constructor() {
    this.handleError = async (error, request, responseStream) => {
      crashIfUntrustedErrorOrSendResponse(error, responseStream);
    };
  }
}
module.exports = new ErrorHandler();
