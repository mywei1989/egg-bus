'use strict';

const { setPayload } = require('../tester');

class HelloListener {
  static get watch() {
    return [ 'test' ];
  }

  static get isBus() {
    return true;
  }

  run(event) {
    setPayload(`hi, ${event.data.name}`);
  }
}

module.exports = HelloListener;
