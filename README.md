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

🐣用 egg 编写优雅的队列与事件，基于 [bull](https://github.com/OptimalBits/bull) 实现

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
    ignore: null, // 忽略目录中的某些文件，https://eggjs.org/zh-cn/advanced/loader.html#ignore-string
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

## 使用

**bus** 会读取 `app` 目录中的 `listener` 和 `job` 目录（默认，可通过配置修改）并解析
相关配置。

```bash
app
├── controller
│   ├── home.ts
├── job        <-- 队列目录
│   └── something.ts
├── listener   <-- 事件监听目录
│   ├── spy.ts
├── router.ts
```

### Job

`job` 是队列中的一项任务。在 `app/job` 目录，定义一个 `job`：

```js
const { Job } = require('egg-bus');

class DemoJob extends Job {
  static get queue() {
    return 'queue_name'; // 使用的队列名称
  }

  static get attempts() {
    return 5; // 重试次数
  }

  async run(data, job) {
    // job 任务运行时调用
    // 第一个参数是发送过来的数据
    // 第二个参数是 Bull 的原始 Job 对象
    // 通过 this.ctx 和 this.app 分别获取 egg 的 Context 和 Application 对象
  }

  failed(data) {
    // 当 job 失败并重试达到限定次数后调用
  }
}

module.exports = DemoJob;
```

在 run 中抛出任何未捕获的异常都会认为 `job` 执行失败，会在指定次数内重新尝试。

通过 `dispatch` 方法触发一个 `job` ：

```js
const data = { name: 'abel' };
app.bus.dispatch('demo', data);
```

### Listener

`listener` 用于监听事件发生并执行某些任务。很多情况下，我们需要将核心业务与一些耗时
任务分开来提高响应速度或解耦增强可维护性和移植性。

`nodejs` 本身支持异步，可以解决响应速度的问题，基于事件，也可以达到解耦的目的。但实
际使用起来却有很多麻烦：

1. 在异步中运行的代码如果不使用 `app.runInBackground` 就无法被 `egg` 捕获异常而记录日志；
2. 如果发生错误，没有重试机制；
3. `nodejs` 本身的 `event` 机制在 `listener` 数量上有限制，虽然可以通过参数提高这个阈值，
但这可能引发其它问题。
4. 不够优雅！不够优雅！不够优雅！有很多类似的模块来解决这些问题，但大多只提供了基础功能。
比如告诉你怎么创建队列，怎么监听队列，却并没有告诉你这些创建队列、监听队列的代码应该放在何处。

因此，为了解决上面这些问题，参考 `laravel` 的事件机制设计了 `listener`。

```js
const { Listener } = require('egg-bus');

class DemoListener extends Listener {
  static get watch() {
    return [ 'opened', 'visited' ]; // 监听的事件名称
  }

  static get queue() {
    return 'queue_name'; // 使用的队列名称
  }

  static get attempts() {
    return 5; // 重试次数
  }

  async run(event, job) {
    // listener 任务运行时调用
    // 与 job 不同，第一个参数是 event 对象，其中包含以下值：
    // - name 事件名称
    // - data 数据
    // 第二个参数是 Bull 的原始 Job 对象
    // 通过 this.ctx 和 this.app 分别获取 egg 的 Context 和 Application 对象
    console.log(event.name, event.data);
  }

  failed(event, error, job) {
    // 当 listener 失败并重试达到限定次数后调用
  }
}

module.exports = DemoListener;
```

事件的监听并不需要编写对应关系，你只需要告诉 `listener` 需要注意哪些事件就行了。


通过 `emit` 方法触发一个 `事件` ：

```js
const data = { name: 'abel' };
app.bus.emit('demo', data);
```

## 问题和建议

请创建 [issue](https://github.com/eggjs/egg/issues).

## License

[MIT](LICENSE)
