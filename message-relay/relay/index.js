const cronScheduler = require('cron');
const { createRelayHandler } = require('./message-relay');
const createBroker = require('../../shared/broker');
const {
  rabbitMqHostname, rabbitMqProtocol, rabbitMqPort,
  rabbitMqPassword, rabbitMqUser, cronExpression,
} = require('../config');

const startScheduler = async () => {
  const rabbitMqBroker = await createBroker({
    hostname: rabbitMqHostname,
    protocol: rabbitMqProtocol,
    port: rabbitMqPort,
    user: rabbitMqUser,
    password: rabbitMqPassword,
  });
  const handler = await createRelayHandler(rabbitMqBroker);
  const job = new cronScheduler.CronJob(
    cronExpression,
    async () => {
      await handler();
    },
  );
  job.start();
};

module.exports = {
  startScheduler,
};
