'use strict';

module.exports = app => {
  const { router, controller } = app;

  router.get('/emit-event', controller.home.emitEvent);
  router.get('/dispatch-job', controller.home.dispatchJob);
};
