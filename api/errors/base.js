export class BaseError extends Error {
  constructor(code, isOperational, description, stack) {
    super(description);

    Error.captureStackTrace(this);
    Object.setPrototypeOf(this, new.target.prototype);
    this.code = code;
    this.isOperational = isOperational;
    this.stack = stack;
  }
}
