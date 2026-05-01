import { GeneratedDocumentModel } from "../models/GeneratedDocument.js";
import { JobModel } from "../models/Job.js";
import { RecruiterLeadModel } from "../models/RecruiterLead.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { AppError } from "../utils/app-error.js";
export class OutreachService {
    async generate(userId, jobId, recruiterLeadId) {
        const [profile, job, lead] = await Promise.all([
            UserProfileModel.findOne({ userId }).lean(),
            JobModel.findById(jobId).lean(),
            recruiterLeadId
                ? RecruiterLeadModel.findOne({ _id: recruiterLeadId, userId })
                : Promise.resolve(null),
        ]);
        if (!profile || !job) {
            throw AppError.notFound("Profile or job not found");
        }
        const hrName = lead?.name ?? "Hiring Team";
        const email = `Subject: Interest in ${job.title} at ${job.company}\n\nHi ${hrName},\n\nI am reaching out regarding the ${job.title} role. My background in ${profile.skills.slice(0, 4).join(", ")} and projects like ${profile.projects[0]?.name ?? "my recent engineering work"} align well with the role. I would value the opportunity to speak further.\n\nBest regards,\n${profile.name}`;
        const linkedinMessage = `Hi ${hrName}, I am interested in the ${job.title} role at ${job.company}. I bring experience in ${profile.skills.slice(0, 3).join(", ")} and would appreciate the chance to connect.`;
        await GeneratedDocumentModel.insertMany([
            {
                userId,
                jobId,
                type: "outreach-email",
                title: `Cold Email - ${job.company}`,
                content: email,
            },
            {
                userId,
                jobId,
                type: "linkedin-message",
                title: `LinkedIn Message - ${job.company}`,
                content: linkedinMessage,
            },
        ]);
        return {
            email,
            linkedinMessage,
        };
    }
}
//# sourceMappingURL=outreach.service.js.map