const httpStatus = require('./http-codes');
const { serverConfig } = require('../config');
const ApiError = require('./api-error');

const errorConverter = (err) => {
    let error = err;
    if (error?.error && error.error.isJoi) {
        const details = {
            type: error.type,
            validations: error.error.details.map(d => d.message.replaceAll("\"", "'"))
        }
        error = {
            known: true,
            err: new ApiError('Validation error', httpStatus.BAD_REQUEST, 'A validation error has occurred', true, details)
        }
    } else if (!(error instanceof ApiError)) {
        const statusCode = error.statusCode ? httpStatus.BAD_REQUEST : httpStatus.INTERNAL_SERVER_ERROR;
        const message = error.message || httpStatus[statusCode];
        error = {
            known: true,
            err: new ApiError('Generic error', statusCode, message, false, null, err.stack)
        }
    }
    return error
};

const errorHandler = (err, res) => {
    let { name, statusCode, message, details } = err;

    const response = {
        message: name,
        code: statusCode,
        description: message,
        details: details,
        ...(serverConfig.env === 'development' && { stack: err.stack }),
    };

    res.status(statusCode).send(response);
};

module.exports = {
    errorConverter,
    errorHandler
};