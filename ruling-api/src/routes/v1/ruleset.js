const express = require('express');
const validate = require('../../middlewares/validate')

const { ruleSetHandlers, ruleSetValidators } = require('../../features/ruleset')

const router = express.Router();

router.get('/', ruleSetHandlers.getRuleSets)
router.get('/:id', validate(ruleSetValidators.getRuleSetSchema), ruleSetHandlers.getRuleSet)
router.post('/', validate(ruleSetValidators.createRuleSetSchema), ruleSetHandlers.createRuleSet)
router.put('/:id', validate(ruleSetValidators.updateRuleSetSchema), ruleSetHandlers.updateRuleSet)
router.delete('/:id', validate(ruleSetValidators.deleteRuleSetSchema), ruleSetHandlers.deleteRuleSet)

module.exports = router;
