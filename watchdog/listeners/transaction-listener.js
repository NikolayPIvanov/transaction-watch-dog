/* eslint-disable no-underscore-dangle */
const Web3 = require('web3');
const { Transaction } = require('../models');
const logger = require('../../shared/logging');
const ruleEngine = require('../rules-engine');

class TransactionListener {
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
    logger.info(`On rule set add update envoked with ${JSON.stringify(ruleSet)}`);
    if (!ruleSet?.isActive) return;
    this.ruleSet = ruleSet;
  };

  onRuleSetDeleted = (ruleSet) => {
    if (this.ruleSet.id === ruleSet?.externalId) {
      logger.info('Current active ruleset is deleted');
      this.ruleSet = null;
    }
  };

  subscribe(topic) {
    this.subscription = this.web3ws.eth.subscribe(topic || 'pendingTransactions');
  }

  async unsubscribe() {
    await this.subscription.unsubscribe();
  }

  listen(filterCb) {
    this.subscription.on('data', async (txHash) => {
      try {
        if (!this.ruleSet) {
          logger.info('Skipping processing due to missing ruleset');
          return;
        }
        const { ruleSet } = this.ruleSet;

        const transaction = await this.web3.eth.getTransaction(txHash);
        if (!transaction) return;

        const ruleId = await filterCb(ruleSet, transaction);
        if (!ruleId) return;

        await Transaction.create({
          ...transaction,
          ruleSetId: ruleSet._id.toString(),
          ruleId: ruleId.toString(),
        });
      } catch (err) {
        logger.error(err);
      }
    });
  }

  watch = () => {
    this.listen(async (ruleSet, tx) => {
      const matchedRules = ruleEngine(ruleSet.rules, tx);
      const definedRules = matchedRules.filter((r) => r);
      if (definedRules.length > 0) {
        await Transaction.create({
          ...tx,
          ruleSetId: ruleSet._id.toString(),
          ruleId: definedRules[0]._id.toString(),
        });
      }
    });
  };
}

module.exports = TransactionListener;
