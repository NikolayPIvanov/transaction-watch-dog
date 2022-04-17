const Rascal = require('rascal');
const { rabbitMqConfig } = require('../../shared/config');
const logger = require('../../shared/logging');

const broker = async (rabbitMqUser, rabbitMqPassword) => {
  const brokerConfig = rabbitMqConfig({ user: rabbitMqUser, password: rabbitMqPassword }).rascal;
  const rabbitMqBroker = await Rascal.BrokerAsPromised
    .create(Rascal.withDefaultConfig(brokerConfig));
  rabbitMqBroker.on('error', logger.error);
  return rabbitMqBroker;
};

module.exports = broker;
