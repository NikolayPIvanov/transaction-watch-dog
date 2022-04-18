const httpStatusCodes = require('./http-codes');
const BaseError = require('./base-error');

class ApiError extends BaseError {
  details;

  constructor(
    name,
    statusCode = httpStatusCodes.NOT_FOUND,
    description = 'Not found.',
    isOperational = true,
    details = null,
    stack = null,
  ) {
    super(name, statusCode, isOperational, description, stack);
    this.details = details || [];
  }
}

module.exports = ApiError;
