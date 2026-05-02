import type { Job } from "bullmq";

import type { ScrapeJobPayload } from "@job-automation/shared";

import { env } from "../config/env.js";
import { logger } from "../lib/logger.js";

export async function handleScrape(job: Job<ScrapeJobPayload>) {
  logger.info({ payload: job.data }, "Processing scrape job");

  if (!env.INTERNAL_API_TOKEN) {
    logger.warn(
      "Skipping scrape refresh because INTERNAL_API_TOKEN is not configured",
    );
    return {
      refreshed: false,
      reason: "missing-internal-token",
    };
  }

  const response = await fetch(`${env.API_BASE_URL}/internal/jobs/refresh`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
      "x-internal-token": env.INTERNAL_API_TOKEN,
    },
    body: JSON.stringify({ userId: job.data.userId }),
  });

  if (!response.ok) {
    const message = await response.text();
    logger.error(
      { status: response.status, message },
      "Scheduled refresh failed",
    );
    throw new Error(`Failed to refresh jobs: ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, unknown>;

  return {
    fetchedPlatforms: job.data.targetPlatforms,
    roles: job.data.preferredRoles,
    locations: job.data.preferredLocations,
    ...payload,
  };
}
