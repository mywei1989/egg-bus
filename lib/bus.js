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

    queues[queue].on('failed', async (job, err) => {
      if (job.attemptsMade < job.data.attempts) {
        return;
      }

      const Job = app[JOB_TARGET][job.data.name];
      const instance = new Job(app, ctx);

      if (instance.failed) {
        await instance.failed(job.data.payload, err);
      }
    });

    queues[queue].process(config.concurrency, job => {
      const type = job.data.type;

      if (type === 'event') {
        const Listener = app[LISTENER_TARGET][job.data.file];
        const instance = new Listener(app, ctx);

        try {
          return instance.handle({
            name: job.data.name,
            data: job.data.payload,
          }, job);
        } catch (error) {
          app.coreLogger.error('[egg-bus] listener error: %s', error);
          return Promise.reject(error);
        }
      } else if (type === 'job') {
        const Job = app[JOB_TARGET][job.data.name];
        const instance = new Job(app, ctx);

        try {
          return instance.handle(job.data.payload, job);
        } catch (error) {
          app.coreLogger.error('[egg-bus] job error: %s', error);
          return Promise.reject(error);
        }
      }
    });
  });

  const emit = (name, payload, options) => {
    const listeners = events[name];

    if (!listeners) {
      if (config.debug) {
        app.coreLogger.warn(`[egg-bus] event ${name} has no listeners.`);
      }

      return;
    }

    for (const listener of listeners) {
      const conf = Object.assign(
        {},
        config.job.options,
        { attempts: listener.attempts || config.listener.options.attempts },
        options
      );

      queues[listener.queue].add({
        type: 'event',
        file: listener.name,
        name,
        payload
      }, conf);
    }
  };

  const dispatch = (name, payload, options) => {
    const job = jobs.find(_ => _.name === name);
    assert(!!job, `[egg-bus] job ${name} does not exist.`);

    const conf = Object.assign(
      {},
      config.job.options,
      { attempts: job.attempts || config.job.options.attempts },
      options
    );

    queues[job.queue].add({
      type: 'job',
      name,
      attempts: conf.attempts,
      payload
    }, conf);
  };

  const get = name => queues[name];

  app.bus = { listeners, events, jobs, queues, get, emit, dispatch };
};
