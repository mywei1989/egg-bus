'use strict';

class HelloListener {
  static get watch() {
    return [ 'boot' ];
  }

  handle(data) {
    console.log(`hello ${data.name}`);
  }
}

module.exports = HelloListener;
