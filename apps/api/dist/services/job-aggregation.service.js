import { JobModel } from "../models/Job.js";
import { UserModel } from "../models/User.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { env } from "../config/env.js";
import { AiSidecarService } from "./ai-sidecar.service.js";
import { JobMatchingService } from "./job-matching.service.js";
import { JobLinkValidatorService } from "./job-link-validator.service.js";
import { isEarlyApplicantJob, sortJobsByPriority, } from "./job-ranking.service.js";
import { MockJobProvider } from "./job-providers/mock-job-provider.js";
import { MultiSourceJobProvider } from "./job-providers/multi-source-job-provider.js";
import { JobEnrichmentService } from "./job-enrichment.service.js";
export class JobAggregationService {
    aiSidecar = new AiSidecarService();
    matcher = new JobMatchingService();
    enrichment = new JobEnrichmentService();
    linkValidator = new JobLinkValidatorService();
    provider = env.JOB_SOURCE_MODE === "remote"
        ? new MultiSourceJobProvider()
        : new MockJobProvider();
    get sourceMode() {
        return this.provider.sourceMode;
    }
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
        const profileSkills = profile?.skills ?? [];
        const userExperienceYears = this.calculateExperienceYears(profile?.experience ?? []);
        const jobs = await this.provider.fetchJobs({
            preferredRoles: [...preferredRoles],
            profileSkills,
        });
        const persisted = await Promise.all(jobs.map(async (job) => {
            const enrichment = this.enrichment.enrich({
                title: job.title,
                description: job.description,
            });
            const matching = await this.matcher.match(profileSkills, `${job.title} ${job.description}`);
            const experienceRange = this.extractExperienceRange(job.description);
            const postedDate = new Date(job.postedDate);
            const relevanceScore = this.calculateRelevanceScore({
                baseMatchScore: matching.matchScore,
                title: job.title,
                description: job.description,
                preferredRoles: [...preferredRoles],
                userExperienceYears,
                experienceMin: experienceRange.min,
                experienceMax: experienceRange.max,
                postedDate,
                applicantCount: job.applicantCount,
            });
            return JobModel.findOneAndUpdate({
                sourceUserId: userId,
                title: job.title,
                company: job.company,
                link: job.link,
            }, {
                ...job,
                normalizedTitle: enrichment.normalizedTitle,
                extractedSkills: enrichment.extractedSkills,
                categoryTags: enrichment.categoryTags,
                sourceUserId: userId,
                postedDate,
                applicantCount: job.applicantCount,
                relevanceScore,
                matchedSkills: matching.matchedSkills,
                missingSkills: matching.missingSkills,
                experienceMin: experienceRange.min,
                experienceMax: experienceRange.max,
                jobSource: job.sourceMode,
                linkStatus: "unchecked",
                linkCheckedAt: null,
            }, {
                upsert: true,
                new: true,
                setDefaultsOnInsert: true,
            });
        }));
        await this.syncVectorIndex(userId, persisted);
        await this.applyVectorRelevance(userId, persisted, [
            ...preferredRoles,
            ...profileSkills,
        ]);
        // Sort by fit first, then recency, then lower applicant count.
        const sorted = sortJobsByPriority(await JobModel.find({ sourceUserId: userId }));
        if (this.provider.sourceMode !== "mock") {
            this.linkValidator.validateJobsForUser(userId).catch(() => { });
        }
        return sorted;
    }
    async syncVectorIndex(userId, jobs) {
        if (!this.aiSidecar.isConfigured() || jobs.length === 0) {
            return;
        }
        try {
            await this.aiSidecar.upsertJobIndex(userId, jobs.map((job) => ({
                id: String(job._id),
                title: job.title,
                company: job.company,
                description: job.description,
                location: job.location ?? "Remote",
                platform: job.platform,
                matchedSkills: job.matchedSkills ?? [],
                extractedSkills: job.extractedSkills ?? [],
            })));
        }
        catch {
            // Non-blocking fallback: the existing ranking path still works.
        }
    }
    async applyVectorRelevance(userId, jobs, queryTerms) {
        if (!this.aiSidecar.isConfigured() || jobs.length === 0) {
            return;
        }
        const query = queryTerms.map((value) => value.trim()).filter(Boolean).join(" ");
        if (!query) {
            return;
        }
        try {
            const response = await this.aiSidecar.searchJobIndex(userId, query, jobs.length);
            const scoreMap = new Map((response?.matches ?? []).map((match) => [match.id, match.score]));
            await Promise.all(jobs.map((job) => {
                const vectorScore = scoreMap.get(String(job._id));
                if (typeof vectorScore !== "number") {
                    return Promise.resolve();
                }
                const relevanceScore = Math.max(job.relevanceScore ?? 0, Math.min(100, Math.round(vectorScore * 100)));
                return JobModel.updateOne({ _id: job._id, sourceUserId: userId }, { $set: { relevanceScore } });
            }));
        }
        catch {
            // Non-blocking fallback: the existing ranking path still works.
        }
    }
    calculateExperienceYears(experience) {
        if (!experience.length) {
            return 0;
        }
        const validStartYears = experience
            .map((item) => item.startDate?.match(/\d{4}/)?.[0])
            .filter((value) => Boolean(value))
            .map((value) => Number.parseInt(value, 10))
            .filter((value) => Number.isFinite(value));
        if (!validStartYears.length) {
            return 0;
        }
        const earliestYear = Math.min(...validStartYears);
        return Math.max(0, new Date().getFullYear() - earliestYear);
    }
    extractExperienceRange(description) {
        const normalizedDescription = description.toLowerCase();
        const rangeMatch = normalizedDescription.match(/(\d+)\s*(?:-|to)\s*(\d+)\+?\s*(?:years|yrs)/i);
        if (rangeMatch) {
            const min = Number.parseInt(rangeMatch[1], 10);
            const max = Number.parseInt(rangeMatch[2], 10);
            return { min, max };
        }
        const plusMatch = normalizedDescription.match(/(\d+)\+\s*(?:years|yrs)/i);
        if (plusMatch) {
            const min = Number.parseInt(plusMatch[1], 10);
            return { min, max: min + 2 };
        }
        if (/entry[ -]?level|junior|graduate|new grad|0 ?- ?2 years|0 to 2 years/i.test(normalizedDescription)) {
            return { min: 0, max: 2 };
        }
        return { min: 0, max: 2 };
    }
    calculateRelevanceScore(input) {
        const searchableText = `${input.title} ${input.description}`.toLowerCase();
        const roleBonus = input.preferredRoles.some((role) => searchableText.includes(role.toLowerCase()))
            ? 25
            : 0;
        const experienceBonus = input.userExperienceYears >= input.experienceMin &&
            input.userExperienceYears <= input.experienceMax
            ? 20
            : input.userExperienceYears < input.experienceMin
                ? Math.max(0, 20 - (input.experienceMin - input.userExperienceYears) * 8)
                : Math.max(0, 20 - (input.userExperienceYears - input.experienceMax) * 6);
        const freshnessBonus = Math.max(0, 15 -
            Math.min(15, Math.floor((Date.now() - input.postedDate.getTime()) / 86_400_000) *
                3));
        const earlyApplicantBonus = isEarlyApplicantJob({
            postedDate: input.postedDate,
            applicantCount: input.applicantCount,
        })
            ? 10
            : 0;
        return Math.min(100, input.baseMatchScore +
            roleBonus +
            experienceBonus +
            freshnessBonus +
            earlyApplicantBonus);
    }
}
//# sourceMappingURL=job-aggregation.service.js.map