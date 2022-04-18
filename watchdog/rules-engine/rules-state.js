const state = (function () {
  let ruleSet = null;

  return {
    getRuleSet() {
      return ruleSet;
    },
    setRuleSet(value) {
      // eslint-disable-next-line no-underscore-dangle
      ruleSet = value?._doc || value;
    },
  };
}());

module.exports = state;
