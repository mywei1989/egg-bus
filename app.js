'use strict';

const bus = require('./lib/bus');

module.exports = app => {
  if (app.config.bus.app) bus(app);
};
