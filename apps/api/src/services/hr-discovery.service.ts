import { RecruiterLeadModel } from "../models/RecruiterLead.js";
import { JobModel } from "../models/Job.js";
import { AppError } from "../utils/app-error.js";

export class HrDiscoveryService {
  async discover(userId: string, jobId: string) {
    const job = await JobModel.findById(jobId);

    if (!job) {
      throw AppError.notFound("Job not found");
    }

    const leads = [
      {
        userId,
        jobId,
        name: `${job.company} Recruiting Team`,
        title: "Talent Acquisition",
        company: job.company,
        profileUrl: `https://www.linkedin.com/company/${job.company.toLowerCase().replace(/\s+/g, "-")}`,
        recentPosts: [
          `Hiring for ${job.title} across ${job.location}.`,
          "Looking for engineers with strong troubleshooting and customer-facing skills.",
        ],
      },
    ];

    const saved = await Promise.all(
      leads.map((lead) =>
        RecruiterLeadModel.findOneAndUpdate(
          { userId, jobId, name: lead.name },
          lead,
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        ),
      ),
    );

    return saved;
  }

  async updateState(
    userId: string,
    leadId: string,
    state: "pending" | "action-taken" | "finished",
  ) {
    return RecruiterLeadModel.findOneAndUpdate(
      { _id: leadId, userId },
      { state },
      { new: true },
    );
  }
}
