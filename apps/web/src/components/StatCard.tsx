type StatCardProps = {
  label: string;
  value: string;
  helper: string;
};

export function StatCard({ label, value, helper }: StatCardProps) {
  return (
    <div className="panel">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-ink/50">
        {label}
      </p>
      <p className="mt-4 text-4xl font-display">{value}</p>
      <p className="mt-2 text-sm text-ink/65">{helper}</p>
    </div>
  );
}
