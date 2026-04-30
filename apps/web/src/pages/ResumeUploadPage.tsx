import { useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { useParseResume } from "../hooks/usePlatformData";

export function ResumeUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const parseResume = useParseResume();

  return (
    <div>
      <SectionHeader
        eyebrow="Resume Parsing"
        title="Convert a PDF or DOCX into a structured candidate profile."
        description="The parser extracts skills, education, projects, and experience so the matching engine can score jobs and tailor content automatically."
      />

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="panel">
          <label className="text-sm font-semibold text-ink/70">
            Resume file
          </label>
          <input
            className="input mt-3"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] ?? null)
            }
          />
          <button
            type="button"
            className="button-primary mt-4"
            disabled={!selectedFile || parseResume.isPending}
            onClick={() => {
              if (selectedFile) {
                parseResume.mutate(selectedFile);
              }
            }}
          >
            Parse Resume
          </button>
        </section>

        <section className="panel">
          <h2 className="text-2xl">Parsed Output</h2>
          <pre className="mt-4 overflow-auto rounded-3xl bg-ink p-5 text-xs leading-6 text-white">
            {JSON.stringify(
              parseResume.data ?? {
                message: "Upload a resume to preview parsed output.",
              },
              null,
              2,
            )}
          </pre>
        </section>
      </div>
    </div>
  );
}
