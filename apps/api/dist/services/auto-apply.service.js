import { JobApplicationModel } from "../models/JobApplication.js";
import { JobModel } from "../models/Job.js";
import { UserModel } from "../models/User.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/app-error.js";
export class AutoApplyService {
    /**
     * Step 1: Pre-fill application form data from user's profile and return for verification.
     * Does NOT submit yet — just prepares the data for user review.
     */
    async requestApplication(input) {
        const [job, user, profile] = await Promise.all([
            JobModel.findOne({ _id: input.jobId, sourceUserId: input.userId }),
            UserModel.findById(input.userId),
            UserProfileModel.findOne({ userId: input.userId }),
        ]);
        if (!job) {
            throw AppError.notFound("Job not found");
        }
        // Generate pre-filled application data from the user profile
        const preFilledData = {
            // Personal details
            fullName: user?.fullName ?? profile?.name ?? "",
            email: user?.email ?? "",
            phone: user?.phone ?? "",
            location: (user?.location ?? profile?.experience?.[0]?.company) ? "" : "",
            // Professional info
            currentTitle: profile?.experience?.[0]?.title ?? "",
            currentCompany: profile?.experience?.[0]?.company ?? "",
            totalExperience: this.calculateExperience((profile?.experience ?? [])),
            skills: profile?.skills ?? [],
            linkedinUrl: user?.linkedinUrl ?? "",
            portfolioUrl: user?.portfolioUrl ?? "",
            githubUrl: user?.githubUrl ?? "",
            // Job-specific
            jobTitle: job.title,
            company: job.company,
            jobLink: job.link,
            noticePeriod: user?.noticePeriod ?? "Immediate",
            expectedCtc: user?.expectedCtc ?? "",
            currentCtc: user?.currentCtc ?? "",
            willingToRelocate: job.location === "Remote" ? true : null,
            // Cover note
            coverNote: `I am excited to apply for the ${job.title} position at ${job.company}. With expertise in ${(profile?.skills ?? []).slice(0, 4).join(", ")}, I am confident in my ability to contribute to your team.`,
            // Resume info
            resumeFileName: profile?.resumeFileName ?? "Not uploaded",
            hasResume: !!profile?.resumeStoragePath,
        };
        // Create or update application with pending-verification status
        const application = await JobApplicationModel.findOneAndUpdate({ userId: input.userId, jobId: input.jobId }, {
            status: "pending-verification",
            appliedVia: "automation",
            preFilledData,
            $push: {
                history: {
                    action: "Application form pre-filled",
                    details: "Auto-filled from profile. Awaiting user verification before submission.",
                },
            },
        }, { upsert: true, new: true });
        return {
            application,
            preFilledData,
            message: "Application form has been pre-filled. Please review the details and confirm to submit.",
        };
    }
    /**
     * Step 2: User has verified the pre-filled data. Confirm and submit.
     */
    async confirmApplication(input) {
        const application = await JobApplicationModel.findOne({
            userId: input.userId,
            jobId: input.jobId,
        });
        if (!application) {
            throw AppError.notFound("No pending application found. Please queue the application first.");
        }
        // Update with user-verified data and mark as applied
        await JobApplicationModel.updateOne({ _id: application._id }, {
            status: "applied",
            preFilledData: input.applicationData,
            $push: {
                history: {
                    action: "Application confirmed by user",
                    details: "User verified pre-filled data and confirmed submission.",
                },
            },
            lastAttemptedAt: new Date(),
        });
        await JobModel.updateOne({ _id: input.jobId }, { status: "applied" });
        // Queue for background worker only if Redis is configured
        if (env.REDIS_URL) {
            const { QueueService, JOB_QUEUE_NAMES } = await import("./queue.service.js");
            const queueService = new QueueService();
            await queueService.enqueue(JOB_QUEUE_NAMES.autoApply, {
                userId: input.userId,
                jobId: input.jobId,
                applicationData: input.applicationData,
            });
        }
        return {
            status: "applied",
            message: "Application submitted successfully! The details have been confirmed and queued for processing.",
        };
    }
    calculateExperience(experience) {
        if (!experience.length)
            return "0 years";
        const earliest = experience
            .map((e) => e.startDate)
            .filter(Boolean)
            .sort()[0];
        if (!earliest)
            return "0 years";
        const years = Math.max(0, new Date().getFullYear() - parseInt(earliest.slice(0, 4), 10));
        return `${years} year${years !== 1 ? "s" : ""}`;
    }
}
//# sourceMappingURL=auto-apply.service.js.map