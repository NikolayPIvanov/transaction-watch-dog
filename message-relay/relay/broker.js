const { rabbitMqConfig } = require('../../shared/config')
const Rascal = require('rascal')

const broker = async (rabbitMqUser, rabbitMqPassword) => {
  const brokerConfig = rabbitMqConfig({ user: rabbitMqUser, password: rabbitMqPassword }).rascal
  const broker = await Rascal.BrokerAsPromised.create(Rascal.withDefaultConfig(brokerConfig));
  broker.on('error', console.error);
  return broker;
}

module.exports = broker
