const express = require('express');

const router = express.Router();

// Ignore Authentication and Authorization for now

router.get('/', (req, res, next) => {
    res.status(200).json('message')
    next();
})

router.get('/:id', (req, res, next) => {
    next();
})

router.post('/', (req, res, next) => {
    next();
})

router.put('/:id', (req, res, next) => {
    next();
})

router.delete('/:id', (req, res, next) => {
    next();
})

module.exports = router;
