export type HealthStatus = {
  status: "ok";
  service: string;
};

export const JOB_QUEUE_NAMES = {
  scrape: "scrape-jobs",
  resumeGeneration: "resume-generation",
  autoApply: "auto-apply",
} as const;

export type JobQueueName =
  (typeof JOB_QUEUE_NAMES)[keyof typeof JOB_QUEUE_NAMES];

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
