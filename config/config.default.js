'use strict';

/**
 * egg-bus default config
 * @member Config#bus
 * @property {String} SOME_KEY - some description
 */
exports.bus = {
  debug: true,
  listener: {
    baseDir: 'listener',
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
  },
  queue: {
    default: 'default', // 默认队列名称
    prefix: 'bus', // 队列前缀
  },
  queues: {},
};
