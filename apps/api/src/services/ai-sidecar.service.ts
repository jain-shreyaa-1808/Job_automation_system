import { env } from "../config/env.js";

type MatchResult = {
  matchScore: number;
  matchedSkills: string[];
  missingSkills: string[];
  suggestedImprovements: string[];
};

type ParsedResume = {
  name: string;
  skills: string[];
  projects: Array<{ name: string; summary: string; technologies: string[] }>;
  experience: Array<{
    company: string;
    title: string;
    startDate: string;
    endDate: string;
    summary: string;
  }>;
  education: Array<{
    institution: string;
    degree: string;
    startDate: string;
    endDate: string;
  }>;
  certifications: string[];
  parsedText: string;
  resumeScore: number;
};

export class AiSidecarService {
  isConfigured() {
    if (env.NODE_ENV === "test") {
      return false;
    }

    return Boolean(env.AI_SIDECAR_URL);
  }

  async semanticMatch(profileSkills: string[], jobDescription: string) {
    if (!this.isConfigured()) {
      return null;
    }

    return this.postJson<MatchResult>("/match", {
      profileSkills,
      jobDescription,
    });
  }

  async cleanupResume(resume: ParsedResume) {
    if (!this.isConfigured()) {
      return null;
    }

    return this.postJson<ParsedResume>("/resume/cleanup", resume);
  }

  async upsertJobIndex(
    userId: string,
    jobs: Array<{
      id: string;
      title: string;
      company: string;
      description: string;
      location: string;
      platform: string;
      matchedSkills: string[];
      extractedSkills: string[];
    }>,
  ) {
    if (!this.isConfigured() || jobs.length === 0) {
      return null;
    }

    return this.postJson<{ indexedCount: number }>("/index/jobs/upsert", {
      userId,
      jobs,
    });
  }

  async searchJobIndex(userId: string, query: string, topK = 25) {
    if (!this.isConfigured() || !query.trim()) {
      return null;
    }

    return this.postJson<{ matches: Array<{ id: string; score: number }> }>(
      "/index/jobs/search",
      {
        userId,
        query,
        topK,
      },
    );
  }

  private async postJson<T>(path: string, payload: Record<string, unknown>) {
    const controller = new AbortController();
    const timeout = setTimeout(
      () => controller.abort(),
      env.AI_SIDECAR_TIMEOUT_MS,
    );

    try {
      const url = new URL(path, env.AI_SIDECAR_URL!);
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`AI sidecar returned HTTP ${response.status}`);
      }

      return (await response.json()) as T;
    } finally {
      clearTimeout(timeout);
    }
  }
}
