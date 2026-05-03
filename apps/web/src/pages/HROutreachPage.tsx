import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import {
  useDashboardQuery,
  useFindHrLeads,
  useGenerateOutreach,
  useJobsQuery,
  useUpdateHrLeadState,
} from "../hooks/usePlatformData";
import type { RecruiterLead, RecruiterLeadState } from "../types/app";

const CATEGORY_FILTERS = [
  { value: "all", label: "All leads" },
  { value: "talent-acquisition", label: "Talent Acquisition" },
  { value: "hr", label: "HR" },
  { value: "hiring-manager", label: "Hiring Manager" },
] as const;

function getLeadOutreachStatus(lead: RecruiterLead) {
  return lead.state === "pending" ? "yet-to-be-sent" : "sent";
}

function getLeadBadgeLabel(lead: RecruiterLead) {
  return lead.state === "pending" ? "Yet to be sent" : "Message sent";
}

export function HROutreachPage() {
  const { data: jobs, isLoading } = useJobsQuery();
  const { data: dashboard } = useDashboardQuery();
  const findHrLeads = useFindHrLeads();
  const outreach = useGenerateOutreach();
  const updateLeadState = useUpdateHrLeadState();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState<string>("");
  const [leadId, setLeadId] = useState<string>("");
  const [categoryFilter, setCategoryFilter] =
    useState<(typeof CATEGORY_FILTERS)[number]["value"]>("all");
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

  const selectedJobLeads = useMemo(() => {
    if (!dashboard?.recruiterLeads || !jobId) return [];
    return dashboard.recruiterLeads.filter((lead) => lead.jobId === jobId);
  }, [dashboard?.recruiterLeads, jobId]);

  const visibleLeads = useMemo(() => {
    if (categoryFilter === "all") {
      return selectedJobLeads;
    }

    return selectedJobLeads.filter((lead) => lead.category === categoryFilter);
  }, [selectedJobLeads, categoryFilter]);

  const outreachSummary = useMemo(() => {
    return visibleLeads.reduce(
      (summary, lead) => {
        if (lead.state === "pending") {
          summary.yetToBeSent += 1;
        } else {
          summary.sent += 1;
        }

        return summary;
      },
      { yetToBeSent: 0, sent: 0 },
    );
  }, [visibleLeads]);

  useEffect(() => {
    if (!visibleLeads.some((lead) => lead._id === leadId)) {
      setLeadId(visibleLeads[0]?._id ?? "");
    }
  }, [visibleLeads, leadId]);

  function openAllLeadSearches() {
    visibleLeads.forEach((lead) => {
      const target = lead.searchUrl ?? lead.profileUrl;
      if (target) {
        window.open(target, "_blank", "noopener,noreferrer");
      }
    });
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Recruiter Outreach"
        title="Reach out to recruiters with a ready-to-send LinkedIn message."
        description="Discover active HR and recruiter leads, keep a sent vs pending view, and generate a LinkedIn message you can send when a role fit appears."
      />

      <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
        <section className="panel">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="text-2xl">Lead Review</h2>
              <p className="mt-1 text-sm text-ink/50">
                Review active recruiter names and profile links, then mark each
                one as message sent or yet to be sent.
              </p>
            </div>
            <button
              type="button"
              className="button-secondary"
              disabled={visibleLeads.length === 0}
              onClick={openAllLeadSearches}
            >
              Open all lead searches
            </button>
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            {CATEGORY_FILTERS.map((filter) => (
              <button
                key={filter.value}
                type="button"
                className={`rounded-full px-4 py-2 text-sm font-semibold transition ${
                  categoryFilter === filter.value
                    ? "bg-ink text-white"
                    : "bg-skywash text-ink/70 hover:bg-ink/10"
                }`}
                onClick={() => setCategoryFilter(filter.value)}
              >
                {filter.label}
              </button>
            ))}
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl bg-skywash p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink/55">
                Yet to be sent
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {outreachSummary.yetToBeSent}
              </p>
            </div>
            <div className="rounded-2xl bg-moss/10 p-4">
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-moss">
                Message sent
              </p>
              <p className="mt-2 text-3xl font-semibold text-ink">
                {outreachSummary.sent}
              </p>
            </div>
          </div>

          {visibleLeads.length > 0 ? (
            <div className="mt-4 space-y-4">
              {visibleLeads.map((lead) => (
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
                      {lead.hiringSignal ? (
                        <p className="mt-2 text-sm text-moss">
                          {lead.hiringSignal}
                        </p>
                      ) : null}
                    </div>
                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold text-white ${
                        lead.state === "pending"
                          ? "bg-ink"
                          : lead.state === "action-taken"
                            ? "bg-moss"
                            : "bg-ember"
                      }`}
                    >
                      {getLeadBadgeLabel(lead)}
                    </span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-ink/60">
                    <span className="rounded-full bg-skywash px-3 py-1 font-semibold uppercase tracking-[0.18em] text-ink/70">
                      {lead.category.replace("-", " ")}
                    </span>
                    {lead.searchQuery ? (
                      <span className="rounded-full bg-ink/5 px-3 py-1">
                        {lead.searchQuery}
                      </span>
                    ) : null}
                  </div>
                  <ul className="mt-3 space-y-1 text-sm text-ink/70">
                    <li>
                      Profile: {lead.name} at {lead.company}
                    </li>
                    {lead.recentPosts.map((post) => (
                      <li key={post}>• {post}</li>
                    ))}
                  </ul>
                  <div className="mt-4 flex flex-wrap gap-3 text-sm font-semibold">
                    {lead.profileUrl ? (
                      <a
                        className="text-moss underline-offset-4 hover:underline"
                        href={lead.profileUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open profile search
                      </a>
                    ) : null}
                    {lead.searchUrl ? (
                      <a
                        className="text-moss underline-offset-4 hover:underline"
                        href={lead.searchUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Open hiring search
                      </a>
                    ) : null}
                  </div>
                  <div className="mt-4">
                    <p className="text-sm font-semibold text-ink/70">
                      Message status
                    </p>
                    <div className="mt-3 flex flex-wrap gap-3">
                      {[
                        { label: "Yet to be sent", value: "yet-to-be-sent" },
                        { label: "Message sent", value: "sent" },
                      ].map((option) => {
                        const checked =
                          getLeadOutreachStatus(lead) === option.value;

                        return (
                          <label
                            key={option.value}
                            className={`flex cursor-pointer items-center gap-2 rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              checked
                                ? "border-ink bg-ink text-white"
                                : "border-ink/10 bg-white text-ink/70 hover:border-ink/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`lead-status-${lead._id}`}
                              className="h-4 w-4"
                              checked={checked}
                              disabled={updateLeadState.isPending}
                              onChange={() =>
                                updateLeadState.mutate({
                                  leadId: lead._id,
                                  state:
                                    option.value === "sent"
                                      ? "action-taken"
                                      : ("pending" as RecruiterLeadState),
                                })
                              }
                            />
                            {option.label}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="mt-4 text-sm text-ink/50">
              No LinkedIn hiring leads match this filter yet. Pick a role and
              run discovery to generate recruiter and hiring-manager searches.
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
            className="button-secondary w-full"
            disabled={!jobId || findHrLeads.isPending}
            onClick={() => findHrLeads.mutate(jobId)}
          >
            {findHrLeads.isPending
              ? "Finding LinkedIn leads…"
              : "Find LinkedIn Hiring Leads"}
          </button>

          {visibleLeads.length > 0 ? (
            <label className="block text-sm font-semibold text-ink/70">
              Pick lead for personalized outreach
              <select
                className="input mt-2"
                value={leadId}
                onChange={(e) => setLeadId(e.target.value)}
              >
                {visibleLeads.map((lead) => (
                  <option key={lead._id} value={lead._id}>
                    {lead.name} — {lead.title}
                  </option>
                ))}
              </select>
            </label>
          ) : null}

          <button
            type="button"
            className="button-primary w-full"
            disabled={!jobId || outreach.isPending}
            onClick={() =>
              outreach.mutate({
                jobId,
                ...(leadId ? { recruiterLeadId: leadId } : {}),
              })
            }
          >
            {outreach.isPending
              ? "Generating…"
              : "Generate LinkedIn Outreach Message"}
          </button>

          {findHrLeads.data?.leads?.length ? (
            <p className="text-sm text-moss">
              Found {findHrLeads.data.leads.length} LinkedIn lead candidates for
              this job.
            </p>
          ) : null}

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
                  <h3 className="text-lg font-semibold">
                    LinkedIn Outreach Message
                  </h3>
                  <p className="mt-2 text-sm text-ink/55">
                    Send this to the selected recruiter to ask about open roles
                    and invite them to reach out if your profile matches.
                  </p>
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
                LinkedIn outreach message will appear here
              </div>
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
