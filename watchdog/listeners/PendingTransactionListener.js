/* eslint-disable no-underscore-dangle */
const Web3 = require('web3');
const { Transaction } = require('../models');
const logger = require('../../shared/logging');
const BlockchainListener = require('./BlockchainListener');

class PendingTransactionListener extends BlockchainListener {
  web3ws;

  subscription;

  constructor(projectId, state) {
    super(projectId, state);
    this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${projectId}`));
    this.subscription = this.web3ws.eth.subscribe('pendingTransactions');
  }

  async unsubscribe() {
    await this.subscription.unsubscribe();
  }

  onTransaction = async (rulingEngine, txHash) => {
    try {
      const ruleSet = { ...this.state.getRuleSet() };
      if (!ruleSet || !ruleSet.rules || ruleSet.rules.length === 0) {
        logger.warn('No active ruleset and rules. Ending iteration.');
        return;
      }

      const transaction = await this.web3.eth.getTransaction(txHash);
      if (!transaction) return;

      const matchedRules = rulingEngine(ruleSet.rules, transaction);
      const definedRules = matchedRules.filter((r) => r);
      if (definedRules.length === 0) return;

      logger.info(`Tx: ${txHash} matched ${definedRules.length} rules.`);

      await Transaction.create({
        ...transaction,
        ruleSetId: ruleSet._id.toString(),
        ruleId: definedRules[0]._id.toString(),
      });
    } catch (err) {
      logger.error(err);
    }
  };

  watch = (rulingEngine) => {
    this.subscription.on('data', async (txHash) => {
      await this.onTransaction(rulingEngine, txHash);
    });
  };
}

module.exports = PendingTransactionListener;
