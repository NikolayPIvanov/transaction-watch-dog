class BaseError extends Error {
  constructor(name, statusCode, isOperational, description, stack) {
    super(description);

    Error.captureStackTrace(this);
    Object.setPrototypeOf(this, new.target.prototype);
    this.name = name;
    this.statusCode = statusCode;
    this.isOperational = isOperational;
    this.stack = stack;
  }
}

module.exports = BaseError;
