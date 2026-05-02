import { extractSkills } from "../utils/skill-normalizer.js";

type EnrichedJob = {
  normalizedTitle: string;
  extractedSkills: string[];
  categoryTags: string[];
};

const CATEGORY_RULES: Array<{ tag: string; patterns: RegExp[] }> = [
  {
    tag: "Frontend",
    patterns: [/frontend/i, /front[- ]end/i, /react/i, /vue/i, /angular/i],
  },
  {
    tag: "Backend",
    patterns: [/backend/i, /back[- ]end/i, /node/i, /java/i, /python/i],
  },
  {
    tag: "Full Stack",
    patterns: [/full[- ]stack/i, /full stack/i],
  },
  {
    tag: "AI\/ML",
    patterns: [/ai\b/i, /machine learning/i, /ml\b/i, /llm/i, /nlp/i],
  },
  {
    tag: "DevOps",
    patterns: [
      /devops/i,
      /sre/i,
      /platform engineer/i,
      /kubernetes/i,
      /docker/i,
    ],
  },
  {
    tag: "Data",
    patterns: [/data engineer/i, /analytics/i, /etl/i, /spark/i, /warehouse/i],
  },
  {
    tag: "Cloud",
    patterns: [/aws/i, /azure/i, /gcp/i, /cloud/i],
  },
  {
    tag: "Security",
    patterns: [/security/i, /soc/i, /iam/i, /infosec/i],
  },
  {
    tag: "Networking",
    patterns: [/network/i, /wireless/i, /cisco/i, /tac/i],
  },
];

export class JobEnrichmentService {
  enrich(job: { title: string; description: string }): EnrichedJob {
    const normalizedTitle = this.normalizeTitle(job.title);
    const searchableText = `${job.title} ${job.description}`;
    const extractedSkills = extractSkills(searchableText);
    const categoryTags = CATEGORY_RULES.filter(({ patterns }) =>
      patterns.some((pattern) => pattern.test(searchableText)),
    ).map(({ tag }) => tag);

    return {
      normalizedTitle,
      extractedSkills,
      categoryTags,
    };
  }

  getCanonicalDedupKey(job: {
    title: string;
    company: string;
    location?: string;
  }) {
    return [
      this.normalizeTitle(job.title),
      this.normalizeCompany(job.company),
      this.normalizeLocation(job.location ?? "Remote"),
    ].join("::");
  }

  private normalizeTitle(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .replace(/\b(sr|senior)\b/g, "senior")
      .replace(/\b(jr|junior)\b/g, "junior")
      .replace(/\bdev(eloper)?\b/g, "developer")
      .replace(/\beng(ineer)?\b/g, "engineer")
      .replace(/\s+/g, " ")
      .trim();
  }

  private normalizeCompany(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }

  private normalizeLocation(value: string) {
    return value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .trim();
  }
}
