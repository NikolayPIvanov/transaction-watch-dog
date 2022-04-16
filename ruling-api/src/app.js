const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const helmet = require("helmet");

const httpLogger = require('./log/httpLogger')
const routes = require('./routes')
const logger = require('./log/logger')
const config = require('./config/config')

const app = express();

app.use(cors()); // Enable All CORS

app.use(helmet()); // Adding Security Headers

app.use(express.json()); // JSON parsing

// app.use(expressWinston.logger(logger)); // Request logging

app.use(httpLogger)

app.use('/api', routes)

main = async () => {
    await mongoose.connect(config.mongoUri);
    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });
}

main().catch(err => console.error(err))

module.exports = app;