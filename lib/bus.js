'use strict';

const path = require('path');
const Bull = require('bull');
const assert = require('assert');
const target = Symbol('Application#bus#listeners');

const createBullInstance = (app, name, config) => {
  const bull = new Bull(name, config);

  bull.on('error', error => {
    app.coreLogger.error(`[egg-bus] bull error: %s`, error);
  });

  app.beforeStart(() => {
    app.coreLogger.info(`[egg-bus] bull queue ${name} is OK.`);
  });

  return bull;
};

class Bus {
  constructor(app, events, queues) {
    this.app = app;
    this.events = events;
    this.queues = queues;
  }

  emit(name, payload) {
    const listeners = this.events[name];
    assert(!!listeners, `[egg-bus] event ${name} does not exist.`);

    for (let listener of listeners) {
      this.queues[listener.queue].add({
        name: listener.name,
        payload,
      });
    }
  }
}

module.exports = app => {
  const config = app.config.bus;
  const ctx = app.createAnonymousContext();

  const events = {};
  const queues = {
    default: createBullInstance(
      app,
      'default',
      config.bull
    )
  };

  const install = (name, listener) => {
    assert(
      listener.events instanceof Array,
      `[egg-bus] the events property of ${listener.name} must be an array`
    );

    const queue = listener.queue || 'default';
    listener.events.forEach((event) => {
      if (!events[event]) {
        events[event] = [];
      }

      events[event].push({ name, queue });
    });

    if (queue !== 'default' && !queues[queue]) {
      queues[listener.queue] = createBullInstance(
        app,
        listener.queue,
        Object.assign({}, config.bull, listener.queueConfig)
      );
    }
  }

  const dir = path.join(app.baseDir, 'app', config.listener.baseDir);
  app.loader.loadToApp(dir, target, {
    ignore: config.listener.ignore,
    filter: (listener) => {
      if (!listener || !listener.events) {
        return false;
      }

      return true;
    },
    initializer(listener, pathInfo) {
      install(/\w+$/.exec(pathInfo.pathName)[0], listener);
      return listener;
    },
  });

  for(let idx in queues) {
    const queue = queues[idx];
    queue.process(job => {
      const Listener = app[target][job.data.name];
      const instance = new Listener();

      try {
        return instance.handle(job.data.payload);
      } catch (error) {
        app.coreLogger.error(`[egg-bus] queue error: %s`, error);
        return Promise.reject(error);
      }
    });
  }

  app.bus = new Bus(app, events, queues);
};
