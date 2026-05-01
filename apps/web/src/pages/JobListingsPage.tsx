import { useState } from "react";

import { JobCard } from "../components/JobCard";
import { SectionHeader } from "../components/SectionHeader";
import { useJobsQuery, useValidateJobLinks } from "../hooks/usePlatformData";

const filters = [
  "all",
  "new",
  "applied",
  "in-progress",
  "finished",
  "bookmarked",
] as const;

export function JobListingsPage() {
  const [status, setStatus] = useState<string | undefined>(undefined);
  const { data } = useJobsQuery(status);
  const validateLinks = useValidateJobLinks();

  return (
    <div>
      <SectionHeader
        eyebrow="Job Pipeline"
        title="Inspect ranked roles across your target portals."
        description="Only jobs with active, verified links are shown. Invalid or expired postings are filtered out automatically."
      />

      <div className="mb-6 flex flex-wrap items-center gap-2">
        {filters.map((filter) => (
          <button
            key={filter}
            type="button"
            className={
              filter === (status ?? "all")
                ? "button-primary"
                : "button-secondary"
            }
            onClick={() => setStatus(filter === "all" ? undefined : filter)}
          >
            {filter}
          </button>
        ))}
        <button
          type="button"
          className="button-secondary ml-auto text-sm"
          disabled={validateLinks.isPending}
          onClick={() => validateLinks.mutate()}
        >
          {validateLinks.isPending ? "Validating links…" : "🔗 Validate Links"}
        </button>
        {validateLinks.isSuccess && (
          <span className="text-xs text-moss">
            ✓ {validateLinks.data.valid} valid, {validateLinks.data.invalid}{" "}
            invalid removed
          </span>
        )}
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {data?.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
