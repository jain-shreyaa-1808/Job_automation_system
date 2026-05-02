import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import { useGenerateResume, useJobsQuery } from "../hooks/usePlatformData";
import { api } from "../lib/api";

export function ResumeOptimizerPage() {
  const { data: jobs, isLoading } = useJobsQuery();
  const [searchParams] = useSearchParams();
  const [search, setSearch] = useState("");
  const [jobId, setJobId] = useState<string>("");
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const generateResume = useGenerateResume();

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

  const selectedJob = jobs?.find((j) => j._id === jobId);

  const handleCopyLatex = () => {
    if (generateResume.data?.latex) {
      void navigator.clipboard.writeText(generateResume.data.latex);
    }
  };

  const handleDownloadPdf = async () => {
    const docId = generateResume.data?.documentId;
    if (!docId) return;
    const res = await api.get(`/resume/download/${docId}`, {
      responseType: "blob",
    });
    const url = URL.createObjectURL(res.data as Blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `resume-${selectedJob?.company ?? "tailored"}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Resume Optimizer"
        title="Apply-Ready Resume"
        description="Select a job and generate a polished one-page resume PDF that is ready to send."
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
              <p className="mt-2 text-xs leading-5 text-ink/50">
                {selectedJob.description}
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
            {generateResume.isPending
              ? "Preparing your resume…"
              : "Generate Resume PDF"}
          </button>
        </section>

        <section className="panel space-y-4">
          {generateResume.data ? (
            <>
              <div className="flex gap-2">
                <button
                  type="button"
                  className="button-primary flex-1"
                  onClick={handleDownloadPdf}
                >
                  ↓ Download PDF
                </button>
                <button
                  type="button"
                  className="button-secondary flex-1"
                  onClick={handleCopyLatex}
                >
                  Copy LaTeX
                </button>
              </div>

              <h2 className="text-lg font-semibold">LaTeX Output</h2>
              <pre className="max-h-[500px] overflow-auto whitespace-pre-wrap break-words rounded-3xl bg-ink p-5 text-xs leading-6 text-white">
                {generateResume.data.latex}
              </pre>
            </>
          ) : (
            <div className="flex h-64 items-center justify-center text-ink/40">
              Select a role and click &ldquo;Generate Resume PDF&rdquo; to
              prepare your application-ready resume.
            </div>
          )}
        </section>
      </div>
    </div>
  );
}
