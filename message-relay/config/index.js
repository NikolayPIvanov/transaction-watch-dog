const {
  mongoUri,
  rabbitMqHostname, rabbitMqPort, rabbitMqProtocol,
  rabbitMqPassword, rabbitMqUser, cron: cronExpression,
} = require('./relay');

module.exports = {
  mongoUri,
  rabbitMqUser,
  rabbitMqPassword,
  rabbitMqHostname,
  rabbitMqProtocol,
  rabbitMqPort,
  cronExpression,
};
