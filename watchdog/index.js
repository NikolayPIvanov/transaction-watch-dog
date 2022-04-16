const config = require('./config')
const { messageListener, TransactionListener } = require('./listeners')
const mongoose = require('mongoose');
const { RuleSet } = require('./models')
const rulesEngine = require('./rules-engine')

loadRuleSetAsync = async () => {
    console.log('Loading currently active configuration...')
    const filter = { isActive: true }
    return await RuleSet.findOne(filter);
}

main = async () => {
    await mongoose.connect(config.mongoUri);

    const ruleSet = await loadRuleSetAsync()
    console.log(`Active configuration loaded: ${ruleSet}`)

    const broker = await messageListener.broker();
    const transactions = new TransactionListener(config.infuraId, ruleSet)

    await messageListener.add(broker, transactions.onRuleSetAddUpdate)
    await messageListener.update(broker, transactions.onRuleSetAddUpdate)
    await messageListener.delete(broker, transactions.onRuleSetDeleted)

    transactions.subscribe()
    transactions.listen((ruleSet, tx) => {
        debugger;
        const matchingRules = rulesEngine(ruleSet.rules, tx)
        return matchingRules.length === 0 ? null : matchingRules[0]._id
    })
}

main().catch(err => console.error(err))
