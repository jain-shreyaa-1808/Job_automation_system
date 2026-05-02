import { Worker } from "bullmq";
import { JOB_QUEUE_NAMES } from "@job-automation/shared";
import { env } from "./config/env.js";
import { handleAutoApply } from "./jobs/auto-apply.job.js";
import { handleResumeGeneration } from "./jobs/resume-generation.job.js";
import { handleScrape } from "./jobs/scrape.job.js";
import { logger } from "./lib/logger.js";
import { getRedisConnection } from "./lib/redis.js";
async function triggerScheduledRefresh() {
    if (!env.INTERNAL_API_TOKEN) {
        logger.warn("Skipping scheduled refresh because INTERNAL_API_TOKEN is not configured");
        return;
    }
    try {
        const response = await fetch(`${env.API_BASE_URL}/internal/jobs/refresh`, {
            method: "POST",
            headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
                "x-internal-token": env.INTERNAL_API_TOKEN,
            },
        });
        if (!response.ok) {
            const message = await response.text();
            logger.error({ status: response.status, message }, "Scheduled job refresh failed");
            return;
        }
        logger.info(await response.json(), "Scheduled job refresh completed");
    }
    catch (error) {
        logger.error({ error }, "Scheduled job refresh request failed");
    }
}
function startWorker() {
    const connection = getRedisConnection();
    new Worker(JOB_QUEUE_NAMES.autoApply, handleAutoApply, { connection });
    new Worker(JOB_QUEUE_NAMES.scrape, handleScrape, { connection });
    new Worker(JOB_QUEUE_NAMES.resumeGeneration, handleResumeGeneration, {
        connection,
    });
    if (env.SCRAPE_REFRESH_INTERVAL_MINUTES > 0) {
        const intervalMs = env.SCRAPE_REFRESH_INTERVAL_MINUTES * 60_000;
        void triggerScheduledRefresh();
        setInterval(() => {
            void triggerScheduledRefresh();
        }, intervalMs);
    }
    logger.info({ mode: env.NODE_ENV }, "Worker processes started");
}
startWorker();
//# sourceMappingURL=index.js.map