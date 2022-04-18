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

  onRuleSetAddUpdate = (ruleSet) => {
    logger.info('On rule set add update evoked');
    if (!ruleSet?.isActive) return;
    // eslint-disable-next-line no-underscore-dangle
    logger.info(`Changed active rule set to ${ruleSet._id}`);
    this.ruleSet = ruleSet;
  };

  onRuleSetDeleted = (ruleSet) => {
    logger.info('On rule set delete evoked');
    if (this.ruleSet.id !== ruleSet?.externalId) return;
    logger.info('Current active ruleset is deleted');
    this.ruleSet = null;
  };

  // eslint-disable-next-line class-methods-use-this
  watch = (rulingEngine) => {
    throw new Error("Method 'watch()' must be implemented.");
  };
}

module.exports = BlockchainListener;
