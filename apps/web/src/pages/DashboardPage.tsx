import { useMemo, useState } from "react";

import {
  useDashboardQuery,
  useTriggerJobFetch,
} from "../hooks/usePlatformData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { JobCard } from "../components/JobCard";
import { extractPlatforms, filterJobs } from "../lib/job-filters";

const filters = [
  "all",
  "new",
  "applied",
  "in-progress",
  "finished",
  "bookmarked",
] as const;

export function DashboardPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const [platform, setPlatform] = useState<string | undefined>(undefined);
  const [search, setSearch] = useState("");
  const { data, isLoading, isError, error } = useDashboardQuery();
  const fetchJobs = useTriggerJobFetch();
  const allJobs = useMemo(
    () =>
      data
        ? [
            ...data.tabs.newJobs,
            ...data.tabs.applied,
            ...data.tabs.inProgress,
            ...data.tabs.finished,
            ...data.tabs.bookmarked,
          ]
        : [],
    [data],
  );
  const visibleJobs = filterJobs(allJobs, {
    status: status as
      | "new"
      | "applied"
      | "in-progress"
      | "finished"
      | "bookmarked"
      | undefined,
    platform,
    search,
  });
  const platforms = extractPlatforms(allJobs);
  if (platform && !platforms.includes(platform)) {
    platforms.push(platform);
  }
  const recruiterLeads = data?.recruiterLeads ?? [];
  const skillGapRoadmap = data?.skillGapRoadmap ?? [];

  const fetchJobsError =
    fetchJobs.error instanceof Error
      ? fetchJobs.error.message
      : "Unable to refresh jobs right now.";
  const dashboardError =
    error instanceof Error
      ? error.message
      : "Unable to load dashboard data right now.";

  return (
    <div>
      <SectionHeader
        eyebrow="Mission Control"
        title="Your job search at a glance."
        description="Resume score, new matches, skill gaps, and recruiter leads — all in one place."
        actions={
          <button
            type="button"
            className="button-primary"
            disabled={fetchJobs.isPending}
            onClick={() => fetchJobs.mutate()}
          >
            {fetchJobs.isPending ? "Fetching…" : "Refresh Jobs"}
          </button>
        }
      />

      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        <StatCard
          label="Resume Score"
          value={`${data?.resumeScore ?? 0}`}
          helper="ATS readiness from your parsed resume."
        />
        <StatCard
          label="Visible Jobs"
          value={`${allJobs.length}`}
          helper="Verified profile-fit roles synced with your jobs list."
        />
        <StatCard
          label="Recruiter Leads"
          value={`${recruiterLeads.length}`}
          helper="Profiles and recent posts to follow up."
        />
      </div>

      {fetchJobs.isSuccess && (
        <div className="mt-4 rounded-2xl border border-moss/20 bg-moss/5 px-4 py-3 text-sm text-moss">
          Jobs refreshed successfully.
        </div>
      )}
      {fetchJobs.isError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {fetchJobsError}
        </div>
      )}
      {isError && (
        <div className="mt-4 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {dashboardError}
        </div>
      )}

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">Jobs Snapshot</h2>
            <span className="text-sm text-ink/60">Highest relevance first</span>
          </div>
          <div className="flex flex-wrap items-center gap-2">
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
            <label className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-sm text-ink/70">
              <span>Portal</span>
              <select
                className="bg-transparent text-sm outline-none"
                value={platform ?? "all"}
                onChange={(event) =>
                  setPlatform(
                    event.target.value === "all"
                      ? undefined
                      : event.target.value,
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
          </div>
          {!isLoading && !isError && allJobs.length > 0 && (
            <p className="text-sm text-ink/60">
              Showing {visibleJobs.length} of {allJobs.length} jobs
              {search.trim() ? ` for "${search.trim()}"` : ""}.
            </p>
          )}
          {isLoading && (
            <p className="panel text-center text-sm text-ink/50">Loading…</p>
          )}
          {!isLoading && !isError && allJobs.length === 0 && (
            <p className="panel text-center text-sm text-ink/50">
              No new jobs yet. Click "Refresh Jobs" to discover matches.
            </p>
          )}
          {!isLoading &&
            !isError &&
            allJobs.length > 0 &&
            visibleJobs.length === 0 && (
              <p className="panel text-center text-sm text-ink/50">
                No jobs match the current filters.
              </p>
            )}
          {visibleJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </section>

        <section className="space-y-6">
          <div className="panel">
            <h2 className="text-2xl">Skill Gap Roadmap</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {skillGapRoadmap.length > 0 ? (
                skillGapRoadmap.map((skill) => (
                  <span
                    key={skill}
                    className="rounded-full bg-ember/10 px-3 py-2 text-sm font-semibold text-ember"
                  >
                    {skill}
                  </span>
                ))
              ) : (
                <p className="text-sm text-ink/50">
                  Upload a resume to see skill gap analysis.
                </p>
              )}
            </div>
          </div>

          <div className="panel">
            <h2 className="text-2xl">Recruiter Radar</h2>
            <div className="mt-4 space-y-4">
              {recruiterLeads.length > 0 ? (
                recruiterLeads.map((lead) => (
                  <div
                    key={lead._id}
                    className="rounded-2xl border border-ink/10 p-4"
                  >
                    <div className="flex items-center justify-between gap-3">
                      <div>
                        <p className="font-semibold">{lead.name}</p>
                        <p className="text-sm text-ink/60">{lead.company}</p>
                      </div>
                      <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">
                        {lead.state}
                      </span>
                    </div>
                    <ul className="mt-3 space-y-1 text-sm text-ink/70">
                      {lead.recentPosts.map((post) => (
                        <li key={post}>• {post}</li>
                      ))}
                    </ul>
                  </div>
                ))
              ) : (
                <p className="text-sm text-ink/50">No recruiter leads yet.</p>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
