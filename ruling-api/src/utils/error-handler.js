const logger = require('../../../shared/logging')
const { errorConverter, errorHandler: knownErrorHandler } = require('./error-converter')

const crashIfUntrustedErrorOrSendResponse = (error, responseStream) => {
    const err = errorConverter(error);
    if (err.known) {
        knownErrorHandler(err.err, responseStream)
    }
}

function errorHandler() {
    this.handleError = async (error, request, responseStream, next) => {
        crashIfUntrustedErrorOrSendResponse(error, responseStream);
    };
}
module.exports = new errorHandler();

