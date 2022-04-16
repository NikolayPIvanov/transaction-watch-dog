const watchdogConfig = require('../config')
const rascalConfig = require('../../shared/config/rabbitmq')
const Rascal = require('rascal');
const { rabbitMqUser, rabbitMqPassword } = watchdogConfig
const { RuleSet } = require('../models')

const broker = async () => {
    const brokerConfig = rascalConfig({ user: rabbitMqUser, password: rabbitMqPassword }).rascal
    const broker = await Rascal.BrokerAsPromised.create(Rascal.withDefaultConfig(brokerConfig));
    broker.on('error', console.error);
    return broker
}

const subscribe = async (broker, topic, cb) => {
    const subscription = await broker.subscribe(topic);
    subscription
        .on('message', async function (message, content, ackOrNack) {
            cb(message, content, ackOrNack)
        })
        .on('error', console.error);
}

const addRulesetListener = async (broker, cb) => {
    const topic = 'addRuleSet'
    const handler = async (message, content, ackOrNack) => {
        const parsedContent = JSON.parse(content)
        console.log(`Adding new ruleset: ${JSON.stringify(parsedContent.body)}`)
        const ruleSet = new RuleSet({ ...parsedContent.body })
        await ruleSet.save()
        cb(ruleSet)
        ackOrNack()
    }

    await subscribe(broker, topic, handler)
}

const updateRulesetListener = async (broker, cb) => {
    const topic = 'updateRuleSet'
    const handler = async (message, content, ackOrNack) => {
        const parsedContent = JSON.parse(content)
        console.log(`Updating ruleset: ${parsedContent.body}`)
        const id = req.params._id
        const update = { ...parsedContent.body }
        const ruleSet = await RuleSet.findByIdAndUpdate(id, update)
        cb(ruleSet)
        ackOrNack()
    }

    await subscribe(broker, topic, handler)
}

const deleteRulesetListener = async (broker, cb) => {
    const topic = 'deleteRuleSet'
    const handler = async (message, content, ackOrNack) => {
        const parsedContent = JSON.parse(content)
        console.log(`Deleting ruleset: ${parsedContent.body}`)
        const ruleSet = await RuleSet.findByIdAndDelete(parsedContent._id)
        cb(ruleSet)
        ackOrNack()
    }

    await subscribe(broker, topic, handler)
}

exports.broker = broker
exports.add = addRulesetListener
exports.update = updateRulesetListener
exports.delete = deleteRulesetListener