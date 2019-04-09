'use strict';

const path = require('path');
const { JOB_TARGET } = require('./common');

exports.load = (app, config) => {
  const jobDir = path.join(app.baseDir, 'app', config.job.baseDir);
  const jobs = [];

  app.loader.loadToApp(jobDir, JOB_TARGET, {
    ignore: config.job.ignore,
    filter: job => job.isBus,
    initializer(job, pathInfo) {
      const name = pathInfo.pathName.replace(config.job.baseDir + '.', '');
      const queue = config.queue.prefix + ':' + (job.queue || config.queue.default);
      jobs.push({
        name,
        attempts: job.attempts,
        queue,
      });
      return job;
    },
  });

  return jobs;
};
