import { useEffect, useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { useUpdateSettings } from "../hooks/usePlatformData";
import { api } from "../lib/api";

export function SettingsPage() {
  const [form, setForm] = useState({
    linkedinUrl: "",
    currentCtc: "",
    expectedCtc: "",
    preferredRoles: "",
    preferredLocations: "",
    autoApplyEnabled: false,
  });
  const [loaded, setLoaded] = useState(false);
  const updateSettings = useUpdateSettings();

  useEffect(() => {
    api.get("/auth/me").then((res) => {
      const u = res.data.user;
      setForm({
        linkedinUrl: u.linkedinUrl ?? "",
        currentCtc: u.currentCtc ? String(u.currentCtc) : "",
        expectedCtc: u.expectedCtc ? String(u.expectedCtc) : "",
        preferredRoles: (u.preferredRoles ?? []).join(", "),
        preferredLocations: (u.preferredLocations ?? []).join(", "),
        autoApplyEnabled: u.autoApplyEnabled ?? false,
      });
      setLoaded(true);
    });
  }, []);

  return (
    <div>
      <SectionHeader
        eyebrow="Preferences"
        title="Control compensation targets, roles, locations, and automation."
        description="Credential vault entries remain encrypted on the backend. This page focuses on search constraints and auto-apply consent."
      />

      <form
        className="panel grid gap-4 md:grid-cols-2"
        onSubmit={(event) => {
          event.preventDefault();
          updateSettings.mutate({
            linkedinUrl: form.linkedinUrl.trim(),
            currentCtc: form.currentCtc ? Number(form.currentCtc) : 0,
            expectedCtc: form.expectedCtc ? Number(form.expectedCtc) : 0,
            preferredRoles: form.preferredRoles
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            preferredLocations: form.preferredLocations
              .split(",")
              .map((value) => value.trim())
              .filter(Boolean),
            autoApplyEnabled: form.autoApplyEnabled,
          });
        }}
      >
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 md:col-span-2">
          <h2 className="text-lg font-semibold text-ink">
            LinkedIn Connection
          </h2>
          <p className="mt-2 text-sm text-ink/70">
            Save your LinkedIn profile URL here so the platform can keep your
            outreach identity on file. Direct syncing of first-degree recruiter
            connections requires a LinkedIn-approved OAuth/API integration,
            which is not available in this repo yet.
          </p>
        </div>
        <label className="md:col-span-2">
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            LinkedIn Profile URL
          </span>
          <input
            className="input"
            type="url"
            placeholder="https://linkedin.com/in/yourprofile"
            value={form.linkedinUrl}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                linkedinUrl: event.target.value,
              }))
            }
          />
          <span className="mt-1 block text-xs text-ink/40">
            This stores your profile link. First-connection recruiter sync is
            not yet automated here.
          </span>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            Current CTC
          </span>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 800000"
            value={form.currentCtc}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currentCtc: event.target.value.replace(/[^0-9]/g, ""),
              }))
            }
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            Expected CTC
          </span>
          <input
            className="input"
            type="text"
            inputMode="numeric"
            placeholder="e.g. 1200000"
            value={form.expectedCtc}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                expectedCtc: event.target.value.replace(/[^0-9]/g, ""),
              }))
            }
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            Preferred Roles
          </span>
          <input
            className="input"
            placeholder="e.g. Frontend Developer, Full Stack Engineer"
            value={form.preferredRoles}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredRoles: event.target.value,
              }))
            }
          />
          <span className="mt-1 block text-xs text-ink/40">
            Comma-separated
          </span>
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            Preferred Locations
          </span>
          <input
            className="input"
            placeholder="e.g. Bangalore, Remote, Hyderabad"
            value={form.preferredLocations}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredLocations: event.target.value,
              }))
            }
          />
          <span className="mt-1 block text-xs text-ink/40">
            Comma-separated
          </span>
        </label>
        <label className="flex items-center gap-3 md:col-span-2">
          <input
            type="checkbox"
            checked={form.autoApplyEnabled}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                autoApplyEnabled: event.target.checked,
              }))
            }
          />
          <span className="text-sm text-ink/70">
            Enable auto-apply after manual review rules are satisfied.
          </span>
        </label>
        <div className="md:col-span-2 flex items-center gap-4">
          <button
            type="submit"
            className="button-primary"
            disabled={updateSettings.isPending}
          >
            {updateSettings.isPending ? "Saving…" : "Save Settings"}
          </button>
          {updateSettings.isSuccess && (
            <span className="text-sm font-medium text-moss">✓ Saved</span>
          )}
        </div>
      </form>
    </div>
  );
}
