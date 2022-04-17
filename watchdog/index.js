const mongoose = require('mongoose');
const config = require('./config');
const logger = require('../shared/logging');

const { messageListener, TransactionListener } = require('./listeners');
const { RuleSet } = require('./models');
// const rulesEngine = require('./rules-engine');
const BlockListener = require('./listeners/block-listener');

const loadRuleSetAsync = async () => {
  logger.info('Loading currently active configuration...');
  const filter = { isActive: true };
  return RuleSet.findOne(filter);
};

const main = async () => {
  try {
    await mongoose.connect(config.mongoUri, { keepAlive: true, keepAliveInitialDelay: 300000 });
    mongoose.connection.on('error', (err) => {
      logger.error(err);
    });
  } catch (error) {
    logger.error(error);
  }
  const broker = await messageListener.broker();

  const activeRuleSet = await loadRuleSetAsync();
  logger.info(`Active configuration loaded: ${activeRuleSet}`);

  logger.info(`Starting watchdog in mode '${config.mode}'.`);
  const networkWatcher = config.mode === 'block' ? new BlockListener(config.infuraId, activeRuleSet)
    : new TransactionListener(config.infuraId, activeRuleSet);

  await messageListener.add(broker, networkWatcher.onRuleSetAddUpdate);
  await messageListener.update(broker, networkWatcher.onRuleSetAddUpdate);
  await messageListener.delete(broker, networkWatcher.onRuleSetDeleted);

  networkWatcher.watch();
};

main().catch((err) => logger.error(err));
