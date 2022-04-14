const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ruleSetSchema = new Schema({
    name: { type: String, required: true },
    rules: [
        {
            name: { type: String, required: true },

            // From / To
            from: { type: String, required: false },
            to: { type: String, required: false },

            // Value in Wei
            lowerValueThreshold: { type: Number, required: false },
            upperValueThreshold: { type: Number, required: false },

            // Gas Price in Wei
            lowerGasThreshold: { type: Number, required: false },
            upperGasThreshold: { type: Number, required: false },

            // Input
            input: { type: String, require: false },

            // Status
            status: { type: Boolean, required: false }
        }
    ]
});

module.exports = mongoose.model('RuleSet', ruleSetSchema);