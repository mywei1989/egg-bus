'use strict';

const bull = require('./bull');
const assert = require('assert');
const job = require('./job');
const listener = require('./listener');

module.exports = app => {
  const config = app.config.bus;
  const ctx = app.createAnonymousContext();

  const { events, listeners } = listener.load(app, config);
  const jobs = job.load(app, config);

  // 合并 listener 和 queue 的队列
  const queues = Object.create(null);
  Array.from(new Set([
    'default',
    ...listeners.map(_ => _.queue),
    ...jobs.map(_ => _.queue),
  ])).forEach(queue => {
    queues[queue] = bull.create(
      app,
      queue,
      Object.assign({}, config.bull, config.queues[queue])
    );

    queues[queue].process(job => {
      const type = job.data.type;

      if (type === 'event') {
        const Listener = listeners.find(_ => _.name === job.data.name);
        const instance = new Listener({ app, ctx });

        try {
          return instance.handle({
            name: job.data.name,
            data: job.data.payload,
          });
        } catch (error) {
          app.coreLogger.error('[egg-bus] listener error: %s', error);
          return Promise.reject(error);
        }
      } else if (type === 'job') {
        const Listener = jobs.find(_ => _.name === job.data.name);
        const instance = new Listener({ app, ctx });

        try {
          return instance.handle(job.data.payload);
        } catch (error) {
          app.coreLogger.error('[egg-bus] listener error: %s', error);
          return Promise.reject(error);
        }
      }
    });
  });

  const emit = (name, payload) => {
    const listeners = events[name];

    if (!listeners) {
      if (config.debug) {
        app.coreLogger.warn(`[egg-bus] event ${name} has no listeners.`);
      }

      return;
    }

    for (const listener of listeners) {
      queues[listener.queue].add({ type: 'event', name, payload });
    }
  };

  const dispatch = (name, payload) => {
    assert(!!jobs[name], `[egg-bus] job ${name} does not exist.`);

    const queue = app[Symbol('Application#bus#queue#target')][name].queue;

    queues[queue].add({ type: 'job', name, payload });
  };

  app.bus = { listeners, events, jobs, queues, emit, dispatch };
};
