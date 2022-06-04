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
  // prettyPrint:
  //   string('NODE_ENV', '') === 'production'
  //     ? undefined
  //     : {
  //       levelFirst: true,
  //     },
});

export default Log;
