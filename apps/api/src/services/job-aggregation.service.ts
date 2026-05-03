import { JobModel } from "../models/Job.js";
import { UserModel } from "../models/User.js";
import { UserProfileModel } from "../models/UserProfile.js";
import { env } from "../config/env.js";
import { AiChatService } from "./ai-chat.service.js";
import { AiSidecarService } from "./ai-sidecar.service.js";
import { JobMatchingService } from "./job-matching.service.js";
import { JobLinkValidatorService } from "./job-link-validator.service.js";
import {
  isEarlyApplicantJob,
  sortJobsByPriority,
} from "./job-ranking.service.js";
import { MockJobProvider } from "./job-providers/mock-job-provider.js";
import { MultiSourceJobProvider } from "./job-providers/multi-source-job-provider.js";
import { JobEnrichmentService } from "./job-enrichment.service.js";
import type { JobProvider } from "./job-providers/types.js";

export class JobAggregationService {
  private readonly aiChat = new AiChatService();
  private readonly aiSidecar = new AiSidecarService();
  private readonly matcher = new JobMatchingService();
  private readonly enrichment = new JobEnrichmentService();
  private readonly linkValidator = new JobLinkValidatorService();
  private readonly experienceInferenceCache = new Map<
    string,
    { min: number; max: number }
  >();
  private readonly provider: JobProvider =
    env.JOB_SOURCE_MODE === "remote"
      ? new MultiSourceJobProvider()
      : new MockJobProvider();

  get sourceMode() {
    return this.provider.sourceMode;
  }

  async fetchForUser(userId: string) {
    const [user, profile] = await Promise.all([
      UserModel.findById(userId),
      UserProfileModel.findOne({ userId }),
    ]);

    if (!user) {
      throw new Error("User not found");
    }

    const preferredRoles = new Set(
      user.preferredRoles.length
        ? user.preferredRoles.map((role) => role.toLowerCase())
        : [
            "software engineer",
            "network engineer",
            "wireless tac engineer",
            "technical consulting engineer",
          ],
    );

    const profileSkills = profile?.skills ?? [];
    const userExperienceYears = this.calculateExperienceYears(
      profile?.experience ?? [],
    );
    const maxAllowedExperienceMin =
      userExperienceYears <= 2 ? 2 : Math.max(2, userExperienceYears + 1);
    const jobs = await this.provider.fetchJobs({
      preferredRoles: [...preferredRoles],
      profileSkills,
    });

    const persisted = await Promise.all(
      jobs.map(async (job) => {
        const enrichment = this.enrichment.enrich({
          title: job.title,
          description: job.description,
        });
        const matching = await this.matcher.match(
          profileSkills,
          `${job.title} ${job.description}`,
        );
        const experienceRange = await this.resolveExperienceRange(
          job,
          matching.matchScore,
        );
        const postedDate = new Date(job.postedDate);
        const isQualified = this.isQualifiedForProfile({
          job,
          preferredRoles: [...preferredRoles],
          userExperienceYears,
          maxAllowedExperienceMin,
          matchScore: matching.matchScore,
          matchedSkills: matching.matchedSkills,
          experienceRange,
        });
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

        const persistedJob = await JobModel.findOneAndUpdate(
          {
            sourceUserId: userId,
            title: job.title,
            company: job.company,
            link: job.link,
          },
          {
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
            isProfileFit: isQualified,
          },
          {
            upsert: true,
            new: true,
            setDefaultsOnInsert: true,
          },
        );

        return isQualified ? persistedJob : null;
      }),
    );

    const candidateJobs = persisted.filter(
      (job): job is NonNullable<(typeof persisted)[number]> => job !== null,
    );

    await this.syncVectorIndex(userId, candidateJobs);
    await this.applyVectorRelevance(userId, candidateJobs, [
      ...preferredRoles,
      ...profileSkills,
    ]);

    if (this.provider.sourceMode !== "mock") {
      await this.linkValidator.validateJobsForUser(userId);
    }

    const sorted = sortJobsByPriority(
      await JobModel.find({
        sourceUserId: userId,
        isProfileFit: true,
        linkStatus: "valid",
      }),
    );

    return sorted;
  }

