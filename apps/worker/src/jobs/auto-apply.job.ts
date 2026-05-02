import type { Job } from "bullmq";

import type { AutoApplyJobPayload } from "@job-automation/shared";

import { env } from "../config/env.js";
import { runAutoApply } from "../automation/apply-browser.js";
import { logger } from "../lib/logger.js";

export async function handleAutoApply(job: Job<AutoApplyJobPayload>) {
  logger.info(
    { jobId: job.id, payload: job.data },
    "Processing auto-apply job",
  );

  const result = await runAutoApply({
    jobLink: job.data.jobLink,
    rateLimitPerMinute: job.data.rateLimitPerMinute,
    headless: env.PLAYWRIGHT_HEADLESS,
  });

  logger.info({ result }, "Completed auto-apply job");
  return result;
}
