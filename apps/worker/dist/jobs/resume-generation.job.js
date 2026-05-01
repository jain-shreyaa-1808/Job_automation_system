import { logger } from "../lib/logger.js";
export async function handleResumeGeneration(job) {
    logger.info({ payload: job.data }, "Processing resume generation job");
    return {
        status: "queued-for-render",
        template: job.data.template,
        jobId: job.data.jobId,
    };
}
//# sourceMappingURL=resume-generation.job.js.map