  private async syncVectorIndex(
    userId: string,
    jobs: Array<{
      _id: string | { toString(): string };
      title: string;
      company: string;
      description: string;
      location?: string;
      platform: string;
      matchedSkills?: string[];
      extractedSkills?: string[];
    }>,
  ) {
    if (!this.aiSidecar.isConfigured() || jobs.length === 0) {
      return;
    }

    try {
      await this.aiSidecar.upsertJobIndex(
        userId,
        jobs.map((job) => ({
          id: String(job._id),
          title: job.title,
          company: job.company,
          description: job.description,
          location: job.location ?? "Remote",
          platform: job.platform,
          matchedSkills: job.matchedSkills ?? [],
          extractedSkills: job.extractedSkills ?? [],
        })),
      );
    } catch {
      // Non-blocking fallback: the existing ranking path still works.
    }
  }

  private async applyVectorRelevance(
    userId: string,
    jobs: Array<{
      _id: string | { toString(): string };
      relevanceScore?: number;
    }>,
    queryTerms: string[],
  ) {
    if (!this.aiSidecar.isConfigured() || jobs.length === 0) {
      return;
    }

    const query = queryTerms
      .map((value) => value.trim())
      .filter(Boolean)
      .join(" ");
    if (!query) {
      return;
    }

    try {
      const response = await this.aiSidecar.searchJobIndex(
        userId,
        query,
        jobs.length,
      );
      const scoreMap = new Map(
        (response?.matches ?? []).map((match) => [match.id, match.score]),
      );

      await Promise.all(
        jobs.map((job) => {
          const vectorScore = scoreMap.get(String(job._id));
          if (typeof vectorScore !== "number") {
            return Promise.resolve();
          }

          const relevanceScore = Math.max(
            job.relevanceScore ?? 0,
            Math.min(100, Math.round(vectorScore * 100)),
          );

          return JobModel.updateOne(
            { _id: job._id, sourceUserId: userId },
            { $set: { relevanceScore } },
          );
        }),
      );
    } catch {
      // Non-blocking fallback: the existing ranking path still works.
    }
  }

  private calculateExperienceYears(
    experience: Array<{ startDate?: string | null; endDate?: string | null }>,
  ) {
    if (!experience.length) {
      return 0;
    }

    const validStartYears = experience
      .map((item) => item.startDate?.match(/\d{4}/)?.[0])
      .filter((value): value is string => Boolean(value))
      .map((value) => Number.parseInt(value, 10))
      .filter((value) => Number.isFinite(value));

    if (!validStartYears.length) {
      return 0;
    }

    const earliestYear = Math.min(...validStartYears);
    return Math.max(0, new Date().getFullYear() - earliestYear);
  }

  private extractExperienceRange(text: string) {
    const normalizedDescription = text.toLowerCase();

    const rangeMatch = normalizedDescription.match(
      /(\d+)\s*(?:-|to)\s*(\d+)\+?\s*(?:years|yrs)/i,
    );
    if (rangeMatch) {
      const min = Number.parseInt(rangeMatch[1], 10);
      const max = Number.parseInt(rangeMatch[2], 10);
      return { range: { min, max }, confident: true };
    }

    const plusMatch = normalizedDescription.match(/(\d+)\+\s*(?:years|yrs)/i);
    if (plusMatch) {
      const min = Number.parseInt(plusMatch[1], 10);
      return { range: { min, max: min + 2 }, confident: true };
    }

    if (
      /entry[ -]?level|junior|graduate|new grad|fresher|intern(?:ship)?|0 ?- ?2 years|0 to 2 years/i.test(
        normalizedDescription,
      )
    ) {
      return { range: { min: 0, max: 2 }, confident: true };
    }

    const monthMatch = normalizedDescription.match(
      /(\d{1,2})\s*(?:-|to)\s*(\d{1,2})\s*(?:months|mos)/i,
    );
    if (monthMatch) {
      return { range: { min: 0, max: 1 }, confident: true };
    }

    const singleMonthMatch = normalizedDescription.match(
      /(\d{1,2})\+?\s*(?:months|mos)/i,
    );
    if (singleMonthMatch) {
      const months = Number.parseInt(singleMonthMatch[1], 10);
      return {
        range: { min: 0, max: months >= 24 ? 2 : 1 },
        confident: true,
      };
    }

    const singleYearMatch = normalizedDescription.match(
      /(?:minimum|required|at least)?\s*(\d+)\s*(?:year|years|yrs)\b/i,
    );
    if (singleYearMatch) {
      const min = Number.parseInt(singleYearMatch[1], 10);
      return { range: { min, max: min + 1 }, confident: true };
    }

    if (
      /senior|staff|principal|lead|architect|manager/i.test(
        normalizedDescription,
      )
    ) {
      return { range: { min: 5, max: 8 }, confident: true };
    }

    return { range: { min: 0, max: 2 }, confident: false };
  }

