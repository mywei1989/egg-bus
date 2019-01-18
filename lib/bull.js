'use strict';

const Bull = require('bull');

exports.create = (app, name, config) => {
  const bull = new Bull(name, config);

  bull.on('error', error => {
    app.coreLogger.error('[egg-bus] bull error: %s', error);
  });

  app.beforeStart(() => {
    app.coreLogger.info(`[egg-bus] bull queue ${name} is OK.`);
  });

  return bull;
};
