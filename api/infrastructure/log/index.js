import pino from 'pino';
import dotenv from 'dotenv';
import pkg from 'getenv';
import path from 'path';
import url from 'url';

const { string } = pkg;
const dirname = url.fileURLToPath(new URL('.', import.meta.url));

dotenv.config({ path: path.join(dirname, '..', '..', '.env') });

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
