'use strict';

const path = require('path');
const Job = require('./contract/job');
const { JOB_TARGET } = require('./common');

exports.load = (app, config) => {
  const jobDir = path.join(app.baseDir, 'app', config.job.baseDir);
  const jobs = [];

  app.loader.loadToApp(jobDir, JOB_TARGET, {
    ignore: config.job.ignore,
    filter: job => job instanceof Job,
    initializer(job, pathInfo) {
      jobs.push({
        name: /\w+$/.exec(pathInfo.pathName)[0],
        queue: job.queue || 'default',
      });
      return job;
    },
  });

  return jobs;
};
