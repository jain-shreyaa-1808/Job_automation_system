import { useState } from "react";
import { useSearchParams } from "react-router-dom";

import { SectionHeader } from "../components/SectionHeader";
import {
  useAutoApply,
  useConfirmApplication,
  useJobsQuery,
} from "../hooks/usePlatformData";

type PreFilledData = {
  fullName: string;
  email: string;
  phone: string;
  location: string;
  currentTitle: string;
  currentCompany: string;
  totalExperience: string;
  skills: string[];
  linkedinUrl: string;
  portfolioUrl: string;
  githubUrl: string;
  jobTitle: string;
  company: string;
  jobLink: string;
  noticePeriod: string;
  expectedCtc: string;
  currentCtc: string;
  willingToRelocate: boolean | null;
  coverNote: string;
  resumeFileName: string;
  hasResume: boolean;
};

export function AutoApplyPage() {
  const [searchParams] = useSearchParams();
  const jobId = searchParams.get("jobId") ?? "";
  const { data: jobs } = useJobsQuery();
  const job = jobs?.find((j) => j._id === jobId);

  const autoApply = useAutoApply();
  const confirmApp = useConfirmApplication();

  const [preFilledData, setPreFilledData] = useState<PreFilledData | null>(
    null,
  );
  const [editableData, setEditableData] = useState<PreFilledData | null>(null);
  const [confirmed, setConfirmed] = useState(false);

  const handleQueueApplication = () => {
    if (!jobId) return;
    autoApply.mutate(jobId, {
      onSuccess: (data: any) => {
        if (data.preFilledData) {
          setPreFilledData(data.preFilledData);
          setEditableData({ ...data.preFilledData });
        }
      },
    });
  };

  const handleConfirm = () => {
    if (!editableData || !jobId) return;
    confirmApp.mutate(
      { jobId, applicationData: editableData },
      {
        onSuccess: () => {
          setConfirmed(true);
        },
      },
    );
  };

  const updateField = (field: keyof PreFilledData, value: string | boolean) => {
    if (!editableData) return;
    setEditableData({ ...editableData, [field]: value });
  };

  if (!jobId || !job) {
    return (
      <div className="panel">
        <p className="text-ink/60">
          No job selected. Go to a job listing and click "Queue Auto Apply" to
          get started.
        </p>
      </div>
    );
  }

  return (
    <div>
      <SectionHeader
        eyebrow="Auto Apply"
        title={`Apply to ${job.title} at ${job.company}`}
        description="We pre-fill your application details from your profile. Review, edit if needed, then confirm to submit."
      />

      {confirmed ? (
        <div className="panel">
          <div className="text-center space-y-4 py-8">
            <div className="text-4xl">✓</div>
            <h2 className="text-2xl font-semibold text-moss">
              Application Submitted!
            </h2>
            <p className="text-ink/70">
              Your application for {job.title} at {job.company} has been
              confirmed and queued for processing.
            </p>
            <a
              href={job.link}
              target="_blank"
              rel="noreferrer"
              className="button-primary inline-block mt-4"
            >
              View Job Posting ↗
            </a>
          </div>
        </div>
      ) : !preFilledData ? (
        <div className="panel space-y-4">
          <div className="rounded-2xl border border-ink/10 bg-skywash/40 p-5">
            <h3 className="font-semibold text-lg">{job.title}</h3>
            <p className="text-ink/60">
              {job.company} · {job.location}
            </p>
            <p className="mt-3 text-sm text-ink/70 line-clamp-3">
              {job.description}
            </p>
          </div>
          <p className="text-sm text-ink/60">
            Click below to auto-fill your application form from your profile.
            You'll get a chance to review and edit everything before submitting.
          </p>
          <button
            type="button"
            className="button-primary w-full"
            disabled={autoApply.isPending}
            onClick={handleQueueApplication}
          >
            {autoApply.isPending
              ? "Preparing application…"
              : "Fill Application Form"}
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          <div className="panel">
            <div className="flex items-center gap-3 mb-4">
              <span className="rounded-full bg-sky-100 px-3 py-1 text-xs font-semibold text-sky-700">
                Pre-filled from your profile
              </span>
              <p className="text-sm text-ink/60">
                Review and edit any fields before confirming.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Full Name
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.fullName ?? ""}
                  onChange={(e) => updateField("fullName", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Email
                </label>
                <input
                  className="input mt-1"
                  type="email"
                  value={editableData?.email ?? ""}
                  onChange={(e) => updateField("email", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Phone
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.phone ?? ""}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="e.g. +91 98765 43210"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Location
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.location ?? ""}
                  onChange={(e) => updateField("location", e.target.value)}
                  placeholder="e.g. Bengaluru, India"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Current Title
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.currentTitle ?? ""}
                  onChange={(e) => updateField("currentTitle", e.target.value)}
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Current Company
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.currentCompany ?? ""}
                  onChange={(e) =>
                    updateField("currentCompany", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Total Experience
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.totalExperience ?? ""}
                  onChange={(e) =>
                    updateField("totalExperience", e.target.value)
                  }
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Notice Period
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.noticePeriod ?? ""}
                  onChange={(e) => updateField("noticePeriod", e.target.value)}
                  placeholder="e.g. Immediate, 30 days, 60 days"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Current CTC
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.currentCtc ?? ""}
                  onChange={(e) => updateField("currentCtc", e.target.value)}
                  placeholder="e.g. 8 LPA"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  Expected CTC
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.expectedCtc ?? ""}
                  onChange={(e) => updateField("expectedCtc", e.target.value)}
                  placeholder="e.g. 12 LPA"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  LinkedIn URL
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.linkedinUrl ?? ""}
                  onChange={(e) => updateField("linkedinUrl", e.target.value)}
                  placeholder="https://linkedin.com/in/yourprofile"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-ink/60">
                  GitHub URL
                </label>
                <input
                  className="input mt-1"
                  value={editableData?.githubUrl ?? ""}
                  onChange={(e) => updateField("githubUrl", e.target.value)}
                  placeholder="https://github.com/yourusername"
                />
              </div>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-ink/60">
                Skills
              </label>
              <p className="mt-1 text-sm text-ink/70">
                {editableData?.skills?.join(", ") ?? "No skills detected"}
              </p>
            </div>

            <div className="mt-4">
              <label className="text-xs font-semibold text-ink/60">
                Cover Note
              </label>
              <textarea
                className="input mt-1 min-h-[100px]"
                value={editableData?.coverNote ?? ""}
                onChange={(e) => updateField("coverNote", e.target.value)}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 text-sm">
              <span className="text-ink/60">Resume:</span>
              {editableData?.hasResume ? (
                <span className="font-medium text-moss">
                  ✓ {editableData.resumeFileName}
                </span>
              ) : (
                <span className="text-ember">
                  ⚠ No resume uploaded — upload one first
                </span>
              )}
            </div>
          </div>

          <div className="panel">
            <h3 className="font-semibold text-lg mb-3">Applying for</h3>
            <div className="rounded-2xl bg-skywash/40 p-4">
              <p className="font-medium">{editableData?.jobTitle}</p>
              <p className="text-sm text-ink/60">{editableData?.company}</p>
              <a
                href={editableData?.jobLink}
                target="_blank"
                rel="noreferrer"
                className="mt-2 text-xs text-sky-600 hover:underline"
              >
                {editableData?.jobLink}
              </a>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                className="button-primary flex-1"
                disabled={confirmApp.isPending}
                onClick={handleConfirm}
              >
                {confirmApp.isPending
                  ? "Submitting…"
                  : "✓ Confirm & Submit Application"}
              </button>
              <button
                type="button"
                className="button-secondary"
                onClick={() => {
                  setPreFilledData(null);
                  setEditableData(null);
                }}
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
