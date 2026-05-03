import { JobApplicationModel } from "../models/JobApplication.js";
import { JobModel } from "../models/Job.js";
import { RecruiterLeadModel } from "../models/RecruiterLead.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { sortJobsByPriority } from "./job-ranking.service.js";

export class DashboardService {
  async getDashboard(userId: string) {
    const [jobs, applications, leads, profile] = await Promise.all([
      JobModel.find({
        sourceUserId: userId,
        linkStatus: "valid",
        isProfileFit: true,
      }),
      JobApplicationModel.find({ userId }).sort({ updatedAt: -1 }),
      RecruiterLeadModel.find({ userId }).sort({ updatedAt: -1 }),
      UserProfileModel.findOne({ userId }),
    ]);

    const sortedJobs = sortJobsByPriority(jobs);

    return {
      tabs: {
        newJobs: sortedJobs.filter((job) => job.status === "new"),
        applied: sortedJobs.filter((job) => job.status === "applied"),
        inProgress: sortedJobs.filter((job) => job.status === "in-progress"),
        finished: sortedJobs.filter((job) => job.status === "finished"),
        bookmarked: sortedJobs.filter((job) => job.status === "bookmarked"),
        closed: sortedJobs.filter((job) => job.status === "closed"),
      },
      applications,
      recruiterLeads: leads,
      resumeScore: profile?.resumeScore ?? 0,
      skillGapRoadmap: [
        ...new Set(
          sortedJobs
            .slice(0, 3)
            .flatMap((job) => job.missingSkills)
            .filter(Boolean),
        ),
      ],
      interviewQuestions: sortedJobs
        .slice(0, 2)
        .map(
          (job) =>
            `How would you approach a production incident relevant to ${job.title}?`,
        ),
    };
  }
}
