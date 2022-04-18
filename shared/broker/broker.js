const Rascal = require('rascal');
const { rabbitMqConfig } = require('../config');
const logger = require('../logging');

const broker = async ({ hostname, protocol, user, password, port }) => {
  const brokerConfig = rabbitMqConfig({ hostname, protocol, user, password, port }).rascal;
  const rabbitMqBroker = await Rascal.BrokerAsPromised
    .create(Rascal.withDefaultConfig(brokerConfig));
  rabbitMqBroker.on('error', logger.error);
  return rabbitMqBroker;
};

module.exports = broker;
