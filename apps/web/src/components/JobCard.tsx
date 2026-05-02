import { ArrowUpRight, Bookmark, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

import { useUpdateJobStatus } from "../hooks/usePlatformData";
import type { Job } from "../types/app";

const jobStatuses = [
  "new",
  "in-progress",
  "applied",
  "finished",
  "bookmarked",
] as const;

type JobCardProps = {
  job: Job;
};

function getPlatformStyles(platform: string) {
  const normalized = platform.toLowerCase();

  if (normalized.includes("foundit")) {
    return {
      card: "border-violet-200 bg-gradient-to-br from-violet-50 via-white to-fuchsia-50",
      label: "text-violet-700",
    };
  }
  if (normalized.includes("naukri")) {
    return {
      card: "border-sky-200 bg-gradient-to-br from-sky-50 via-white to-blue-50",
      label: "text-sky-700",
    };
  }
  if (normalized.includes("hirist")) {
    return {
      card: "border-orange-200 bg-gradient-to-br from-orange-50 via-white to-amber-50",
      label: "text-orange-700",
    };
  }
  if (normalized.includes("remote ok")) {
    return {
      card: "border-emerald-200 bg-gradient-to-br from-emerald-50 via-white to-lime-50",
      label: "text-emerald-700",
    };
  }

  return {
    card: "border-white/60 bg-white/85",
    label: "text-ember",
  };
}

function getDaysAgo(dateStr?: string): number | null {
  if (!dateStr) return null;
  return Math.max(
    0,
    Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000),
  );
}

function formatDaysAgo(days: number): string {
  if (days === 0) return "Posted today";
  if (days === 1) return "1 day ago";
  return `${days} days ago`;
}

export function JobCard({ job }: JobCardProps) {
  const updateStatus = useUpdateJobStatus();
  const daysAgo = getDaysAgo(job.postedDate);
  const isEarlyApplicant =
    daysAgo !== null && daysAgo <= 2 && (job.applicantCount ?? 999) < 50;
  const matchedSkills = job.matchedSkills ?? [];
  const categoryTags = job.categoryTags ?? [];
  const platformStyles = getPlatformStyles(job.platform);
  const experienceLabel =
    typeof job.experienceMin === "number" &&
    typeof job.experienceMax === "number"
      ? `${job.experienceMin}-${job.experienceMax} yrs`
      : null;

  const isUpdatingCurrentJob =
    updateStatus.isPending && updateStatus.variables?.jobId === job._id;

  function handleStatusChange(nextStatus: Job["status"]) {
    if (nextStatus === job.status) {
      return;
    }

    updateStatus.mutate({ jobId: job._id, status: nextStatus });
  }

  return (
    <article
      className={`panel group transition hover:-translate-y-1 ${platformStyles.card}`}
    >
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p
              className={`text-xs font-semibold uppercase tracking-[0.2em] ${platformStyles.label}`}
            >
              {job.platform}
            </p>
            {isEarlyApplicant && (
              <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-moss">
                Early Applicant
              </span>
            )}
            {experienceLabel && (
              <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/70">
                {experienceLabel}
              </span>
            )}
            <span className="rounded-full bg-ink/5 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-ink/70">
              {job.status}
            </span>
            {job.linkStatus === "valid" && (
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                ✓ Link Verified
              </span>
            )}
            {job.linkStatus === "unchecked" && (
              <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-700">
                ⏳ Checking…
              </span>
            )}
          </div>
          <h3 className="mt-3 text-2xl">{job.title}</h3>
          <p className="mt-2 text-sm text-ink/65">{job.company}</p>
        </div>
        <div className="rounded-full bg-moss px-4 py-2 text-sm font-semibold text-white">
          {job.relevanceScore}% match
        </div>
      </div>

      <p className="mt-4 line-clamp-3 text-sm leading-6 text-ink/75">
        {job.description}
      </p>

      <div className="mt-5 flex flex-wrap gap-2">
        {categoryTags.map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-ember/10 px-3 py-1 text-xs font-semibold text-ember"
          >
            {tag}
          </span>
        ))}
        {matchedSkills.map((skill) => (
          <span
            key={skill}
            className="rounded-full bg-skywash px-3 py-1 text-xs font-semibold text-ink"
          >
            {skill}
          </span>
        ))}
      </div>

      <div className="mt-6 flex flex-wrap items-center justify-between gap-3 text-sm text-ink/65">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="h-4 w-4" />
            {job.location}
          </div>
          {daysAgo !== null && (
            <div className="flex items-center gap-1">
              <Clock className="h-3.5 w-3.5" />
              <span
                className={
                  daysAgo <= 2
                    ? "font-semibold text-moss"
                    : daysAgo <= 7
                      ? "text-ink/70"
                      : "text-ink/40"
                }
              >
                {formatDaysAgo(daysAgo)}
              </span>
            </div>
          )}
          {job.applicantCount != null && (
            <div className="flex items-center gap-1">
              <Users className="h-3.5 w-3.5" />
              <span>{job.applicantCount} applicants</span>
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            className="button-secondary px-4 py-2"
            disabled={isUpdatingCurrentJob}
            onClick={() => handleStatusChange("bookmarked")}
          >
            <Bookmark className="mr-2 h-4 w-4" />
            {job.status === "bookmarked" ? "Saved" : "Save"}
          </button>
          <label className="flex items-center gap-2 rounded-full border border-ink/10 bg-white/70 px-3 py-2 text-xs font-semibold uppercase tracking-wider text-ink/60">
            <span>Move to</span>
            <select
              className="bg-transparent text-xs font-semibold uppercase tracking-wider outline-none"
              value={job.status}
              disabled={isUpdatingCurrentJob}
              onChange={(event) =>
                handleStatusChange(event.target.value as Job["status"])
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
            to={`/jobs/${job._id}`}
            state={{ job }}
            className="button-primary px-4 py-2"
          >
            Inspect
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
      {updateStatus.isError && updateStatus.variables?.jobId === job._id && (
        <p className="mt-4 text-sm text-red-700">
          {updateStatus.error instanceof Error
            ? updateStatus.error.message
            : "Unable to update the job state right now."}
        </p>
      )}
    </article>
  );
}
