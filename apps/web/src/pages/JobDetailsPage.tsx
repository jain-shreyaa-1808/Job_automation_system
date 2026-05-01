import { Link, useParams } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import { useJobsQuery } from "../hooks/usePlatformData";

export function JobDetailsPage() {
  const { jobId } = useParams();
  const { data } = useJobsQuery();
  const job = data?.find((item) => item._id === jobId) ?? data?.[0];

  if (!job) {
    return <div className="panel">No job selected.</div>;
  }

  const daysAgo = job.postedDate
    ? Math.max(
        0,
        Math.floor(
          (Date.now() - new Date(job.postedDate).getTime()) / 86_400_000,
        ),
      )
    : null;

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
            {job.matchedSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-moss/10 px-3 py-2 text-sm font-semibold text-moss"
              >
                {skill}
              </span>
            ))}
            {job.missingSkills.map((skill) => (
              <span
                key={skill}
                className="rounded-full bg-ember/10 px-3 py-2 text-sm font-semibold text-ember"
              >
                Gap: {skill}
              </span>
            ))}
          </div>
        </section>

        <section className="panel space-y-4">
          <h2 className="text-2xl">Actions</h2>
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
              job.status === "applied" ? "pointer-events-none opacity-50" : ""
            }`}
          >
            {job.status === "applied" ? "Already Applied" : "Queue Auto Apply"}
          </Link>
        </section>
      </div>
    </div>
  );
}
