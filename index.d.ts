import { Context, Application } from 'egg';
import { Queue, QueueOptions, JobOptions, Job } from 'bull';

interface Bus {
  get(name: string): Queue;
  dispatch(name: string, payload?: any, options?: JobOptions): void;
  emit(name: string, payload?: any, options?: JobOptions): void;
}

interface BusEvent {
  name: string;
  data: any;
}

interface EggBusOptions {
  app?: boolean;
  agent?: boolean;
  debug?: boolean;
  concurrency?: number;
  listener?: {
    ignore?: string;
    baseDir?: string;
    options?: JobOptions;
  },
  bull?: QueueOptions;
  job?: {
    ignore?: string;
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
    bus: EggBusOptions;
  }
}

declare module 'egg-bus' {
  abstract class Listener {
    ctx: Context;
    app: Application;

    abstract get watch(): string[];
    abstract run(event: BusEvent, job: Job): Promise<any>;
  }

  abstract class Job {
    ctx: Context;
    app: Application;

    abstract run(data: any, job: Job): Promise<any>;
  }
}
