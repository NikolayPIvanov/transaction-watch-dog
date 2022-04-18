const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

module.exports = {
  cron: process.env.CRON_EXPRESSION || '*/5 * * * * *',
  mongoUri: process.env.MONGODB_URI,
  rabbitMqHostname: process.env.RABBITMQ_HOSTNAME || 'localhost',
  rabbitMqProtocol: process.env.RABBITMQ_PROTOCOL || 'amqp',
  rabbitMqPort: process.env.RABBITMQ_PORT || 5672,
  rabbitMqUser: process.env.RABBITMQ_USER || 'myuser',
  rabbitMqPassword: process.env.RABBITMQ_PASS || 'mypassword',
};
