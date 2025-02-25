'use strict';

const { getPayload, setPayload } = require('../tester');

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async emitEvent() {
    const { app, ctx } = this;

    setPayload(null);
    app.bus.emit('test', { name: 'event' }, { removeOnComplete: true });

    ctx.body = await this.echo();
  }

  async dispatchJob() {
    const { app, ctx } = this;

    setPayload(null);
    app.bus.dispatch('test', { name: 'job' }, { removeOnComplete: true });

    ctx.body = await this.echo();
  }

  async echo() {
    return await new Promise(resolve => {
      setInterval(() => {
        const payload = getPayload();
        if (payload) {
          resolve(payload);
        }
      }, 100);
    });
  }
}

module.exports = HomeController;
