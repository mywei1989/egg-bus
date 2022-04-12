import { Context, Application } from "egg";
import { Queue, QueueOptions, JobOptions, Job as BullJob } from "bull";

interface Bus {
  get(name: string): Queue;
  dispatch<T = object>(name: string, payload?: T, options?: JobOptions): void;
  emit<T = object>(name: string, payload?: T, options?: JobOptions): void;
}

interface BusEvent<T = object> {
  name: string;
  data: T;
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
  };
  bull?: QueueOptions;
  queue?: {
    prefix?: string;
    default?: string;
  };
  job?: {
    ignore?: string;
    baseDir?: string;
    options?: JobOptions;
  };
  queues?: {
    [x: string]: QueueOptions & { concurrency: number };
  };
}

declare module "egg" {
  interface Application {
    bus: Bus;
  }

  interface EggAppConfig {
    bus: EggBusOptions;
  }
}

declare module "egg-bus" {
  interface ListenerStruct<T> {
    name: string;
    data: T;
  }

  abstract class Listener<T = object> {
    ctx: Context;
    app: Application;

    abstract run(event: BusEvent<T>, job: BullJob): Promise<any>;
    abstract failed(
      struct: ListenerStruct<T>,
      error: Error,
      job: BullJob
    ): Promise<any>;
  }

  abstract class Job<T = object> {
    ctx: Context;
    app: Application;

    abstract run(data: T, job: BullJob): Promise<any>;
    abstract failed(data: T, error: Error, job: BullJob): Promise<any>;
  }
}
