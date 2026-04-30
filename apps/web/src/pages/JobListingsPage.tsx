import { useState } from "react";

import { JobCard } from "../components/JobCard";
import { SectionHeader } from "../components/SectionHeader";
import { useJobsQuery } from "../hooks/usePlatformData";

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

  return (
    <div>
      <SectionHeader
        eyebrow="Job Pipeline"
        title="Inspect ranked roles across your target portals."
        description="Every job carries match quality, missing skills, source metadata, and its current workflow stage."
      />

      <div className="mb-6 flex flex-wrap gap-2">
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
      </div>

      <div className="grid gap-5 xl:grid-cols-2">
        {data?.map((job) => (
          <JobCard key={job._id} job={job} />
        ))}
      </div>
    </div>
  );
}
