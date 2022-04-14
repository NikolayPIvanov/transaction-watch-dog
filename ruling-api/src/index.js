const app = require('./app');

const expressWinston = require('express-winston');
const logger = require('./log/logger')
const config = require('./config/config')
const routes = require('./routes')
const mongoose = require('mongoose');

app.use(expressWinston.logger(logger));

app.use('/api', routes)

main = async () => {
    const mongo = await mongoose.connect(config.mongoUri);
    server = app.listen(config.port, () => {
        logger.info(`Listening to port ${config.port}`);
    });
}

main().catch(err => console.error(err))
