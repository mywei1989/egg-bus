'use strict';

class HelloListener {
  static get watch() {
    return [ 'boot' ];
  }

  run(data) {
    console.log(`hello ${data.name}`);
  }
}

module.exports = HelloListener;
