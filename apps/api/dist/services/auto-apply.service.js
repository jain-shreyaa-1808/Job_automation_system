import { JobApplicationModel } from "../models/JobApplication.js";
import { JobModel } from "../models/Job.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
export class AutoApplyService {
    async requestApplication(input) {
        const job = await JobModel.findOne({
            _id: input.jobId,
            sourceUserId: input.userId,
        });
        if (!job) {
            throw AppError.notFound("Job not found");
        }
        const application = await JobApplicationModel.findOneAndUpdate({ userId: input.userId, jobId: input.jobId }, {
            status: input.manualOverride ? "in-progress" : "new",
            appliedVia: input.manualOverride ? "manual" : "automation",
            $push: {
                history: {
                    action: input.manualOverride
                        ? "Manual review requested"
                        : "Application queued",
                    details: input.manualOverride
                        ? "User opted to review before automation."
                        : "Queued for auto-apply worker.",
                },
            },
        }, { upsert: true, new: true });
        await JobModel.updateOne({ _id: input.jobId }, { status: input.manualOverride ? "in-progress" : "applied" });
        // Queue for background worker only if Redis is configured
        if (!input.manualOverride && env.REDIS_URL) {
            const { QueueService, JOB_QUEUE_NAMES } = await import("./queue.service.js");
            const queueService = new QueueService();
            await queueService.enqueue(JOB_QUEUE_NAMES.autoApply, {
                userId: input.userId,
                jobId: input.jobId,
            });
        }
        return application;
    }
}
//# sourceMappingURL=auto-apply.service.js.map