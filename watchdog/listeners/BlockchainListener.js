/* eslint-disable no-unused-vars */
const Web3 = require('web3');
const logger = require('../../shared/logging');

class BlockchainListener {
  web3;

  ruleSet;

  constructor(infuraProjectId, activeRuleSet) {
    this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`));
    this.web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraProjectId}`));
    // eslint-disable-next-line no-underscore-dangle
    this.ruleSet = activeRuleSet?._doc || activeRuleSet;
  }

  onRuleSetAdd = (rs) => {
    logger.info('On rule set add.');
    if (this.ruleSet.isActive) {
      this.ruleSet = rs;
      // eslint-disable-next-line no-underscore-dangle
      logger.info(`Active rule set is set to ${this.ruleSet._id.toString()}.`);
    }
    logger.info('On rule set add.');
  };

  onRuleSetUpdated = (rs) => {
    logger.info('On rule set update.');
    if (rs?.externalId === this.ruleSet.externalId) {
      this.ruleSet = rs;
      // eslint-disable-next-line no-underscore-dangle
      logger.info(`Active rule set is set to ${this.ruleSet._id.toString()}.`);
      if (!this.ruleSet.isActive) {
        logger.info('Current rule set is deactivated.');
        this.ruleSet = null;
      }
    }
  };

  onRuleSetDeleted = (rs) => {
    logger.info('On rule set delete.');
    if (this.ruleSet.externalId !== rs?.externalId) return;
    logger.info('Current active ruleset is deleted');
    this.ruleSet = null;
  };

  // eslint-disable-next-line class-methods-use-this
  watch = (rulingEngine) => {
    throw new Error("Method 'watch()' must be implemented.");
  };
}

module.exports = BlockchainListener;
