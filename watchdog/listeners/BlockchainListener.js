/* eslint-disable no-unused-vars */
const Web3 = require('web3');
const logger = require('../../shared/logging');

class BlockchainListener {
  web3;

  constructor(infuraProjectId, state) {
    this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${infuraProjectId}`));
    this.web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${infuraProjectId}`));
    this.state = state;
  }

  onRuleSetAdd = (rs) => {
    logger.info('On rule set add.');
    if (rs?.isActive) {
      this.state.setRuleSet(rs);
      logger.info(`Active rule set is set to ${rs}.`);
    }
  };

  onRuleSetUpdated = (rs) => {
    logger.info('On rule set update.');
    const currentRuleSet = this.state.getRuleSet();
    if (currentRuleSet?.externalId === rs?.externalId || rs?.isActive) {
      this.state.setRuleSet(rs);
      logger.info(`Active rule set is set to ${JSON.stringify(rs)}.`);
      if (!rs?.isActive) {
        logger.info('Current rule set is deactivated.');
        this.state.setRuleSet(null);
      }
    }
  };

  onRuleSetDeleted = (rs) => {
    logger.info('On rule set delete.');
    if (this.state.getRuleSet()?.externalId !== rs?.externalId) return;
    logger.info('Current active ruleset is deleted');
    this.state.setRuleSet(null);
  };

  // eslint-disable-next-line class-methods-use-this
  watch = (rulingEngine) => {
    throw new Error("Method 'watch()' must be implemented.");
  };
}

module.exports = BlockchainListener;
