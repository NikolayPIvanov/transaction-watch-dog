import Server from './server/index.js';
import Routes from './routes/index.js';
import Log from './infrastructure/log/index.js';

import pkg from 'getenv';

const { int } = pkg

const server = new Server({ routes: Routes });

const cleanup = (type) => (err) => {
  server.stop(() => {
    Log.fatal({ err }, `${type} :: Shutting Down`);
    process.exit(1);
  });
};

process.on('uncaughtException', cleanup('Uncaught Exception'));
process.on('unhandledRejection', cleanup('Unhandled Rejection'));

const port = int('PORT')
server.start(port, async () => {
  Log.info(`Starting server on ${port}`)
});
