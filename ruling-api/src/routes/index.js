const express = require('express');
const ruleSetRoutes = require('./v1/ruleset');
const { ApiError, httpCodes } = require('../utils/errors');

const router = express.Router();

router.use('/v1/rules', ruleSetRoutes);

router.use('*', (req, res, next) => {
  next(new ApiError('Route not found', httpCodes.NOT_FOUND, 'Invalid route'));
});

module.exports = router;
