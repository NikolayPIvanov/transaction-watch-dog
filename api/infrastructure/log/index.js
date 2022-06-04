import pino from 'pino';
import pkg from 'getenv';
import configure from '../config/index.js';

configure();

const { string } = pkg;

const Log = pino({
  name: string('SERVICE_NAME'),
  level: string('LOG_LEVEL'),
  serializers: pino.stdSerializers,
  redact: ['password', '*.password'],
});

export default Log;
