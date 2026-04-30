import type { Job } from "bullmq";

import type { ResumeGenerationPayload } from "@job-automation/shared";

import { logger } from "../lib/logger.js";

export async function handleResumeGeneration(
  job: Job<ResumeGenerationPayload>,
) {
  logger.info({ payload: job.data }, "Processing resume generation job");

  return {
    status: "queued-for-render",
    template: job.data.template,
    jobId: job.data.jobId,
  };
}
