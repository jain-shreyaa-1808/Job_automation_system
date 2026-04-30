import {
  useDashboardQuery,
  useTriggerJobFetch,
} from "../hooks/usePlatformData";
import { SectionHeader } from "../components/SectionHeader";
import { StatCard } from "../components/StatCard";
import { JobCard } from "../components/JobCard";

export function DashboardPage() {
  const { data } = useDashboardQuery();
  const fetchJobs = useTriggerJobFetch();

  return (
    <div>
      <SectionHeader
        eyebrow="Mission Control"
        title="Steer discovery, tailoring, and outreach from one place."
        description="The dashboard condenses matching strength, recruiter follow-ups, skill gaps, and the jobs that still need a decision."
        actions={
          <button
            type="button"
            className="button-primary"
            onClick={() => fetchJobs.mutate()}
          >
            Refresh Jobs
          </button>
        }
      />

      <div className="grid gap-4 md:grid-cols-3">
        <StatCard
          label="Resume Score"
          value={`${data?.resumeScore ?? 0}`}
          helper="ATS readiness from parsed resume structure and skill density."
        />
        <StatCard
          label="Pending Jobs"
          value={`${data?.tabs.newJobs.length ?? 0}`}
          helper="Fresh matches still waiting for a decision."
        />
        <StatCard
          label="Recruiter Leads"
          value={`${data?.recruiterLeads.length ?? 0}`}
          helper="Profiles and recent posts needing action."
        />
      </div>

      <div className="mt-6 grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl">New Jobs</h2>
            <span className="text-sm text-ink/60">Highest relevance first</span>
          </div>
          {data?.tabs.newJobs.map((job) => (
            <JobCard key={job._id} job={job} />
          ))}
        </section>

        <section className="space-y-6">
          <div className="panel">
            <h2 className="text-2xl">Skill Gap Roadmap</h2>
            <div className="mt-4 flex flex-wrap gap-2">
              {data?.skillGapRoadmap.map((skill) => (
                <span
                  key={skill}
                  className="rounded-full bg-ember/10 px-3 py-2 text-sm font-semibold text-ember"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div className="panel">
            <h2 className="text-2xl">Recruiter Radar</h2>
            <div className="mt-4 space-y-4">
              {data?.recruiterLeads.map((lead) => (
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
                  <ul className="mt-3 space-y-2 text-sm text-ink/70">
                    {lead.recentPosts.map((post) => (
                      <li key={post}>{post}</li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </div>
  );
}
