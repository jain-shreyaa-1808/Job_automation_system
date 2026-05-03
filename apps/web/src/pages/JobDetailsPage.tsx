import { Link, useLocation, useParams } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import { useJobsQuery, useUpdateJobStatus } from "../hooks/usePlatformData";
import type { Job } from "../types/app";

const jobStatuses: Job["status"][] = [
  "new",
  "in-progress",
  "applied",
  "finished",
  "bookmarked",
  "closed",
];

export function JobDetailsPage() {
  const { jobId } = useParams();
  const location = useLocation();
  const routeJob = (location.state as { job?: Job } | null)?.job;
  const { data, isLoading, isError, error } = useJobsQuery();
  const updateStatus = useUpdateJobStatus();
  const job =
    (jobId ? data?.find((item) => item._id === jobId) : undefined) ?? routeJob;

  if (isLoading && !job) {
    return <div className="panel">Loading job details…</div>;
  }

  if (isError && !job) {
    return (
      <div className="panel text-sm text-red-700">
        {error instanceof Error
          ? error.message
          : "Unable to load the selected job right now."}
      </div>
    );
  }

  if (!job) {
    return (
      <div className="panel">
        No job found for this role. Refresh jobs from the listings page and try
        Inspect again.
      </div>
    );
  }

  const daysAgo = job.postedDate
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(job.postedDate).getTime()) / 86_400_000,
        ),
      )
    : null;

  const isUpdatingCurrentJob =
    updateStatus.isPending && updateStatus.variables?.jobId === job._id;

  return (
    <div>
      <SectionHeader
        eyebrow={job.platform}
        title={`${job.title} at ${job.company}`}
        description="Use this view to decide whether to tailor the resume, launch outreach, or push the application into manual or automated flow."
        actions={
          <a
            href={job.link}
            target="_blank"
            rel="noreferrer"
            className="button-primary"
          >
            Open Source Posting ↗
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel">
          <div className="flex items-center gap-3">
            <h2 className="text-2xl">Description</h2>
            {daysAgo !== null && (
              <span
                className={`rounded-full px-3 py-1 text-xs font-semibold ${daysAgo <= 3 ? "bg-moss/10 text-moss" : daysAgo <= 7 ? "bg-sky-100 text-sky-700" : "bg-ink/5 text-ink/50"}`}
              >
                {daysAgo === 0
                  ? "Posted today"
                  : daysAgo === 1
                    ? "1 day ago"
                    : `${daysAgo} days ago`}
              </span>
            )}
          </div>
          <p className="mt-4 text-sm leading-7 text-ink/75">
            {job.description}
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {(job.categoryTags ?? []).map((tag) => (
              <span
                key={tag}
                className="rounded-full bg-ember/10 px-3 py-2 text-sm font-semibold text-ember"
              >
                {tag}
              </span>
            ))}
            {(job.matchedSkills ?? []).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-moss/10 px-3 py-2 text-sm font-semibold text-moss"
              >
                {skill}
              </span>
            ))}
            {(job.missingSkills ?? []).map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-ember/10 px-3 py-2 text-sm font-semibold text-ember"
              >
                Gap: {skill}
              </span>
            ))}
            {(job.extractedSkills ?? [])
              .filter((skill) => !(job.matchedSkills ?? []).includes(skill))
              .slice(0, 8)
              .map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-skywash px-3 py-2 text-sm font-semibold text-ink"
                >
                  {skill}
                </span>
              ))}
          </div>
        </section>

        <section className="panel space-y-4">
          <h2 className="text-2xl">Actions</h2>
          <label className="flex items-center justify-between gap-3 rounded-2xl border border-ink/10 bg-white/70 px-4 py-3 text-sm font-semibold text-ink/70">
            <span>Move to section</span>
            <select
              className="bg-transparent text-sm font-semibold outline-none"
              value={job.status}
              disabled={isUpdatingCurrentJob}
              onChange={(event) =>
                updateStatus.mutate({
                  jobId: job._id,
                  status: event.target.value as Job["status"],
                })
              }
            >
              {jobStatuses.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>
          </label>
          <Link
            to={`/optimizer?jobId=${job._id}`}
            className="button-primary w-full"
          >
            Tailor Resume
          </Link>
          <Link
            to={`/outreach?jobId=${job._id}`}
            className="button-secondary w-full"
          >
            Generate Outreach
          </Link>
          <Link
            to={`/auto-apply?jobId=${job._id}`}
            className={`button-secondary w-full text-center ${
              job.status === "applied" || job.status === "closed"
                ? "pointer-events-none opacity-50"
                : ""
            }`}
          >
            {job.status === "applied"
              ? "Already Applied"
              : job.status === "closed"
                ? "Closed Job"
                : "Queue Auto Apply"}
          </Link>
          {updateStatus.isError && isUpdatingCurrentJob && (
            <p className="text-sm text-red-700">
              {updateStatus.error instanceof Error
                ? updateStatus.error.message
                : "Unable to update the job state right now."}
            </p>
          )}
        </section>
      </div>
    </div>
  );
}
