import pkg from 'dotenv';

import Server from './server/index.js';
import Routes from './routes/index.js';
import Log from './infrastructure/log/index.js';

const { config } = pkg;

const confg = config({
  path: '.env',
});

console.log(confg)

const server = new Server({ routes: Routes });

const cleanup = (type) => (err) => {
  server.stop(() => {
    Log.fatal({ err }, `${type} :: Shutting Down`);
    process.exit(1);
  });
};

process.on('uncaughtException', cleanup('Uncaught Exception'));
process.on('unhandledRejection', cleanup('Unhandled Rejection'));

server.start(3001, () => { });
