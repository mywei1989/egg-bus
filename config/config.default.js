'use strict';

/**
 * egg-bus default config
 * @member Config#bus
 * @property {String} SOME_KEY - some description
 */
exports.bus = {
  app: true,
  agent: true,
  debug: true,
  concurrency: 1,
  listener: {
    baseDir: 'listener',
    options: {
      attempts: 5,
      backoff: {
        delay: 3000,
        type: 'fixed',
      },
    },
  },
  bull: {
    redis: {
      host: 'localhost',
      port: 6379,
      db: 0,
    },
  },
  job: {
    baseDir: 'job',
    options: {
      attempts: 5,
      backoff: {
        delay: 3000,
        type: 'fixed',
      },
    },
  },
  queue: {
    default: 'default', // 默认队列名称
    prefix: 'bus', // 队列前缀
  },
  queues: {
    worker: {
      concurrency: 2,
    },
  },
};
