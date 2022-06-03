import express from 'express';
import invariant from 'invariant';

export default class Server {
  #app;

  #instance;

  constructor({ routes }) {
    this.#app = express();

    this.#app.use(routes);
  }

  start(port, cb) {
    invariant(
      !this.#instance,
      'Cannot start a server that has already been started. Please stop the server instance and try calling start again.',
    );

    this.#instance = this.#app.listen(port, cb);

    return this;
  }

  stop(cb) {
    if (!this.#instance) {
      cb();

      return this;
    }

    this.#instance.close(cb);

    this.#instance = undefined;

    return this;
  }
}
