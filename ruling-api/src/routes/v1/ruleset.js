const express = require('express');
const validator = require('express-joi-validation')
  .createValidator({ passError: true, joi: { abortEarly: false } });

const { ruleSetHandlers, ruleSetValidators } = require('../../features/ruleset');

const router = express.Router();

router.get('/', ruleSetHandlers.getRuleSets);
router.get(
  '/:id',
  validator.params(ruleSetValidators.getRuleSetSchema.params),
  ruleSetHandlers.getRuleSet,
);
router.post(
  '/',
  validator.body(ruleSetValidators.createRuleSetSchema.body),
  ruleSetHandlers.createRuleSet,
);
router.put(
  '/:id',
  validator.params(ruleSetValidators.updateRuleSetSchema.params),
  validator.body(ruleSetValidators.updateRuleSetSchema.body),
  ruleSetHandlers.updateRuleSet,
);
router.delete(
  '/:id',
  validator.params(ruleSetValidators.deleteRuleSetSchema.params),
  ruleSetHandlers.deleteRuleSet,
);

module.exports = router;
