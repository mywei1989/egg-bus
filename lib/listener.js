'use strict';

const path = require('path');
const { LISTENER_TARGET } = require('./common');
const ListenerBase = require('./contract/listener');

exports.load = (app, config) => {
  const dir = path.join(app.baseDir, 'app', config.listener.baseDir);
  const listeners = [];
  const events = Object.create(null);

  app.loader.loadToApp(dir, LISTENER_TARGET, {
    ignore: config.listener.ignore,
    filter: listener => listener instanceof ListenerBase,
    initializer(listener, pathInfo) {
      listeners.push({
        name: /\w+$/.exec(pathInfo.pathName)[0],
        queue: listener.queue || 'default',
        watch: listener.watch,
      });

      for (const event of listener.watch) {
        if (!events[event]) {
          events[event] = [];
        }

        events[event].push({
          name: listener.name,
          queue: listener.queue || 'default',
        });
      }

      return listener;
    },
  });

  return { events, listeners };
};
