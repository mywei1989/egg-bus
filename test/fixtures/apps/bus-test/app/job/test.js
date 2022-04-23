'use strict';

const { setPayload } = require('../tester');

class DemoJob {

  static get isBus() {
    return true;
  }

  async run(data) {
    setPayload(`hi, ${data.name}`);
  }
}

module.exports = DemoJob;
