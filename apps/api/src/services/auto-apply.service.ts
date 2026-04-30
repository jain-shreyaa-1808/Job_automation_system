import { JobApplicationModel } from "../models/JobApplication.js";
import { JobModel } from "../models/Job.js";
import { AppError } from "../utils/app-error.js";
import { JOB_QUEUE_NAMES, QueueService } from "./queue.service.js";

type AutoApplyInput = {
  userId: string;
  jobId: string;
  manualOverride?: boolean;
};

export class AutoApplyService {
  constructor(private readonly queueService = new QueueService()) {}

  async requestApplication(input: AutoApplyInput) {
    const job = await JobModel.findOne({
      _id: input.jobId,
      sourceUserId: input.userId,
    });

    if (!job) {
      throw AppError.notFound("Job not found");
    }

    const application = await JobApplicationModel.findOneAndUpdate(
      { userId: input.userId, jobId: input.jobId },
      {
        status: input.manualOverride ? "in-progress" : "new",
        appliedVia: input.manualOverride ? "manual" : "automation",
        $push: {
          history: {
            action: input.manualOverride
              ? "Manual review requested"
              : "Application queued",
            details: input.manualOverride
              ? "User opted to review before automation."
              : "Queued for Puppeteer auto-apply worker.",
          },
        },
      },
      { upsert: true, new: true },
    );

    await JobModel.updateOne(
      { _id: input.jobId },
      { status: input.manualOverride ? "in-progress" : "applied" },
    );

    if (!input.manualOverride) {
      await this.queueService.enqueue(JOB_QUEUE_NAMES.autoApply, {
        userId: input.userId,
        jobId: input.jobId,
        rateLimitPerMinute: 8,
        captchaFallback: "manual-review",
      });
    }

    return application;
  }
}
