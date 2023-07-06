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

  it('emit event from agent', () => {
    return app.httpRequest()
      .get('/emit-event-agent')
      .expect('hi, event(from agent)')
      .expect(200);
  });

  it('dispatch job from agent', () => {
    return app.httpRequest()
      .get('/dispatch-job-agent')
      .expect('hi, job(from agent)')
      .expect(200);
  });

});
