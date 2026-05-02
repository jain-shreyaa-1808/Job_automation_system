import { execFile } from "node:child_process";
import { promisify } from "node:util";

import { env } from "../../config/env.js";
import { AppError } from "../../utils/app-error.js";
import type { JobProvider, JobProviderContext, ProviderJob } from "./types.js";

const DEFAULT_REMOTE_OK_URL = "https://remoteok.com/api";
const MAX_PROVIDER_RESULTS = 60;
const execFileAsync = promisify(execFile);

type RemotePayload =
  | ProviderJob[]
  | {
      jobs?: ProviderJob[];
    };

type RemoteOkListing = {
  id?: number | string;
  company?: string;
  position?: string;
  description?: string;
  apply_url?: string;
  url?: string;
  location?: string;
  tags?: string[];
  epoch?: number;
  date?: string;
};

type RemoteOkPayload = Array<
  | {
      legal?: string;
    }
  | RemoteOkListing
>;

export class RemoteJobProvider implements JobProvider {
  readonly sourceMode = "remote" as const;

  async fetchJobs({ preferredRoles, profileSkills }: JobProviderContext) {
    const jobs = env.JOB_PROVIDER_URL
      ? await this.fetchCustomFeed({ preferredRoles, profileSkills })
      : await this.fetchRemoteOkJobs({ preferredRoles, profileSkills });

    return jobs.slice(0, MAX_PROVIDER_RESULTS);
  }

  private async fetchCustomFeed({
    preferredRoles,
    profileSkills,
  }: JobProviderContext) {
    const url = new URL(env.JOB_PROVIDER_URL!);
    if (preferredRoles.length > 0) {
      url.searchParams.set("roles", preferredRoles.join(","));
    }
    if (profileSkills.length > 0) {
      url.searchParams.set("skills", profileSkills.join(","));
    }

    const response = await fetch(url, {
      headers: {
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new AppError(
        `Remote job provider returned HTTP ${response.status}`,
        502,
      );
    }

    const payload = (await response.json()) as RemotePayload;
    const jobs = Array.isArray(payload) ? payload : (payload.jobs ?? []);

    return jobs
      .filter(
        (job) =>
          job.title &&
          job.company &&
          job.description &&
          job.link &&
          job.platform,
      )
      .map((job) => ({
        ...job,
        description: this.normalizeDescription(job.description),
        location: job.location || "Remote",
        postedDate: job.postedDate || new Date().toISOString(),
        applicantCount: job.applicantCount ?? 0,
        sourceMode: this.sourceMode,
      }));
  }

  private async fetchRemoteOkJobs({
    preferredRoles,
    profileSkills,
  }: JobProviderContext) {
    const payload = await this.loadRemoteOkPayload();
    const roleTerms = this.normalizeTerms(preferredRoles);
    const skillTerms = this.normalizeTerms(profileSkills);

    return payload
      .filter((entry): entry is RemoteOkListing => "position" in entry)
      .map((job) => this.mapRemoteOkJob(job))
      .filter((job): job is ProviderJob => job !== null)
      .map((job) => ({
        job,
        relevance: this.getSearchRelevance(job, roleTerms, skillTerms),
      }))
      .sort((left, right) => {
        if (right.relevance !== left.relevance) {
          return right.relevance - left.relevance;
        }

        return (
          new Date(right.job.postedDate).getTime() -
          new Date(left.job.postedDate).getTime()
        );
      })
      .map(({ job }) => job);
  }

  private async loadRemoteOkPayload() {
    try {
      const response = await fetch(DEFAULT_REMOTE_OK_URL, {
        headers: {
          Accept: "application/json",
        },
      });

      if (!response.ok) {
        throw new AppError(
          `Remote OK feed returned HTTP ${response.status}`,
          502,
        );
      }

      return (await response.json()) as RemoteOkPayload;
    } catch (error) {
      if (!this.isLocalTlsFetchError(error)) {
        if (error instanceof AppError) {
          throw error;
        }

        throw new AppError("Failed to load the Remote OK feed", 502);
      }

      try {
        const { stdout } = await execFileAsync("curl", [
          "-fsSL",
          DEFAULT_REMOTE_OK_URL,
        ]);

        return JSON.parse(stdout) as RemoteOkPayload;
      } catch {
        throw new AppError(
          "Failed to load the Remote OK feed due to local TLS certificate validation. Retry after fixing local certificates or override JOB_PROVIDER_URL.",
          502,
        );
      }
    }
  }

  private mapRemoteOkJob(job: RemoteOkListing): ProviderJob | null {
    const title = job.position?.trim();
    const company = job.company?.trim();
    const link = job.apply_url?.trim() || job.url?.trim();
    const description = this.normalizeDescription(job.description ?? "");
    const tags = this.normalizeDescription((job.tags ?? []).join(" "));

    if (!title || !company || !link || !description) {
      return null;
    }

    const postedDate = job.date
      ? new Date(job.date).toISOString()
      : job.epoch
        ? new Date(job.epoch * 1000).toISOString()
        : new Date().toISOString();

    return {
      title,
      company,
      description: [description, tags].filter(Boolean).join(" "),
      link,
      platform: "Remote OK",
      location: job.location?.trim() || "Remote",
      postedDate,
      applicantCount: 0,
      sourceMode: this.sourceMode,
    };
  }

  private getSearchRelevance(
    job: ProviderJob,
    roleTerms: string[],
    skillTerms: string[],
  ) {
    if (roleTerms.length === 0 && skillTerms.length === 0) {
      return 0;
    }

    const haystack = [job.title, job.description, job.location, job.company]
      .join(" ")
      .toLowerCase();

    const roleMatches = roleTerms.filter((term) =>
      haystack.includes(term),
    ).length;
    const skillMatches = skillTerms.filter((term) =>
      haystack.includes(term),
    ).length;

    return roleMatches * 2 + skillMatches;
  }

  private normalizeTerms(values: string[]) {
    return values
      .map((value) => value.trim().toLowerCase())
      .filter((value) => value.length >= 3);
  }

  private isLocalTlsFetchError(error: unknown) {
    if (!(error instanceof Error) || !("cause" in error)) {
      return false;
    }

    const cause = error.cause;
    if (!cause || typeof cause !== "object" || !("code" in cause)) {
      return false;
    }

    return cause.code === "UNABLE_TO_GET_ISSUER_CERT_LOCALLY";
  }

  private normalizeDescription(value: string) {
    return value
      .replace(/<[^>]+>/g, " ")
      .replace(/&nbsp;/gi, " ")
      .replace(/&amp;/gi, "&")
      .replace(/&#39;/gi, "'")
      .replace(/&quot;/gi, '"')
      .replace(/\s+/g, " ")
      .trim();
  }
}
