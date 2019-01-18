import { Queue, QueueOptions, JobOptions } from 'bull';
import { Context, Application } from 'egg';

interface Bus {
  get(name: string): Queue;
  dispatch(name: string, payload?: any, options?: JobOptions): void;
  emit(name: string, payload?: any, options?: JobOptions): void;
}

interface EggBusOptions {
  debug?: boolean,
  concurrency?: number;
  listener?: {
    baseDir?: string;
    options?: JobOptions;
  },
  bull?: QueueOptions;
  job?: {
    baseDir?: string;
    options?: JobOptions;
  };
  queues?: {
    [x: string]: QueueOptions;
  }
}

declare module 'egg' {
  interface Application {
    bus: Bus;
  }

  interface EggAppConfig {
    bus: EggRedisOptions;
  }
}

declare module 'egg-bus' {
  abstract class Listener {
    ctx: Context;
    app: Application;
  }

  abstract class Job {
    ctx: Context;
    app: Application;
  }
}
