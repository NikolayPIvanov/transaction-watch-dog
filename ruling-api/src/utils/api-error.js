const httpStatusCodes = require('../utils/http-codes')

class BaseError extends Error {
    constructor(name, statusCode, isOperational, description, stack) {
        super(description)

        Error.captureStackTrace(this)
        Object.setPrototypeOf(this, new.target.prototype)
        this.name = name
        this.statusCode = statusCode
        this.isOperational = isOperational
        this.stack = stack
    }
}

class ApiError extends BaseError {
    details
    constructor(
        name,
        statusCode = httpStatusCodes.NOT_FOUND,
        description = 'Not found.',
        isOperational = true,
        details = null,
        stack = null
    ) {
        super(name, statusCode, isOperational, description, stack)
        this.details = details || []
    }
}

module.exports = ApiError