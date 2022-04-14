const mongoose = require('mongoose');

const RuleSet = require('../models/ruleset')
const Message = require('../models/message')

exports.createRuleSet = async (req, res, next) => {
    let ruleSet = new RuleSet({ ...req.body })
    // Validation
    ruleSet = await ruleSet.save()

    const message = new Message({
        ts: Date.now(),
        data: ruleSet,
        read: false,
        sent: false
    })

    await message.save()
}