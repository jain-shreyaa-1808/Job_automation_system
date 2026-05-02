import { GeneratedDocumentModel } from "../models/GeneratedDocument.js";
import { JobModel } from "../models/Job.js";
import { RecruiterLeadModel } from "../models/RecruiterLead.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { AppError } from "../utils/app-error.js";
import { AiChatService } from "./ai-chat.service.js";
export class OutreachService {
    aiChatService = new AiChatService();
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
        const hrName = lead?.name ?? "Hiring Manager";
        const hrTitle = lead?.title ?? "";
        // Extract the most relevant skills for this specific JD
        const jdKeywords = this.extractJDKeywords(job.description);
        const relevantSkills = profile.skills.filter((s) => jdKeywords.some((k) => s.toLowerCase().includes(k) || k.includes(s.toLowerCase())));
        const topSkills = relevantSkills.length >= 3
            ? relevantSkills.slice(0, 5)
            : profile.skills.slice(0, 5);
        // Find the most relevant project for this JD
        const bestProject = this.findBestProject(profile.projects, jdKeywords);
        // Find the most relevant experience for this JD
        const bestExperience = this.findBestExperience(profile.experience, jdKeywords);
        const aiDrafts = await this.generateWithModel({
            recipientName: hrName,
            recipientTitle: hrTitle,
            senderName: profile.name,
            company: job.company,
            jobTitle: job.title,
            description: job.description,
            topSkills,
            bestProject,
            bestExperience,
            matchedSkills: job.matchedSkills ?? [],
            certifications: profile.certifications,
        });
        const email = aiDrafts?.email ??
            this.buildColdEmail({
                recipientName: hrName,
                recipientTitle: hrTitle,
                senderName: profile.name,
                company: job.company,
                jobTitle: job.title,
                topSkills,
                bestProject,
                bestExperience,
                matchedSkills: job.matchedSkills ?? [],
                certifications: profile.certifications,
            });
        const linkedinMessage = aiDrafts?.linkedinMessage ??
            this.buildLinkedInMessage({
                recipientName: hrName,
                senderName: profile.name,
                company: job.company,
                jobTitle: job.title,
                topSkills,
                bestProject,
                bestExperience,
            });
        const referralMessage = aiDrafts?.referralMessage ??
            this.buildReferralMessage({
                senderName: profile.name,
                company: job.company,
                jobTitle: job.title,
                topSkills,
                bestExperience,
            });
        await GeneratedDocumentModel.insertMany([
            {
                userId,
                jobId,
                type: "outreach-email",
                title: `Cold Email - ${job.company} - ${job.title}`,
                content: email,
            },
            {
                userId,
                jobId,
                type: "linkedin-message",
                title: `LinkedIn Message - ${job.company}`,
                content: linkedinMessage,
            },
            {
                userId,
                jobId,
                type: "referral-request",
                title: `Referral Request - ${job.company}`,
                content: referralMessage,
            },
        ]);
        return {
            email,
            linkedinMessage,
            referralMessage,
        };
    }
    async generateWithModel(params) {
        if (!this.aiChatService.isConfigured()) {
            return null;
        }
        try {
            const response = await this.aiChatService.completeJson([
                {
                    role: "system",
                    content: "You generate concise professional outreach drafts. Return valid JSON with keys email, linkedinMessage, and referralMessage. Do not include markdown fences.",
                },
                {
                    role: "user",
                    content: JSON.stringify(params),
                },
            ]);
            const email = typeof response.email === "string" ? response.email.trim() : "";
            const linkedinMessage = typeof response.linkedinMessage === "string"
                ? response.linkedinMessage.trim()
                : "";
            const referralMessage = typeof response.referralMessage === "string"
                ? response.referralMessage.trim()
                : "";
            if (!email || !linkedinMessage || !referralMessage) {
                return null;
            }
            return {
                email,
                linkedinMessage,
                referralMessage,
            };
        }
        catch {
            return null;
        }
    }
    extractJDKeywords(description) {
        const tokens = description
            .toLowerCase()
            .replace(/[^a-z0-9#+.\-/\s]/g, " ")
            .split(/[\s,;|]+/)
            .map((t) => t.trim())
            .filter((t) => t.length > 1);
        const stopWords = new Set([
            "and",
            "the",
            "for",
            "with",
            "from",
            "that",
            "this",
            "are",
            "was",
            "will",
            "has",
            "have",
            "not",
            "but",
            "all",
            "can",
            "had",
            "one",
            "our",
            "out",
            "you",
            "been",
            "each",
            "make",
            "like",
            "into",
            "year",
            "years",
            "experience",
            "strong",
            "ability",
            "work",
            "team",
            "role",
            "good",
            "etc",
            "must",
            "including",
            "preferred",
            "required",
            "such",
            "full-time",
            "full",
            "time",
            "looking",
            "join",
            "help",
            "build",
        ]);
        return [...new Set(tokens.filter((t) => !stopWords.has(t)))];
    }
    findBestProject(projects, jdKeywords) {
        if (!projects.length)
            return null;
        return [...projects].sort((a, b) => {
            const aScore = (a.technologies ?? []).filter((t) => jdKeywords.some((k) => t.toLowerCase().includes(k))).length +
                (a.summary
                    ? jdKeywords.filter((k) => a.summary.toLowerCase().includes(k))
                        .length
                    : 0);
            const bScore = (b.technologies ?? []).filter((t) => jdKeywords.some((k) => t.toLowerCase().includes(k))).length +
                (b.summary
                    ? jdKeywords.filter((k) => b.summary.toLowerCase().includes(k))
                        .length
                    : 0);
            return bScore - aScore;
        })[0];
    }
    findBestExperience(experience, jdKeywords) {
        if (!experience.length)
            return null;
        return [...experience].sort((a, b) => {
            const aText = `${a.title} ${a.summary}`.toLowerCase();
            const bText = `${b.title} ${b.summary}`.toLowerCase();
            const aScore = jdKeywords.filter((k) => aText.includes(k)).length;
            const bScore = jdKeywords.filter((k) => bText.includes(k)).length;
            return bScore - aScore;
        })[0];
    }
    buildColdEmail(params) {
        const { recipientName, senderName, company, jobTitle, topSkills, bestProject, bestExperience, matchedSkills, certifications, } = params;
        const greeting = recipientName !== "Hiring Manager"
            ? `Dear ${recipientName},`
            : `Dear Hiring Manager,`;
        const skillHighlight = topSkills.length > 0
            ? `My expertise spans ${topSkills.join(", ")}, which directly aligns with the requirements outlined in the ${jobTitle} posting.`
            : `My technical background aligns well with the ${jobTitle} requirements.`;
        const experienceParagraph = bestExperience
            ? `In my role as ${bestExperience.title ?? "engineer"} at ${bestExperience.company ?? "my previous company"}, I ${bestExperience.summary ? bestExperience.summary.split(".")[0].toLowerCase().replace(/^i /, "") : "delivered impactful solutions that drove measurable results"}.`
            : "";
        const projectHighlight = bestProject
            ? ` Additionally, my project "${bestProject.name ?? "recent work"}"${bestProject.technologies?.length ? ` (built with ${bestProject.technologies.slice(0, 3).join(", ")})` : ""} demonstrates my ability to ship production-quality software.`
            : "";
        const certLine = certifications.length > 0
            ? `\n\nI also hold ${certifications.slice(0, 2).join(" and ")} certification${certifications.length > 1 ? "s" : ""}, which reinforces my commitment to professional growth.`
            : "";
        return `Subject: Application for ${jobTitle} — ${senderName}

${greeting}

I am writing to express my strong interest in the ${jobTitle} position at ${company}. ${skillHighlight}

${experienceParagraph}${projectHighlight}${certLine}

I am excited about the opportunity to contribute to ${company}'s engineering team and would welcome the chance to discuss how my background can add value. I have attached my tailored resume for your review.

Looking forward to hearing from you.

Best regards,
${senderName}`;
    }
    buildLinkedInMessage(params) {
        const { recipientName, senderName, company, jobTitle, topSkills, bestExperience, } = params;
        const greeting = recipientName !== "Hiring Manager" ? `Hi ${recipientName},` : `Hello,`;
        const experienceSnippet = bestExperience
            ? `As a ${bestExperience.title ?? "software professional"} with experience in ${topSkills.slice(0, 3).join(", ")}, I believe I'd be a strong fit.`
            : `With expertise in ${topSkills.slice(0, 3).join(", ")}, I believe I'd be a strong fit for this role.`;
        return `${greeting}

I came across the ${jobTitle} position at ${company} and I'm very interested. ${experienceSnippet}

I'd love to connect and learn more about the role and team. Would you be open to a brief chat?

Thank you,
${senderName}`;
    }
    buildReferralMessage(params) {
        const { senderName, company, jobTitle, topSkills, bestExperience } = params;
        const experienceSnippet = bestExperience
            ? `I'm currently working as a ${bestExperience.title ?? "software professional"} at ${bestExperience.company ?? "my current company"}, with hands-on experience in ${topSkills.slice(0, 4).join(", ")}.`
            : `I have hands-on experience in ${topSkills.slice(0, 4).join(", ")}.`;
        return `Hi,

I noticed you work at ${company} and I wanted to reach out. I'm interested in the ${jobTitle} position and was wondering if you'd be willing to refer me.

${experienceSnippet}

I believe my background is a great match for this role. If you're open to it, I can share my resume and the job link for your convenience. A referral from you would mean a lot!

Thank you for considering this — happy to chat if you'd like to know more.

Best,
${senderName}`;
    }
}
//# sourceMappingURL=outreach.service.js.map