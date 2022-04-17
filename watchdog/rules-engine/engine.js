const web3 = require('web3');

const fromToRule = (rules, tx) => {
  const fromToRules = rules.filter((r) => r.from || r.to);
  return fromToRules.find((r) => r.from === tx.from || r.to === tx.to);
};

const thresholdFilter = (lower, upper, rule, value) => {
  const ethValue = Number(web3.utils.fromWei(value, 'ether'));
  if (lower !== undefined && upper !== undefined) {
    return lower <= ethValue && ethValue <= upper;
  }

  let match = false;
  if (lower !== undefined) {
    match = lower <= ethValue;
  }

  if (upper !== undefined) {
    match = ethValue <= upper;
  }

  return match ? rule : null;
};

const valueRule = (rules, transaction) => {
  const valueRules = rules.filter((r) => r.lowerValueThreshold !== undefined
    || r.upperValueThreshold !== undefined);

  const threshold = (rule, tx) => {
    const [lower, upper] = [rule.lowerValueThreshold, rule.upperValueThreshold];
    return thresholdFilter(lower, upper, rule, tx.value);
  };

  const matchingFilter = valueRules.find((rule) => threshold(rule, transaction));
  return matchingFilter;
};

const gasRule = (rules, transaction) => {
  const valueRules = rules.filter((r) => r.lowerGasThreshold !== undefined
    || r.upperGasThreshold !== undefined);

  const threshold = (rule, tx) => {
    const [lower, upper] = [rule.lowerGasThreshold, rule.upperGasThreshold];
    return thresholdFilter(lower, upper, rule, tx.value);
  };

  const matchingFilter = valueRules.find((rule) => threshold(rule, transaction));
  return matchingFilter;
};

const statusRule = (rules, tx) => {
  const statusRules = rules.filter((r) => r.status !== undefined);
  return statusRules.find((rule) => rule.status === tx.status);
};

const inputRule = (rules, tx) => {
  const inputRules = rules.filter((r) => r.input !== undefined);
  return inputRules.find((rule) => web3.toAscii(tx.input).contains(rule.input));
};

const run = (rules, tx) => {
  const matchedRules = [];

  matchedRules.push(fromToRule(rules, tx));
  matchedRules.push(valueRule(rules, tx));
  matchedRules.push(gasRule(rules, tx));
  matchedRules.push(statusRule(rules, tx));
  matchedRules.push(inputRule(rules, tx));

  const foundRules = matchedRules.filter((r) => r);

  return foundRules;
};

module.exports = run;
