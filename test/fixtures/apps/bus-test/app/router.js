'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/emit-event', controller.home.emitEvent);
  router.get('/dispatch-job', controller.home.dispatchJob);

  router.get('/emit-event-agent', controller.home.emitEventFromAgent);
  router.get('/dispatch-job-agent', controller.home.dispatchJobFromAgent);
};
