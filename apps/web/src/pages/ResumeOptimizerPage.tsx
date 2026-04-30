import { useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { useGenerateResume, useJobsQuery } from "../hooks/usePlatformData";

export function ResumeOptimizerPage() {
  const { data } = useJobsQuery();
  const [jobId, setJobId] = useState<string>(data?.[0]?._id ?? "job-1");
  const generateResume = useGenerateResume();

  return (
    <div>
      <SectionHeader
        eyebrow="Resume Optimizer"
        title="Generate ATS-focused LaTeX resumes per job description."
        description="This module adapts language, sequencing, and emphasis around the chosen role and exposes the raw LaTeX for further control."
      />

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="panel space-y-4">
          <label className="text-sm font-semibold text-ink/70">
            Target job
          </label>
          <select
            className="input"
            value={jobId}
            onChange={(event) => setJobId(event.target.value)}
          >
            {(data ?? []).map((job) => (
              <option key={job._id} value={job._id}>
                {job.title} - {job.company}
              </option>
            ))}
          </select>
          <button
            type="button"
            className="button-primary"
            onClick={() => generateResume.mutate(jobId)}
          >
            Generate Resume
          </button>
        </section>

        <section className="panel">
          <h2 className="text-2xl">LaTeX Output</h2>
          <pre className="mt-4 overflow-auto rounded-3xl bg-ink p-5 text-xs leading-6 text-white">
            {generateResume.data?.latex ??
              "Select a role and generate the tailored LaTeX resume here."}
          </pre>
          <div className="mt-4 space-y-2 text-sm text-ink/75">
            {generateResume.data?.atsSuggestions.map((suggestion) => (
              <p key={suggestion}>{suggestion}</p>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
