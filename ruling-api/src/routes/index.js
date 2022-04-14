const express = require('express');
const rulingRoutesv1 = require('./v1/ruling')

const router = express.Router();

router.use('/v1/rules', rulingRoutesv1);

module.exports = router;