const web3 = require('web3')

const build = function (rules, tx) {
    const matchingRules = []
    matchingRules.push(fromToRule(rules, tx))
    // TODO: Refactor
    matchingRules.push(valueRule(rules, tx, 'lowerValueThreshold', 'upperValueThreshold'))
    matchingRules.push(valueRule(rules, tx, 'lowerGasThreshold', 'upperGasThreshold'))
    matchingRules.push(statusRule(rules, tx));
    matchingRules.push(inputRule(rules, tx));
    return matchingRules.filter(r => r);
}

const fromToRule = (rules, tx) => {
    const fromToRules = rules.filter(r => r.from || r.to)
    return fromToRules.find(r => r.from === tx.from || r.to === tx.to)
}

const valueRule = (rules, tx, lowerProperty, upperProperty) => {
    const valueRules = rules.filter(r => r[lowerProperty] !== undefined || r[upperProperty] !== undefined)
    const threshold = (rule, tx) => {
        const [lower, upper] = [rule[lowerProperty], rule[upperProperty]]
        const value = Number(tx.value)
        const match = thresholdFilter(lower, upper, value)
        return match ? rule : null
    }

    const matchingFilter = valueRules.find(r => threshold(r, tx))
    return matchingFilter;
}

const statusRule = (rules, tx) => {
    const statusRules = rules.filter(r => r.status !== undefined);
    return statusRules.find(rule => rule.status === tx.status)
}

const inputRule = (rules, tx) => {
    const inputRules = rules.filter(r => r.input !== undefined);
    return inputRules.find(rule => web3.toAscii(tx.input).contains(rule.input))
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

module.exports = build