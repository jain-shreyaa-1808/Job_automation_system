import type { Job } from "../types/app";

type JobFilterOptions = {
  search?: string;
  platform?: string;
  status?: Job["status"];
};

export function filterJobs(jobs: Job[], options: JobFilterOptions) {
  const normalizedSearch = options.search?.trim().toLowerCase() ?? "";

  return jobs.filter((job) => {
    if (options.platform && job.platform !== options.platform) {
      return false;
    }

    if (options.status && job.status !== options.status) {
      return false;
    }

    if (!normalizedSearch) {
      return true;
    }

    const searchableText = [
      job.title,
      job.company,
      job.location,
      job.platform,
      job.description,
      ...(job.categoryTags ?? []),
      ...(job.matchedSkills ?? []),
      ...(job.extractedSkills ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return searchableText.includes(normalizedSearch);
  });
}

export function extractPlatforms(jobs: Job[]) {
  return [...new Set(jobs.map((job) => job.platform))].sort((left, right) =>
    left.localeCompare(right),
  );
}
