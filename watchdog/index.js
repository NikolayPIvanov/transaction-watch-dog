const engine = require('./rules-engine');
const logger = require('../shared/logging');

engine().catch((err) => logger.error(err));
