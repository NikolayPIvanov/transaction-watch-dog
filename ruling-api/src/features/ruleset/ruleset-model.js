const mongoose = require('mongoose');
const { ruleSetSchema: schema } = require('../../../../shared/models')

module.exports = mongoose.model('RuleSet', schema.ruleSetSchema);
