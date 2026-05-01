import { env } from "../config/env.js";
import { runAutoApply } from "../automation/apply-browser.js";
import { logger } from "../lib/logger.js";
export async function handleAutoApply(job) {
    logger.info({ jobId: job.id, payload: job.data }, "Processing auto-apply job");
    const result = await runAutoApply({
        jobLink: `${env.API_BASE_URL}/jobs/${job.data.jobId}`,
        rateLimitPerMinute: job.data.rateLimitPerMinute,
        headless: env.PLAYWRIGHT_HEADLESS,
    });
    logger.info({ result }, "Completed auto-apply job");
    return result;
}
//# sourceMappingURL=auto-apply.job.js.map