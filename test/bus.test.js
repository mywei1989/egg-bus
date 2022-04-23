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

  it('emit event', () => {
    return app.httpRequest()
      .get('/emit-event')
      .expect('hi, event')
      .expect(200);
  });

  it('dispatch job', () => {
    return app.httpRequest()
      .get('/dispatch-job')
      .expect('hi, job')
      .expect(200);
  });
});
