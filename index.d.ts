import { QueueOptions } from 'bull';
import { Context, Application } from 'egg';

interface Bus {
  dispatch(name: string, payload: any): void;
  emit(name: string, payload: any): void;
}

interface EggBusOptions {
  debug?: boolean,
  listener?: {
    baseDir?: string,
  },
  bull?: QueueOptions,
  job?: {
    baseDir?: string,
  },
  queues?: {
    [x: string]: QueueOptions
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
}
