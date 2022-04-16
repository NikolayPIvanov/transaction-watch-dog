const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const ruleSetSchema = new Schema({
    name: { type: String, required: true },
    isActive: { type: Boolean, required: true },
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

const fromToFilter = (rules, tx) => {
    const fromToRules = rules.filter(r => r.from || r.to)
    const matchingFilter = fromToRules.find(r => r.from === tx.from || r.to === tx.to)
    return matchingFilter;
}

const thresholdFilter = (lower, upper, value) => {
    let match = false
    if (lower !== undefined && upper !== undefined) {
        match = lower <= value && value <= upper
    }

    if (lower !== undefined && !match) {
        match = lower <= value
    }

    if (upper !== undefined && !match) {
        match = value <= upper
    }

    return match;
}

const valueFilter = (rules, tx) => {
    const valueRules = rules.filter(r => r.lowerValueThreshold !== undefined || r.upperValueThreshold !== undefined)
    const threshold = (rule, tx) => {
        const [lower, upper] = [rule.lowerValueThreshold, rule.upperValueThreshold]
        const value = Number(tx.value)
        const match = thresholdFilter(lower, upper, value)
        return match ? rule : null
    }

    const matchingFilter = valueRules.find(r => threshold(r, tx))
    return matchingFilter;
}

const gasFilter = (rules, tx) => {
    const valueRules = rules.filter(r => r.lowerGasThreshold !== undefined || r.upperGasThreshold !== undefined)
    const threshold = (rule, tx) => {
        const [lower, upper] = [rule.lowerGasThreshold, rule.upperGasThreshold]
        const value = Number(tx.gasPrice)
        const match = thresholdFilter(lower, upper, value)
        return match ? rule : null
    }

    const matchingFilter = valueRules.find(r => threshold(r, tx))
    return matchingFilter;
}

const filterTransaction = function (tx) {
    const matchingRules = []
    matchingRules.push(fromToFilter(this.rules, tx))
    matchingRules.push(valueFilter(this.rules, tx))
    matchingRules.push(gasFilter(this.rules, tx))
    return matchingRules.filter(r => r);
}

module.exports = {
    ruleSetSchema
}