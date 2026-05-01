import { Worker } from "bullmq";
import { JOB_QUEUE_NAMES } from "@job-automation/shared";
import { env } from "./config/env.js";
import { handleAutoApply } from "./jobs/auto-apply.job.js";
import { handleResumeGeneration } from "./jobs/resume-generation.job.js";
import { handleScrape } from "./jobs/scrape.job.js";
import { logger } from "./lib/logger.js";
import { getRedisConnection } from "./lib/redis.js";
function startWorker() {
    const connection = getRedisConnection();
    new Worker(JOB_QUEUE_NAMES.autoApply, handleAutoApply, { connection });
    new Worker(JOB_QUEUE_NAMES.scrape, handleScrape, { connection });
    new Worker(JOB_QUEUE_NAMES.resumeGeneration, handleResumeGeneration, {
        connection,
    });
    logger.info({ mode: env.NODE_ENV }, "Worker processes started");
}
startWorker();
//# sourceMappingURL=index.js.map