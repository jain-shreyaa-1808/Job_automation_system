import { JobApplicationModel } from "../models/JobApplication.js";
import { JobModel } from "../models/Job.js";
import { RecruiterLeadModel } from "../models/RecruiterLead.js";
import { UserProfileModel } from "../models/UserProfile.js";
export class DashboardService {
    async getDashboard(userId) {
        const [jobs, applications, leads, profile] = await Promise.all([
            JobModel.find({ sourceUserId: userId }).sort({
                relevanceScore: -1,
                createdAt: -1,
            }),
            JobApplicationModel.find({ userId }).sort({ updatedAt: -1 }),
            RecruiterLeadModel.find({ userId }).sort({ updatedAt: -1 }),
            UserProfileModel.findOne({ userId }),
        ]);
        return {
            tabs: {
                newJobs: jobs.filter((job) => job.status === "new"),
                applied: jobs.filter((job) => job.status === "applied"),
                inProgress: jobs.filter((job) => job.status === "in-progress"),
                finished: jobs.filter((job) => job.status === "finished"),
                bookmarked: jobs.filter((job) => job.status === "bookmarked"),
            },
            applications,
            recruiterLeads: leads,
            resumeScore: profile?.resumeScore ?? 0,
            skillGapRoadmap: [
                ...new Set(jobs
                    .slice(0, 3)
                    .flatMap((job) => job.missingSkills)
                    .filter(Boolean)),
            ],
            interviewQuestions: jobs
                .slice(0, 2)
                .map((job) => `How would you approach a production incident relevant to ${job.title}?`),
        };
    }
}
//# sourceMappingURL=dashboard.service.js.map