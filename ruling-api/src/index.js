const app = require('./app');

const expressWinston = require('express-winston');
const logger = require('./log/logger')
const config = require('./config/config')
const routes = require('./routes')


app.use(expressWinston.logger(logger));

app.use('/api', routes)

server = app.listen(config.port, () => {
    logger.info(`Listening to port ${config.port}`);
});