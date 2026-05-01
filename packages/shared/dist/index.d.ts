export type HealthStatus = {
    status: "ok";
    service: string;
};
export declare const JOB_QUEUE_NAMES: {
    readonly scrape: "scrape-jobs";
    readonly resumeGeneration: "resume-generation";
    readonly autoApply: "auto-apply";
};
export type JobQueueName = (typeof JOB_QUEUE_NAMES)[keyof typeof JOB_QUEUE_NAMES];
export type AutoApplyJobPayload = {
    userId: string;
    jobId: string;
    rateLimitPerMinute: number;
    captchaFallback: "manual-review";
};
export type ScrapeJobPayload = {
    userId: string;
    targetPlatforms: string[];
    preferredRoles: string[];
    preferredLocations: string[];
};
export type ResumeGenerationPayload = {
    userId: string;
    jobId: string;
    template: "latex";
};
