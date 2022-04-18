const mongoose = require('mongoose');
const logger = require('../../shared/logging');
const rulesEngine = require('./engine');
const config = require('../config');
const { RuleSet } = require('../models');
const { messageListener, TransactionListener, BlockTransactionsListener } = require('../listeners');

const loadRuleSetAsync = async () => {
  logger.info('Loading currently active configuration...');
  const filter = { isActive: true };
  return RuleSet.findOne(filter);
};

const mongoConnect = async () => {
  try {
    await mongoose.connect(config.mongoUri, { keepAlive: true, keepAliveInitialDelay: 300000 });
    mongoose.connection.on('error', (err) => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
};

const start = async () => {
  await mongoConnect();
  const broker = await messageListener.broker();

  const activeRuleSet = await loadRuleSetAsync();
  logger.info(`Active configuration loaded: ${activeRuleSet}`);

  logger.info(`Starting watchdog in mode '${config.mode}'.`);
  const networkWatcher = config.mode === 'block' ? new BlockTransactionsListener(config.infuraId, activeRuleSet)
    : new TransactionListener(config.infuraId, activeRuleSet);

  await messageListener.add(broker, networkWatcher.onRuleSetAdd);
  await messageListener.update(broker, networkWatcher.onRuleSetUpdated);
  await messageListener.delete(broker, networkWatcher.onRuleSetDeleted);

  networkWatcher.watch(rulesEngine);
};

module.exports = start;
