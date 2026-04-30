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
            Open Source Posting
          </a>
        }
      />

      <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
        <section className="panel">
          <h2 className="text-2xl">Description</h2>
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
          <Link to="/optimizer" className="button-primary w-full">
            Tailor Resume
          </Link>
          <Link to="/outreach" className="button-secondary w-full">
            Generate Outreach
          </Link>
          <button type="button" className="button-secondary w-full">
            Queue Auto Apply
          </button>
        </section>
      </div>
    </div>
  );
}
