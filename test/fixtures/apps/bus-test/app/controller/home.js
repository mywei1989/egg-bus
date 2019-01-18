'use strict';

const Controller = require('egg').Controller;

class HomeController extends Controller {
  async index() {
    const { app, ctx } = this;

    app.bus.emit('boot', { name: 'abel' });

    ctx.body = 'hi, bus';
  }
}

module.exports = HomeController;
