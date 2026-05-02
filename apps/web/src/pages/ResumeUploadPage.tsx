import { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { SectionHeader } from "../components/SectionHeader";
import { useParseResume, useTriggerJobFetch } from "../hooks/usePlatformData";
import { api } from "../lib/api";
import { persistQueryData, readPersistedQuery } from "../lib/queryPersistence";

type ResumeProfile = {
  hasResume: boolean;
  resumeFileName?: string;
  name?: string;
  skills?: string[];
  experience?: Array<{
    company?: string;
    title?: string;
    startDate?: string;
    endDate?: string;
    summary?: string;
  }>;
  projects?: Array<{
    name?: string;
    summary?: string;
    technologies?: string[];
  }>;
  education?: Array<{
    institution?: string;
    degree?: string;
    startDate?: string;
    endDate?: string;
  }>;
  certifications?: string[];
  resumeScore?: number;
  updatedAt?: string;
};

export function ResumeUploadPage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const parseResume = useParseResume();
  const triggerJobFetch = useTriggerJobFetch();

  const {
    data: existingResume,
    isLoading: loadingProfile,
    refetch,
  } = useQuery<ResumeProfile>({
    queryKey: ["resumeProfile"],
    queryFn: async () => {
      const res = await api.get("/resume/profile");
      persistQueryData("resumeProfile", res.data);
      return res.data;
    },
    initialData: () => readPersistedQuery<ResumeProfile>("resumeProfile"),
    staleTime: 5 * 60 * 1000,
    gcTime: 24 * 60 * 60 * 1000,
  });

  const handleUpload = () => {
    if (selectedFile) {
      parseResume.mutate(selectedFile, {
        onSuccess: () => {
          setSelectedFile(null);
          void refetch();
          // Auto-fetch jobs based on the new resume skills
          triggerJobFetch.mutate();
        },
      });
    }
  };

  return (
    <div>
      <SectionHeader
        eyebrow="Resume Management"
        title="Upload, view, or update your resume."
        description="Your resume is stored securely. The parser extracts skills, education, projects, and experience so the matching engine can score jobs and tailor content automatically."
      />

      <div className="grid gap-6 lg:grid-cols-[0.7fr_1.3fr]">
        <section className="panel space-y-4">
          {/* Show existing resume info */}
          {loadingProfile ? (
            <p className="text-sm text-ink/50">Loading resume status…</p>
          ) : existingResume?.hasResume ? (
            <div className="rounded-2xl border border-moss/20 bg-moss/5 p-4">
              <div className="flex items-center gap-2">
                <span className="text-lg">✓</span>
                <p className="font-semibold text-moss">Resume on file</p>
              </div>
              <p className="mt-2 text-sm text-ink/70">
                <span className="font-medium">
                  {existingResume.resumeFileName}
                </span>
              </p>
              {existingResume.updatedAt && (
                <p className="mt-1 text-xs text-ink/50">
                  Last updated:{" "}
                  {new Date(existingResume.updatedAt).toLocaleDateString(
                    "en-IN",
                    {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    },
                  )}
                </p>
              )}
              {existingResume.resumeScore != null && (
                <p className="mt-2 text-sm">
                  Resume Score:{" "}
                  <span className="font-bold text-moss">
                    {existingResume.resumeScore}%
                  </span>
                </p>
              )}
            </div>
          ) : (
            <div className="rounded-2xl border border-dashed border-ember/30 bg-ember/5 p-4 text-sm text-ember">
              No resume uploaded yet. Upload one below to get started.
            </div>
          )}

          <label className="text-sm font-semibold text-ink/70">
            {existingResume?.hasResume
              ? "Update resume (replaces existing)"
              : "Upload resume file"}
          </label>
          <input
            className="input"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) =>
              setSelectedFile(event.target.files?.[0] ?? null)
            }
          />
          <button
            type="button"
            className="button-primary w-full"
            disabled={!selectedFile || parseResume.isPending}
            onClick={handleUpload}
          >
            {parseResume.isPending
              ? "Processing…"
              : existingResume?.hasResume
                ? "Update Resume"
                : "Upload & Parse Resume"}
          </button>
          {parseResume.isSuccess && (
            <p className="text-center text-sm text-moss">
              Resume {existingResume?.hasResume ? "updated" : "uploaded"}{" "}
              successfully!
            </p>
          )}
        </section>

        <section className="panel">
          <h2 className="text-2xl">
            {parseResume.data ? "Parsed Output" : "Current Profile"}
          </h2>

          {parseResume.data ? (
            <pre className="mt-4 overflow-auto rounded-3xl bg-ink p-5 text-xs leading-6 text-white">
              {JSON.stringify(parseResume.data, null, 2)}
            </pre>
          ) : existingResume?.hasResume ? (
            <div className="mt-4 space-y-4 text-sm">
              <div>
                <h3 className="font-semibold text-ink/70">Skills</h3>
                <div className="mt-2 flex flex-wrap gap-1">
                  {existingResume.skills?.map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-skywash px-2 py-0.5 text-xs"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <h3 className="font-semibold text-ink/70">Experience</h3>
                {existingResume.experience?.map((e, i) => (
                  <div key={i} className="mt-2 border-l-2 border-moss/30 pl-3">
                    <p className="font-medium">
                      {e.title} @ {e.company}
                    </p>
                    <p className="text-xs text-ink/50">
                      {e.startDate} – {e.endDate ?? "Present"}
                    </p>
                    {e.summary && <p className="text-ink/70">{e.summary}</p>}
                  </div>
                ))}
              </div>
              <div>
                <h3 className="font-semibold text-ink/70">Projects</h3>
                {existingResume.projects?.map((p, i) => (
                  <div key={i} className="mt-2 border-l-2 border-sky-300 pl-3">
                    <p className="font-medium">{p.name}</p>
                    {p.summary && <p className="text-ink/70">{p.summary}</p>}
                    {p.technologies && p.technologies.length > 0 && (
                      <p className="text-xs text-ink/50">
                        Tech: {p.technologies.join(", ")}
                      </p>
                    )}
                  </div>
                ))}
              </div>
              {existingResume.certifications &&
                existingResume.certifications.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-ink/70">
                      Certifications
                    </h3>
                    <p className="mt-1">
                      {existingResume.certifications.join(", ")}
                    </p>
                  </div>
                )}
            </div>
          ) : (
            <pre className="mt-4 overflow-auto rounded-3xl bg-ink p-5 text-xs leading-6 text-white">
              {JSON.stringify(
                { message: "Upload a resume to preview parsed output." },
                null,
                2,
              )}
            </pre>
          )}
        </section>
      </div>
    </div>
  );
}
