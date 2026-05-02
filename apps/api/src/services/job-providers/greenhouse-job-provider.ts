import type { JobProviderContext, ProviderJob } from "./types.js";

const GREENHOUSE_API_BASE_URL = "https://boards-api.greenhouse.io/v1/boards";

type GreenhouseBoardResponse = {
  jobs?: Array<{
    id: number;
    title: string;
    absolute_url: string;
    updated_at?: string;
    location?: {
      name?: string;
    };
    content?: string;
    offices?: Array<{
      name?: string;
      location?: {
        name?: string;
      };
    }>;
  }>;
};

export class GreenhouseJobProvider {
  readonly platform = "Greenhouse";

  constructor(private readonly boardTokens: string[]) {}

  async fetchJobs({ preferredRoles, profileSkills }: JobProviderContext) {
    const jobsByBoard = await Promise.all(
      this.boardTokens.map(async (boardToken) => {
        try {
          const response = await fetch(
            `${GREENHOUSE_API_BASE_URL}/${encodeURIComponent(boardToken)}/jobs?content=true`,
            {
              headers: {
                Accept: "application/json",
              },
            },
          );

          if (!response.ok) {
            return [] as ProviderJob[];
          }

          const payload = (await response.json()) as GreenhouseBoardResponse;
          return (payload.jobs ?? [])
            .map((job) => this.mapJob(boardToken, job))
            .filter((job): job is ProviderJob => job !== null)
            .map((job) => ({
              job,
              relevance: this.getSearchRelevance(
                job,
                preferredRoles,
                profileSkills,
              ),
            }))
            .filter(({ relevance }) => relevance > 0)
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
        } catch {
          return [] as ProviderJob[];
        }
      }),
    );

    return jobsByBoard.flat();
  }

  private mapJob(
    boardToken: string,
    job: NonNullable<GreenhouseBoardResponse["jobs"]>[number],
  ): ProviderJob | null {
    const description = this.normalizeDescription(job.content ?? "");
    if (!job.title || !job.absolute_url || !description) {
      return null;
    }

    const location =
      job.location?.name?.trim() ||
      job.offices
        ?.find((office) => office.location?.name)
        ?.location?.name?.trim() ||
      job.offices?.find((office) => office.name)?.name?.trim() ||
      "Remote";

    const company = this.formatBoardName(boardToken);

    return {
      title: job.title.trim(),
      company,
      description,
      link: job.absolute_url.trim(),
      platform: this.platform,
      location,
      postedDate: job.updated_at
        ? new Date(job.updated_at).toISOString()
        : new Date().toISOString(),
      applicantCount: 0,
      sourceMode: "remote",
    };
  }

  private getSearchRelevance(
    job: ProviderJob,
    preferredRoles: string[],
    profileSkills: string[],
  ) {
    const haystack = [job.title, job.description, job.location, job.company]
      .join(" ")
      .toLowerCase();

    const roleMatches = preferredRoles
      .map((role) => role.trim().toLowerCase())
      .filter((role) => role.length >= 3 && haystack.includes(role)).length;
    const skillMatches = profileSkills
      .map((skill) => skill.trim().toLowerCase())
      .filter((skill) => skill.length >= 3 && haystack.includes(skill)).length;

    return roleMatches * 3 + skillMatches;
  }

  private formatBoardName(value: string) {
    return value
      .split(/[-_]/)
      .filter(Boolean)
      .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
      .join(" ");
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
