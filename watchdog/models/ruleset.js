const mongoose = require('mongoose')
const { ruleSetSchema } = require('../../shared/models/ruleset-schema')

module.exports = mongoose.model('RuleSet', ruleSetSchema)