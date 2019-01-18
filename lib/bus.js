'use strict';

const bull = require('./bull');
const assert = require('assert');
const job = require('./job');
const listener = require('./listener');
const { LISTENER_TARGET, JOB_TARGET } = require('./common');

module.exports = app => {
  const config = app.config.bus;
  const ctx = app.createAnonymousContext();

  const { events, listeners } = listener.load(app, config);
  const jobs = job.load(app, config);

  // 合并 listener 和 job 的队列
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
        const Listener = app[LISTENER_TARGET][job.data.file];
        const instance = new Listener(app, ctx);

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
        const Job = app[JOB_TARGET][job.data.name];
        const instance = new Job(app, ctx);

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
      queues[listener.queue].add({ type: 'event', file: listener.name, name, payload });
    }
  };

  const dispatch = (name, payload) => {
    const job = jobs.find(_ => _.name === name);
    assert(!!job, `[egg-bus] job ${name} does not exist.`);

    queues[job.queue].add({ type: 'job', name, payload });
  };

  app.bus = { listeners, events, jobs, queues, emit, dispatch };
};
