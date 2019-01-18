'use strict';

class Job {
  constructor(app, ctx) {
    this.app = app;
    this.ctx = ctx;
  }

  static get isBus() {
    return true;
  }
}

module.exports = Job;
