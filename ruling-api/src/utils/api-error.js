const httpStatusCodes = require('../utils/httpStatusCodes')
const BaseError = require('./baseError')

class ApiError extends BaseError {
    constructor(
        name,
        statusCode = httpStatusCodes.NOT_FOUND,
        description = 'Not found.',
        isOperational = true
    ) {
        super(name, statusCode, isOperational, description)
    }
}

module.exports = ApiError