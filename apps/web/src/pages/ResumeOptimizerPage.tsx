import { useMemo, useRef, useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { useGenerateResume, useJobsQuery } from "../hooks/usePlatformData";

export function ResumeOptimizerPage() {
  const { data: jobs, isLoading } = useJobsQuery();
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const generateResume = useGenerateResume();

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

  const selectedJob = jobs?.find((j) => j._id === jobId);

  return (
    <div>
      <SectionHeader
        eyebrow="Resume Optimizer"
        title="Generate ATS-focused LaTeX resumes per job description."
        description="Pick a target role, then generate a tailored LaTeX resume with ATS optimisation tips."
      />

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="panel space-y-4">
          <label className="block text-sm font-semibold text-ink/70">
            Target job
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
                      <span className="ml-auto float-right text-xs text-moss">
                        {job.relevanceScore}%
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>

          {selectedJob && (
            <div className="rounded-2xl border border-ink/10 bg-skywash/40 p-4 text-sm">
              <p className="font-semibold">{selectedJob.title}</p>
              <p className="text-ink/60">
                {selectedJob.company} · {selectedJob.location}
              </p>
              <div className="mt-2 flex flex-wrap gap-1">
                {selectedJob.matchedSkills.map((s) => (
                  <span
                    key={s}
                    className="rounded-full bg-moss/10 px-2 py-0.5 text-xs text-moss"
                  >
                    {s}
                  </span>
                ))}
              </div>
            </div>
          )}

          <button
            type="button"
            className="button-primary w-full"
            disabled={!jobId || generateResume.isPending}
            onClick={() => generateResume.mutate(jobId)}
          >
            {generateResume.isPending ? "Generating…" : "Generate Resume"}
          </button>
        </section>

        <section className="panel">
          <h2 className="text-2xl">LaTeX Output</h2>
          <pre className="mt-4 max-h-[500px] overflow-auto rounded-3xl bg-ink p-5 text-xs leading-6 text-white">
            {generateResume.data?.latex ??
              "Select a role and generate the tailored LaTeX resume here."}
          </pre>

          {generateResume.data?.atsSuggestions &&
            generateResume.data.atsSuggestions.length > 0 && (
              <div className="mt-4">
                <h3 className="mb-2 text-sm font-semibold text-ink/70">
                  ATS Suggestions
                </h3>
                <ul className="list-inside list-disc space-y-1 text-sm text-ink/75">
                  {generateResume.data.atsSuggestions.map((s) => (
                    <li key={s}>{s}</li>
                  ))}
                </ul>
              </div>
            )}
        </section>
      </div>
    </div>
  );
}
