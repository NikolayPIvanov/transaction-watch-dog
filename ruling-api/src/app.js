const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors')
const helmet = require("helmet");

const { httpLogger, logger } = require('./log')
const routes = require('./routes')
const { serverConfig } = require('./config')

const app = express();

app.use(cors()); // Enable All CORS

app.use(helmet()); // Adding Security Headers

app.use(express.json()); // JSON parsing

// app.use(expressWinston.logger(logger)); // Request logging

app.use(httpLogger)

app.use('/api', routes)

main = async () => {
    await mongoose.connect(serverConfig.mongoUri);
    server = app.listen(serverConfig.port, () => {
        logger.info(`Listening to port ${serverConfig.port}`);
    });
}

main().catch(err => console.error(err))

module.exports = app;