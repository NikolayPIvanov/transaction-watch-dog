/* eslint-disable no-underscore-dangle */
const Web3 = require('web3');
const logger = require('../../shared/logging');
const Block = require('../models/block');
const ruleEngine = require('../rules-engine');
const Transaction = require('../models/transaction');

const range = (start, end) => Array(end - start + 1).fill().map((_, idx) => start + idx);

class BlockListener {
  web3;

  web3ws;

  subscription;

  ruleSet;

  constructor(projectId, activeRuleSet) {
    this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${projectId}`));
    this.web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${projectId}`));
    this.ruleSet = activeRuleSet?._doc || activeRuleSet;
  }

  onRuleSetAddUpdate = (ruleSet) => {
    logger.info(`On rule set add update evoked with ${JSON.stringify(ruleSet)}`);
    if (!ruleSet?.isActive) return;
    this.ruleSet = ruleSet;
  };

  onRuleSetDeleted = (ruleSet) => {
    if (this.ruleSet.id === ruleSet?.externalId) {
      logger.info('Current active ruleset is deleted');
      this.ruleSet = null;
    }
  };

  // https://web3js.readthedocs.io/en/v1.2.11/web3-eth.html#getblock
  onStart = async () => {
    const block = await Block.findOne();
    const latestNumber = await this.web3.eth.getBlockNumber();
    const localLatestNumber = block?.number || -1;
    logger.info(`Network and watcher are on block number: ${localLatestNumber} ${latestNumber}`);
    if (localLatestNumber === latestNumber) {
      return;
    }

    const ruleSet = { ...this.ruleSet };

    let blocksRange = range(localLatestNumber + 1, latestNumber).slice(0, 10);
    if (localLatestNumber === -1) {
      blocksRange = [latestNumber];
    }

    const getTransactions = async (blockNumbers) => {
      const transactions = [];
      // eslint-disable-next-line no-restricted-syntax
      for (const blockNumber of blockNumbers) {
        try {
          // eslint-disable-next-line no-await-in-loop
          const latestBlock = await this.web3.eth.getBlock(blockNumber, true);
          transactions.push(...latestBlock.transactions);
        } catch (err) {
          logger.error('And error has occurred, cancelling current iteration.Retrying...');
          return [];
        }
      }
      return transactions;
    };

    const transactions = await getTransactions(blocksRange);
    if (!transactions.length) {
      logger.warn('No transactions to process. Ending iteration.');
      return;
    }

    const transactionModels = [];
    transactions.forEach((tx) => {
      const matchedRules = ruleEngine(ruleSet.rules, tx);
      const definedRules = matchedRules.filter((r) => r);
      if (definedRules.length > 0) {
        transactionModels.push({
          ...tx,
          ruleSetId: ruleSet._id.toString(),
          ruleId: definedRules[0]._id.toString(),
        });
      }
    });

    logger.info(`Blocks: ${blocksRange}. Matched transactions count: ${transactionModels.length}.`);
    await Transaction.create(transactionModels);

    if (!block) {
      await Block.create({ number: blocksRange[blocksRange.length - 1] });
      return;
    }

    await Block.updateOne({ _id: block._id }, {
      $set: {
        number: blocksRange[blocksRange.length - 1],
      },
    });
  };

  watch = () => {
    let isRunning = false;
    const run = async () => {
      if (!isRunning) {
        isRunning = true;
        await this.onStart();
        isRunning = false;
      }
      setTimeout(run, 10000);
    };
    run();
  };
}

module.exports = BlockListener;
