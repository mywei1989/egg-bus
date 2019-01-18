# egg-bus

[![NPM version][npm-image]][npm-url]
[![build status][travis-image]][travis-url]
[![Test coverage][codecov-image]][codecov-url]
[![David deps][david-image]][david-url]
[![Known Vulnerabilities][snyk-image]][snyk-url]
[![npm download][download-image]][download-url]

[npm-image]: https://img.shields.io/npm/v/egg-bus.svg?style=flat-square
[npm-url]: https://npmjs.org/package/egg-bus
[travis-image]: https://img.shields.io/travis/hexindai/egg-bus.svg?style=flat-square
[travis-url]: https://travis-ci.org/hexindai/egg-bus
[codecov-image]: https://img.shields.io/codecov/c/github/hexindai/egg-bus.svg?style=flat-square
[codecov-url]: https://codecov.io/github/hexindai/egg-bus?branch=master
[david-image]: https://img.shields.io/david/hexindai/egg-bus.svg?style=flat-square
[david-url]: https://david-dm.org/hexindai/egg-bus
[snyk-image]: https://snyk.io/test/npm/egg-bus/badge.svg?style=flat-square
[snyk-url]: https://snyk.io/test/npm/egg-bus
[download-image]: https://img.shields.io/npm/dm/egg-bus.svg?style=flat-square
[download-url]: https://npmjs.org/package/egg-bus

【WIP】 基于 [bull](https://github.com/OptimalBits/bull) 实现的事件队列系统。

## 安装

```bash
$ npm i egg-bus --save
```

## 使用

```js
exports.bus = {
  enable: true,
  package: 'egg-bus',
};
```

## 配置

```js
// {app_root}/config/config.default.js
exports.bus = {
  debug: true, // Debug 模式下会打印更多日志信息
  concurrency: 1, // Bull 中队列处理的并发数：https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueprocess
  listener: {
    baseDir: 'listener',
    options: { // Bull Job 配置： https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queueadd
      attempts: 5,
      backoff: {
        delay: 3000,
        type: 'fixed',
      },
    }
  },
  job: {
    // 与 listener 一致，唯一不同的就是 默认 baseDir 的值为 `job`
  },
  bull: { // Bull 队列配置：https://github.com/OptimalBits/bull/blob/develop/REFERENCE.md#queue
    redis: {
      host: 'localhost',
      port: 6379,
      db: 0,
    },
  },

  queue: {
    default: 'default', // 默认队列名称
    prefix: 'bus', // 队列前缀
  },
  queues: { // 针对不同队列单独配置

    // 比如针对默认队列更改 redis 端口
    default: {
      redis: {
        port: 6380,
      },
    }
  },
};
```

更多配置说明请查看 [config/config.default.js](config/config.default.js)

## Example

<!-- example here -->

## Questions & Suggestions

Please open an issue [here](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
