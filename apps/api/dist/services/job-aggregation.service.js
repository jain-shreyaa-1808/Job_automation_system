import { JobModel } from "../models/Job.js";
import { UserModel } from "../models/User.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { JobMatchingService } from "./job-matching.service.js";
const SAMPLE_JOBS = [
    {
        title: "Software Development Engineer",
        company: "Amazon India",
        description: "Java, Python, AWS, distributed systems, microservices, REST APIs, Docker, Kubernetes, CI/CD, system design.",
        link: "https://amazon.jobs/en/jobs/sde-bengaluru",
        platform: "Amazon Jobs",
        location: "Bengaluru",
    },
    {
        title: "Full Stack Developer",
        company: "Flipkart",
        description: "React, TypeScript, Node.js, Express, MongoDB, REST APIs, GraphQL, Docker, CI/CD, Agile.",
        link: "https://flipkart.com/careers/full-stack-developer",
        platform: "Company Careers",
        location: "Bengaluru",
    },
    {
        title: "Backend Engineer",
        company: "Razorpay",
        description: "Node.js, TypeScript, MongoDB, PostgreSQL, Redis, microservices, Docker, Kubernetes, event-driven architecture.",
        link: "https://razorpay.com/jobs/backend-engineer",
        platform: "Company Careers",
        location: "Bengaluru",
    },
    {
        title: "Software Engineer",
        company: "Google India",
        description: "C++, Java, Python, distributed systems, algorithms, data structures, large-scale systems, cloud infrastructure.",
        link: "https://careers.google.com/jobs/swe-india",
        platform: "Google Careers",
        location: "Hyderabad",
    },
    {
        title: "Software Development Engineer II",
        company: "Microsoft",
        description: "C#, TypeScript, React, Azure, cloud services, microservices, REST APIs, system design, CI/CD pipelines.",
        link: "https://careers.microsoft.com/sde2-hyderabad",
        platform: "Microsoft Careers",
        location: "Hyderabad",
    },
    {
        title: "Full Stack Engineer",
        company: "Swiggy",
        description: "React, Node.js, JavaScript, TypeScript, MongoDB, Redis, AWS, Docker, microservices, real-time systems.",
        link: "https://careers.swiggy.com/full-stack-engineer",
        platform: "Company Careers",
        location: "Bengaluru",
    },
    {
        title: "Backend Developer",
        company: "Zerodha",
        description: "Python, Go, PostgreSQL, Redis, REST APIs, message queues, Linux, performance optimization, fintech.",
        link: "https://zerodha.com/careers/backend-developer",
        platform: "Company Careers",
        location: "Remote",
    },
    {
        title: "Software Engineer - Platform",
        company: "Atlassian",
        description: "Java, TypeScript, React, AWS, Docker, Kubernetes, microservices, REST APIs, Agile, distributed systems.",
        link: "https://atlassian.com/careers/swe-platform",
        platform: "Atlassian Careers",
        location: "Bengaluru",
    },
    {
        title: "Wireless TAC Engineer",
        company: "NetWave Systems",
        description: "Wireless, networking, TAC workflows, TCP/IP, Cisco, troubleshooting, incident response, CCNA, CCNP.",
        link: "https://jobs.example.com/netwave/wireless-tac-engineer",
        platform: "Foundit",
        location: "Remote",
    },
    {
        title: "Network Development Engineer",
        company: "Cisco Systems",
        description: "Python, networking, automation, REST APIs, wireless, Cisco IOS, Linux, Docker, scripting, CCNA.",
        link: "https://jobs.cisco.com/nde-bengaluru",
        platform: "Cisco Careers",
        location: "Bengaluru",
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
        const preferredKeywords = [...preferredRoles].flatMap((role) => role.split(/\s+/).filter((w) => w.length > 2));
        const jobs = SAMPLE_JOBS.filter((job) => {
            const lowerTitle = job.title.toLowerCase();
            // Match if any significant keyword from preferred roles appears in the title
            return preferredKeywords.some((keyword) => lowerTitle.includes(keyword));
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