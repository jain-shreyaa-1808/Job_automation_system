import { Queue } from "bullmq";
import { getRedisConnection } from "../lib/redis.js";
export const JOB_QUEUE_NAMES = {
    scrape: "scrape-jobs",
    resumeGeneration: "resume-generation",
    autoApply: "auto-apply",
};
export class QueueService {
    queues = new Map();
    getQueue(name) {
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
    async enqueue(name, payload) {
        return this.getQueue(name).add(name, payload);
    }
}
//# sourceMappingURL=queue.service.js.map