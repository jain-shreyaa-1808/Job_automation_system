import { useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import {
  useDashboardQuery,
  useGenerateOutreach,
  useJobsQuery,
} from "../hooks/usePlatformData";

export function HROutreachPage() {
  const { data: jobs } = useJobsQuery();
  const { data: dashboard } = useDashboardQuery();
  const outreach = useGenerateOutreach();
  const [jobId, setJobId] = useState<string>(jobs?.[0]?._id ?? "job-1");

  return (
    <div>
      <SectionHeader
        eyebrow="Recruiter Outreach"
        title="Track recruiter profiles, recent posts, and personalized messages."
        description="Review leads, move them into actioned or finished state, and generate tailored contact drafts from the same surface."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="panel">
          <h2 className="text-2xl">Lead Review</h2>
          <div className="mt-4 space-y-4">
            {dashboard?.recruiterLeads.map((lead) => (
              <div
                key={lead._id}
                className="rounded-2xl border border-ink/10 p-4"
              >
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{lead.name}</p>
                    <p className="text-sm text-ink/60">
                      {lead.title} · {lead.company}
                    </p>
                  </div>
                  <span className="rounded-full bg-ink px-3 py-1 text-xs text-white">
                    {lead.state}
                  </span>
                </div>
                <div className="mt-3 space-y-2 text-sm text-ink/75">
                  {lead.recentPosts.map((post) => (
                    <p key={post}>{post}</p>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="panel space-y-4">
          <label className="text-sm font-semibold text-ink/70">
            Choose job for outreach
          </label>
          <select
            className="input"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          >
            {(jobs ?? []).map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.company}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button-primary"
            onClick={() => outreach.mutate(jobId)}
          >
            Generate Drafts
          </button>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="rounded-3xl bg-skywash p-5">
              <h3 className="text-xl">Cold Email</h3>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">
                {outreach.data?.email ?? "Email output appears here."}
              </pre>
            </div>
            <div className="rounded-3xl bg-white p-5 ring-1 ring-ink/10">
              <h3 className="text-xl">LinkedIn Message</h3>
              <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">
                {outreach.data?.linkedinMessage ??
                  "LinkedIn message appears here."}
              </pre>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
