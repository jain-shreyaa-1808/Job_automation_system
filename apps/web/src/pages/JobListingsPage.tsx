import { useState } from "react";

import { JobCard } from "../components/JobCard";
import { SectionHeader } from "../components/SectionHeader";
import {
  useJobsQuery,
  useTriggerJobFetch,
  useValidateJobLinks,
} from "../hooks/usePlatformData";
import { extractPlatforms, filterJobs } from "../lib/job-filters";

const filters = [
  "all",
  "new",
  "applied",
  "in-progress",
  "finished",
  "bookmarked",
  "closed",
] as const;

export function JobListingsPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [platform, setPlatform] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error } = useJobsQuery(status, platform);
  const fetchJobs = useTriggerJobFetch();
  const validateLinks = useValidateJobLinks();
  const jobs = data ?? [];
  const visibleJobs = filterJobs(jobs, { search });
  const platforms = extractPlatforms(jobs);
  if (platform && !platforms.includes(platform)) {
    platforms.push(platform);
  }
  const jobsError =
    error instanceof Error
      ? error.message
      : "Unable to load job listings right now.";
  const fetchJobsError =
    fetchJobs.error instanceof Error
      ? fetchJobs.error.message
      : "Unable to fetch jobs right now.";

  return (
    <div>
      <SectionHeader
        eyebrow="Job Pipeline"
        title="Inspect ranked roles across your target portals."
        description="Only jobs with active, verified links are shown. Invalid or expired postings are filtered out automatically."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              filter === (status ?? "all")
                ? "button-primary"
                : "button-secondary"
            }
            onClick={() => setStatus(filter === "all" ? undefined : filter)}
          >
            {filter}
          </button>
        ))}
        <label className="ml-2 flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink/70">
          <span>Portal</span>
          <select
            className="bg-transparent text-sm outline-none"
            value={platform ?? "all"}
            onChange={(event) =>
              setPlatform(
                event.target.value === "all" ? undefined : event.target.value,
              )
            }
          >
            <option value="all">All portals</option>
            {platforms.map((portal) => (
              <option key={portal} value={portal}>
                {portal}
              </option>
            ))}
          </select>
        </label>
        <input
          type="search"
          className="input min-w-[220px] flex-1"
          value={search}
          placeholder="Search title, company, skills, location..."
          onChange={(event) => setSearch(event.target.value)}
        />
        <button
          type="button"
          className="button-primary"
          disabled={fetchJobs.isPending}
          onClick={() => fetchJobs.mutate()}
        >
          {fetchJobs.isPending ? "Fetching jobs…" : "Refresh Jobs"}
        </button>
        <button
          type="button"
          className="button-secondary ml-auto text-sm"
          disabled={validateLinks.isPending}
          onClick={() => validateLinks.mutate()}
        >
          {validateLinks.isPending ? "Validating links…" : "🔗 Validate Links"}
        </button>
        {validateLinks.isSuccess && (
          <span className="text-xs text-moss">
            ✓ {validateLinks.data.valid} valid, {validateLinks.data.invalid}{" "}
            invalid removed
          </span>
        )}
      </div>

      {fetchJobs.isSuccess && (
        <div className="mb-6 rounded-2xl border border-moss/20 bg-moss/5 px-4 py-3 text-sm text-moss">
          Jobs refreshed successfully.
        </div>
      )}
      {fetchJobs.isError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchJobsError}
        </div>
      )}
      {isError && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {jobsError}
        </div>
      )}

      {isLoading && (
        <div className="panel text-center text-sm text-ink/50">
          Loading jobs…
        </div>
      )}

      {!isLoading && !isError && jobs.length === 0 && (
        <div className="panel text-center text-sm text-ink/50">
          No jobs found yet. Click "Refresh Jobs" to discover roles matched to
          your profile.
        </div>
      )}

      {!isLoading && !isError && jobs.length > 0 && (
        <div className="mb-4 text-sm text-ink/60">
          Showing {visibleJobs.length} of {jobs.length} jobs
          {search.trim() ? ` for "${search.trim()}"` : ""}.
        </div>
      )}

      <div className="grid gap-5 xl:grid-cols-2">
        {visibleJobs.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
