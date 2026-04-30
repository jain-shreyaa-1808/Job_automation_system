import { Queue } from "bullmq";

import { getRedisConnection } from "../lib/redis.js";

export const JOB_QUEUE_NAMES = {
  scrape: "scrape-jobs",
  resumeGeneration: "resume-generation",
  autoApply: "auto-apply",
} as const;

type QueueName = (typeof JOB_QUEUE_NAMES)[keyof typeof JOB_QUEUE_NAMES];

export class QueueService {
  private readonly queues = new Map<QueueName, Queue>();

  private getQueue(name: QueueName) {
    const existing = this.queues.get(name);

    if (existing) {
      return existing;
    }

    const queue = new Queue(name, {
      connection: getRedisConnection(),
      defaultJobOptions: {
        attempts: 3,
        removeOnComplete: 100,
        backoff: {
          type: "exponential",
          delay: 2000,
        },
      },
    });

    this.queues.set(name, queue);
    return queue;
  }

  async enqueue(name: QueueName, payload: Record<string, unknown>) {
    return this.getQueue(name).add(name, payload);
  }
}
