const mongoose = require('mongoose');
const { ruleSetSchema } = require('../../shared/models/ruleset-schema');

ruleSetSchema.add({
  externalId: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('RuleSet', ruleSetSchema);
