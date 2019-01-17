'use strict';

const mock = require('egg-mock');

describe('test/bus.test.js', () => {
  let app;
  before(() => {
    app = mock.app({
      baseDir: 'apps/bus-test',
    });
    return app.ready();
  });

  after(() => app.close());
  afterEach(mock.restore);

  it('should GET /', () => {
    return app.httpRequest()
      .get('/')
      .expect('hi, bus')
      .expect(200);
  });
});
