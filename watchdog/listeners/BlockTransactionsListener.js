/* eslint-disable no-underscore-dangle */
const logger = require('../../shared/logging');
const { Transaction, BlockNumber } = require('../models');

const Listener = require('./BlockchainListener');

const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);
const createBlockNumberRange = (local, remote, max = 10) => (local === -1
  ? [remote] : range(local + 1, remote).slice(0, max));

class BlockTransactionsListener extends Listener {
  constructor(projectId, state) {
    super(projectId, state);
    logger.info('Block Transactions Listener created.');
  }

  getLocalAndRemoteBlockNumbers = async () => {
    const block = await BlockNumber.findOne();
    const latestNumber = await this.web3.eth.getBlockNumber();
    const localLatestNumber = block?.number || -1;
    logger.info(`Local block ${localLatestNumber}. Network block ${latestNumber}. ${latestNumber - localLatestNumber} blocks behind.`);
    return {
      local: localLatestNumber,
      remote: latestNumber,
      blockLocalId: block?._id,
    };
  };

  getBlocksTransactions = async (blockNumbers) => {
    const blockRequests = blockNumbers.map((num) => this.web3.eth.getBlock(num, true));
    const blocks = await Promise.all(blockRequests);
    const transactions = blocks
      .flatMap((b) => b?.transactions)
      .filter((tx) => tx);
    logger.info(`Collected ${transactions.length}`);
    return transactions;
  };

  // eslint-disable-next-line class-methods-use-this
  createDbTransactionModels = (ruleSet, transactions, rulingEngine) => transactions.map((tx) => {
    const matchedRules = rulingEngine(ruleSet.rules, tx);
    const definedRules = matchedRules.filter((r) => r);
    return definedRules.length > 0
      ? {
        ...tx,
        ruleSetId: ruleSet._id.toString(),
        ruleId: definedRules[0]._id.toString(),
      } : null;
  });

  // eslint-disable-next-line class-methods-use-this
  updateBlockNumber = (localLatest, rangeLatest, blockId) => {
    if (localLatest === -1) {
      return BlockNumber.create({ number: rangeLatest });
    }

    return BlockNumber.updateOne({ _id: blockId }, {
      $set: {
        number: rangeLatest,
      },
    });
  };

  // https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#getblock
  queryNetwork = async (rulingEngine, maxBlockBatch = 50) => {
    logger.info('Starting network query iteration.');
    const ruleSet = { ...this.state.getRuleSet() };
    if (!ruleSet || !ruleSet.rules || ruleSet.rules.length === 0) {
      logger.warn('No active ruleset and rules. Ending iteration.');
      return;
    }
    const { local, remote, blockLocalId } = await this.getLocalAndRemoteBlockNumbers();
    if (local === remote) return;

    const blockNumbers = createBlockNumberRange(local, remote, maxBlockBatch);
    const transactions = await this.getBlocksTransactions(blockNumbers);

    if (!transactions.length) {
      logger.warn('No transactions to process. Ending iteration.');
      return;
    }

    const dbTransactions = this.createDbTransactionModels(ruleSet, transactions, rulingEngine);
    const validTransactions = dbTransactions.filter((tx) => tx);
    logger.info(`Blocks: ${blockNumbers}. Matched transactions count: ${validTransactions.length}.`);
    await Transaction.create(validTransactions);

    const rangeLatest = blockNumbers[blockNumbers.length - 1];
    await this.updateBlockNumber(local, rangeLatest, blockLocalId);
    logger.info('Ending network query iteration.');
  };

  watch = (rulingEngine) => {
    // Dummy iteration
    const iterationDelayInSeconds = 10.0;
    const startIteration = async () => {
      const start = new Date();
      await this.queryNetwork(rulingEngine);
      const end = new Date();
      const delayInSeconds = (end.getTime() - start.getTime()) / 1000;
      const delay = Math.min(delayInSeconds - iterationDelayInSeconds, 0);
      const absDelay = Math.abs(delay);
      logger.info(`Delay: ${Math.round(absDelay)} seconds`);
      setTimeout(startIteration, Math.abs(absDelay * 1000));
    };
    startIteration();
  };
}

module.exports = BlockTransactionsListener;
