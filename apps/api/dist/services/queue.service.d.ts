export declare const JOB_QUEUE_NAMES: {
    readonly scrape: "scrape-jobs";
    readonly resumeGeneration: "resume-generation";
    readonly autoApply: "auto-apply";
};
type QueueName = (typeof JOB_QUEUE_NAMES)[keyof typeof JOB_QUEUE_NAMES];
export declare class QueueService {
    private readonly queues;
    private getQueue;
    enqueue(name: QueueName, payload: Record<string, unknown>): Promise<import("bullmq").Job<any, any, string>>;
}
export {};
