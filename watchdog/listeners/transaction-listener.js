const Web3 = require('web3')
const { Transaction } = require('../models')

class TransactionListener {
    web3;
    web3ws;
    subscription;
    ruleSet;

    constructor(projectId, activeRuleSet) {
        this.web3ws = new Web3(new Web3.providers.WebsocketProvider(`wss://mainnet.infura.io/ws/v3/${projectId}`));
        this.web3 = new Web3(new Web3.providers.HttpProvider(`https://mainnet.infura.io/v3/${projectId}`));
        this.ruleSet = activeRuleSet
    }

    onRuleSetAddUpdate = (ruleSet) => {
        if (!ruleSet.isActive) return;
        console.log(`Current active ruleset is changed to ${ruleSet._id}`)
        this.ruleSet = ruleSet
    }

    onRuleSetDeleted = (ruleSet) => {
        if (this.ruleSet._id === ruleSet._id) {
            console.log(`Current active ruleset is deleted`)
            this.ruleSet = null;
        }
    }

    subscribe(topic) {
        topic = topic || 'pendingTransactions'
        this.subscription = this.web3ws.eth.subscribe(topic, (error, result) => {
            // TODO: Add Logging
        })
    }

    async unsubscribe(topic) {
        topic = topic || 'pendingTransactions'
        await this.subscription.unsubscribe()
    }

    listen(filterCb) {
        this.subscription.on('data', async (txHash) => {
            try {
                const ruleSet = { ...this.ruleSet._doc } // Making a copy for concurrency safety
                if (!ruleSet) return;

                const tx = await this.web3.eth.getTransaction(txHash);
                if (!tx) return;

                const ruleId = await filterCb(ruleSet, tx)
                if (!ruleId) return;

                const transaction = Transaction({
                    ...tx,
                    ruleSetId: ruleSet._id.toString(),
                    ruleId: ruleId.toString()
                })
                await transaction.save()
            }
            catch (err) {
                console.log(err)
            }
        });
    }
}

module.exports = TransactionListener