import { useState } from "react";

import { SectionHeader } from "../components/SectionHeader";
import { useUpdateSettings } from "../hooks/usePlatformData";

export function SettingsPage() {
  const [form, setForm] = useState({
    currentCtc: 8,
    expectedCtc: 12,
    preferredRoles: "Software Engineer,Wireless TAC Engineer",
    preferredLocations: "Bengaluru,Remote",
    autoApplyEnabled: false,
  });
  const updateSettings = useUpdateSettings();

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
            currentCtc: form.currentCtc,
            expectedCtc: form.expectedCtc,
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
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            Current CTC
          </span>
          <input
            className="input"
            type="number"
            value={form.currentCtc}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                currentCtc: Number(event.target.value),
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
            type="number"
            value={form.expectedCtc}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                expectedCtc: Number(event.target.value),
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
            value={form.preferredRoles}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredRoles: event.target.value,
              }))
            }
          />
        </label>
        <label>
          <span className="mb-2 block text-sm font-semibold text-ink/70">
            Preferred Locations
          </span>
          <input
            className="input"
            value={form.preferredLocations}
            onChange={(event) =>
              setForm((current) => ({
                ...current,
                preferredLocations: event.target.value,
              }))
            }
          />
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
        <div className="md:col-span-2">
          <button type="submit" className="button-primary">
            Save Settings
          </button>
        </div>
      </form>
    </div>
  );
}
