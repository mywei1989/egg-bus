'use strict';

const bus = require('./lib/bus');

module.exports = agent => {
  if (agent.config.bus.agent) bus(agent);
};
