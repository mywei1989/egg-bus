import { QueueOptions } from 'bull';

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
