const {
  mongoUri, rabbitMqPassword, rabbitMqUser, cron: cronExpression,
} = require('./relay');

module.exports = {
  mongoUri,
  rabbitMqUser,
  rabbitMqPassword,
  cronExpression,
};
