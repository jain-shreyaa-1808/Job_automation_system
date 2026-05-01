import { JobModel } from "../models/Job.js";
import { UserModel } from "../models/User.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { JobMatchingService } from "./job-matching.service.js";
const SAMPLE_JOBS = [
    {
        title: "Software Engineer I",
        company: "Acme Cloud",
        description: "React, TypeScript, Node.js, MongoDB, REST APIs, Docker, CI/CD.",
        link: "https://careers.example.com/jobs/software-engineer-i",
        platform: "Direct Careers",
        location: "Bengaluru",
    },
    {
        title: "Wireless TAC Engineer",
        company: "NetWave Systems",
        description: "Wireless, networking, TAC workflows, TCP/IP, Cisco, troubleshooting, incident response.",
        link: "https://jobs.example.com/netwave/wireless-tac-engineer",
        platform: "Foundit",
        location: "Remote",
    },
    {
        title: "Technical Consulting Engineer",
        company: "Orbit Networks",
        description: "Customer support, log analysis, networking, Linux, Python, wireless troubleshooting.",
        link: "https://greenhouse.io/orbit/jobs/12345",
        platform: "Greenhouse",
        location: "Pune",
    },
];
export class JobAggregationService {
    matcher = new JobMatchingService();
    async fetchForUser(userId) {
        const [user, profile] = await Promise.all([
            UserModel.findById(userId),
            UserProfileModel.findOne({ userId }),
        ]);
        if (!user) {
            throw new Error("User not found");
        }
        const preferredRoles = new Set(user.preferredRoles.length
            ? user.preferredRoles.map((role) => role.toLowerCase())
            : [
                "software engineer",
                "network engineer",
                "wireless tac engineer",
                "technical consulting engineer",
            ]);
        const jobs = SAMPLE_JOBS.filter((job) => {
            const lowerTitle = job.title.toLowerCase();
            return [...preferredRoles].some((role) => lowerTitle.includes(role));
        });
        const profileSkills = profile?.skills ?? [];
        const persisted = await Promise.all(jobs.map(async (job) => {
            const matching = this.matcher.match(profileSkills, job.description);
            return JobModel.findOneAndUpdate({
                sourceUserId: userId,
                title: job.title,
                company: job.company,
                link: job.link,
            }, {
                ...job,
                sourceUserId: userId,
                relevanceScore: matching.matchScore,
                matchedSkills: matching.matchedSkills,
                missingSkills: matching.missingSkills,
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
        }));
        return persisted.sort((left, right) => right.relevanceScore - left.relevanceScore);
    }
}
//# sourceMappingURL=job-aggregation.service.js.map