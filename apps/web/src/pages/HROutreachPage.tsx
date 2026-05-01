import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import {
  useDashboardQuery,
  useGenerateOutreach,
  useJobsQuery,
} from "../hooks/usePlatformData";

export function HROutreachPage() {
  const { data: jobs, isLoading } = useJobsQuery();
  const { data: dashboard } = useDashboardQuery();
  const outreach = useGenerateOutreach();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  // Auto-select job from URL params
  useEffect(() => {
    const urlJobId = searchParams.get("jobId");
    if (urlJobId && jobs && !jobId) {
      const found = jobs.find((j) => j._id === urlJobId);
      if (found) {
        setJobId(found._id);
        setSearch(`${found.title} — ${found.company}`);
      }
    }
  }, [searchParams, jobs, jobId]);

  const filtered = useMemo(() => {
    if (!jobs) return [];
    if (!search.trim()) return jobs;
    const q = search.toLowerCase();
    return jobs.filter(
      (j) =>
        j.title.toLowerCase().includes(q) ||
        j.company.toLowerCase().includes(q),
    );
  }, [jobs, search]);

  return (
    <div>
      <SectionHeader
        eyebrow="Recruiter Outreach"
        title="Track recruiter profiles and generate personalized messages."
        description="Review leads, move them through states, and generate tailored cold emails and LinkedIn messages."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="panel">
          <h2 className="text-2xl">Lead Review</h2>
          {dashboard?.recruiterLeads && dashboard.recruiterLeads.length > 0 ? (
            <div className="mt-4 space-y-4">
              {dashboard.recruiterLeads.map((lead) => (
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
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        lead.state === "action-taken"
                          ? "bg-moss"
                          : lead.state === "finished"
                            ? "bg-ember"
                            : "bg-ink"
                      }`}
                    >
                      {lead.state}
                    </span>
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-ink/70">
                    {lead.recentPosts.map((post) => (
                      <li key={post}>• {post}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/50">
              No recruiter leads yet. Apply to jobs first, then leads will
              appear here.
            </p>
          )}
        </section>

        <section className="panel space-y-4">
          <label className="block text-sm font-semibold text-ink/70">
            Choose job for outreach
          </label>

          <div className="relative" ref={wrapperRef}>
            <input
              className="input"
              placeholder={isLoading ? "Loading jobs…" : "Type to search jobs…"}
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setOpen(true);
              }}
              onFocus={() => setOpen(true)}
            />
            {open && filtered.length > 0 && (
              <ul className="absolute z-20 mt-1 max-h-56 w-full overflow-y-auto rounded-2xl border border-ink/10 bg-white shadow-panel">
                {filtered.map((job) => (
                  <li key={job._id}>
                    <button
                      type="button"
                      className={`w-full px-4 py-3 text-left text-sm transition hover:bg-skywash ${
                        job._id === jobId ? "bg-skywash font-semibold" : ""
                      }`}
                      onClick={() => {
                        setJobId(job._id);
                        setSearch(`${job.title} — ${job.company}`);
                        setOpen(false);
                      }}
                    >
                      <span className="font-medium">{job.title}</span>
                      <span className="ml-2 text-ink/50">@ {job.company}</span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <button
            type="button"
            className="button-primary w-full"
            disabled={!jobId || outreach.isPending}
            onClick={() => outreach.mutate(jobId)}
          >
            {outreach.isPending ? "Generating…" : "Generate Drafts"}
          </button>

          {(outreach.data?.email || outreach.data?.linkedinMessage) && (
            <div className="space-y-4 pt-2">
              <div className="grid gap-4 lg:grid-cols-2">
                <div className="rounded-3xl bg-skywash p-5">
                  <h3 className="text-lg font-semibold">Cold Email</h3>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">
                    {outreach.data.email}
                  </pre>
                </div>
                <div className="rounded-3xl bg-white p-5 ring-1 ring-ink/10">
                  <h3 className="text-lg font-semibold">LinkedIn Message</h3>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">
                    {outreach.data.linkedinMessage}
                  </pre>
                </div>
              </div>
              {outreach.data.referralMessage && (
                <div className="rounded-3xl bg-moss/5 p-5 ring-1 ring-moss/20">
                  <h3 className="text-lg font-semibold text-moss">
                    Referral Request Message
                  </h3>
                  <pre className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink/80">
                    {outreach.data.referralMessage}
                  </pre>
                </div>
              )}
            </div>
          )}

          {!outreach.data && !outreach.isPending && (
            <div className="grid gap-4 pt-2 lg:grid-cols-2">
              <div className="rounded-3xl border border-dashed border-ink/10 p-5 text-center text-sm text-ink/40">
                Cold email will appear here
              </div>
              <div className="rounded-3xl border border-dashed border-ink/10 p-5 text-center text-sm text-ink/40">
                LinkedIn message will appear here
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
