const express = require('express');
const ruleSetController = require('../../controllers/ruleset')

const router = express.Router();

// Ignore Authentication and Authorization

router.get('/', (req, res, next) => {
    res.status(200).json('message')
    next();
})

router.get('/:id', (req, res, next) => {
    next();
})

router.post('/', ruleSetController.createRuleSet)

router.put('/:id', (req, res, next) => {
    next();
})

router.delete('/:id', (req, res, next) => {
    next();
})

module.exports = router;
