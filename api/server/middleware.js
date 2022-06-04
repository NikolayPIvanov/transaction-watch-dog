import pkg from 'getenv';
import Log from '../infrastructure/log/index.js';

const { string } = pkg;

const IS_PRODUCTION = string('NODE_ENV', '') === 'production';

const logError = () => (error, req, res, next) => {
  Log.error({ err: error, req, res }, 'HTTP Error');

  return next(error);
};

const handleError = () => (error, req, res, next) => {
  const code = error.code && error.code > 99 && error.code < 600 ? error.code : 500;

  const message = error.message || 'Internal Server Error';
  const stack = IS_PRODUCTION ? undefined : error.stack;
  const { data } = error;

  res.status(code).json({
    error: {
      message, stack, code, data,
    },
  });
};

const route = (handler) => async (req, res, next) => {
  try {
    await handler(req, res);
  } catch (e) {
    next(e);
  }
};

export {
  logError, handleError, route
};
