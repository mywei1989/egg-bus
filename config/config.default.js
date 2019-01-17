'use strict';

/**
 * egg-bus default config
 * @member Config#bus
 * @property {String} SOME_KEY - some description
 */
exports.bus = {
  listener: {
    baseDir: 'listener',
  },
  bull: {
    /* Bull Config */
  },
  queue: {
    enable: true,
  }
};