  private async resolveExperienceRange(
    job: {
      title: string;
      description: string;
      experienceMin?: number;
      experienceMax?: number;
      link: string;
    },
    matchScore: number,
  ) {
    if (
      Number.isFinite(job.experienceMin) &&
      Number.isFinite(job.experienceMax) &&
      (job.experienceMin ?? 0) <= (job.experienceMax ?? 0)
    ) {
      return {
        min: Math.max(0, Math.round(job.experienceMin ?? 0)),
        max: Math.max(0, Math.round(job.experienceMax ?? 0)),
      };
    }

    const heuristic = this.extractExperienceRange(
      `${job.title} ${job.description}`,
    );
    if (heuristic.confident || matchScore < 35 || !this.aiChat.isConfigured()) {
      return heuristic.range;
    }

    const cacheKey = `${job.link}:${job.title}`;
    const cached = this.experienceInferenceCache.get(cacheKey);
    if (cached) {
      return cached;
    }

    try {
      const response = await this.aiChat.completeJson([
        {
          role: "system",
          content:
            "Extract the required years of experience for a job. Return valid JSON with numeric keys min and max only. If the job is entry-level or junior, use min 0 and max 2. If no exact range is stated, infer the narrowest reasonable range from the title and description.",
        },
        {
          role: "user",
          content: JSON.stringify({
            title: job.title,
            description: job.description,
          }),
        },
      ]);

      const inferred = {
        min: Math.max(0, Number(response.min) || heuristic.range.min),
        max: Math.max(0, Number(response.max) || heuristic.range.max),
      };
      const sanitized =
        inferred.max >= inferred.min
          ? inferred
          : {
              min: inferred.min,
              max: Math.max(inferred.min, heuristic.range.max),
            };
      this.experienceInferenceCache.set(cacheKey, sanitized);
      return sanitized;
    } catch {
      return heuristic.range;
    }
  }

  private isQualifiedForProfile(input: {
    job: { title: string; description: string };
    preferredRoles: string[];
    userExperienceYears: number;
    maxAllowedExperienceMin: number;
    matchScore: number;
    matchedSkills: string[];
    experienceRange: { min: number; max: number };
  }) {
    const searchableText =
      `${input.job.title} ${input.job.description}`.toLowerCase();
    const hasRoleMatch = input.preferredRoles.some((role) =>
      searchableText.includes(role.toLowerCase()),
    );
    const hasSkillMatch =
      input.matchedSkills.length > 0 || input.matchScore >= 35;
    const seniorityBlocked =
      input.userExperienceYears <= 2 &&
      /senior|staff|principal|lead|architect|manager|director|head/i.test(
        searchableText,
      );
    const experienceBlocked =
      input.experienceRange.min > input.maxAllowedExperienceMin ||
      (input.userExperienceYears <= 2 && input.experienceRange.min > 2);

    return (
      (hasRoleMatch || hasSkillMatch) && !seniorityBlocked && !experienceBlocked
    );
  }

  private calculateRelevanceScore(input: {
    baseMatchScore: number;
    title: string;
    description: string;
    preferredRoles: string[];
    userExperienceYears: number;
    experienceMin: number;
    experienceMax: number;
    postedDate: Date;
    applicantCount: number;
  }) {
    const searchableText = `${input.title} ${input.description}`.toLowerCase();

    const roleBonus = input.preferredRoles.some((role) =>
      searchableText.includes(role.toLowerCase()),
    )
      ? 25
      : 0;

    const experienceBonus =
      input.userExperienceYears >= input.experienceMin &&
      input.userExperienceYears <= input.experienceMax
        ? 20
        : input.userExperienceYears < input.experienceMin
          ? Math.max(
              0,
              20 - (input.experienceMin - input.userExperienceYears) * 8,
            )
          : Math.max(
              0,
              20 - (input.userExperienceYears - input.experienceMax) * 6,
            );

    const freshnessBonus = Math.max(
      0,
      15 -
        Math.min(
          15,
          Math.floor((Date.now() - input.postedDate.getTime()) / 86_400_000) *
            3,
        ),
    );
    const earlyApplicantBonus = isEarlyApplicantJob({
      postedDate: input.postedDate,
      applicantCount: input.applicantCount,
    })
      ? 10
      : 0;

    return Math.min(
      100,
      input.baseMatchScore +
        roleBonus +
        experienceBonus +
        freshnessBonus +
        earlyApplicantBonus,
    );
  }
}
