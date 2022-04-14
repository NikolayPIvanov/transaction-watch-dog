const express = require('express');
const ruleSetRoutes = require('./v1/ruleset')

const router = express.Router();

router.use('/v1/rules', ruleSetRoutes);

module.exports = router;