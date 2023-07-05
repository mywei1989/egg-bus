'use strict';
module.exports = async agent => {
  agent.messenger.on('emitEvent', async data => {
    agent.bus.emit('test', { name: data.name }, { removeOnComplete: true });
  });

  agent.messenger.on('dispatchJob', async data => {
    agent.bus.dispatch('test', { name: data.name }, { removeOnComplete: true });
  });
};
