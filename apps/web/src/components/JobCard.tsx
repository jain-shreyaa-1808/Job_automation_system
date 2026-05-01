import { ArrowUpRight, Bookmark, Clock, MapPin, Users } from "lucide-react";
import { Link } from "react-router-dom";

import type { Job } from "../types/app";

type JobCardProps = {
  job: Job;
};

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
  const daysAgo = getDaysAgo(job.postedDate);
  const isEarlyApplicant =
    daysAgo !== null && daysAgo <= 2 && (job.applicantCount ?? 999) < 50;

  return (
    <article className="panel group transition hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ember">
              {job.platform}
            </p>
            {isEarlyApplicant && (
              <span className="rounded-full bg-moss/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-moss">
                Early Applicant
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
        {job.matchedSkills.map((skill) => (
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
          <button type="button" className="button-secondary px-4 py-2">
            <Bookmark className="mr-2 h-4 w-4" />
            Save
          </button>
          <Link to={`/jobs/${job._id}`} className="button-primary px-4 py-2">
            Inspect
            <ArrowUpRight className="ml-2 h-4 w-4" />
          </Link>
        </div>
      </div>
    </article>
  );
}
