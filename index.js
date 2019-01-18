'use strict';

const QueueBase = require('./lib/contract/queue');
const ListenerBase = require('./lib/contract/listener');

module.exports = {
  Queue: QueueBase,
  Listener: ListenerBase,
};
