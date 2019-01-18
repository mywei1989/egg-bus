'use strict';

class Listener {
  constructor(app, ctx) {
    this.app = app;
    this.ctx = ctx;
  }

  static get isBus() {
    return true;
  }
}

module.exports = Listener;
