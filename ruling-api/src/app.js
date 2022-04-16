const express = require('express');
const cors = require('cors')
const helmet = require("helmet");
const httpLogger = require('./log/httpLogger')

const app = express();

app.use(cors()); // Enable All CORS

app.use(helmet()); // Adding Security Headers

app.use(express.json()); // JSON parsing

// app.use(expressWinston.logger(logger)); // Request logging

app.use(httpLogger)

module.exports = app;