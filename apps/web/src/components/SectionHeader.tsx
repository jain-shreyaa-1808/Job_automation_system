type SectionHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  actions?: React.ReactNode;
};

export function SectionHeader({
  eyebrow,
  title,
  description,
  actions,
}: SectionHeaderProps) {
  return (
    <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
      <div>
        <span className="pill mb-3">{eyebrow}</span>
        <h1 className="text-4xl leading-tight text-ink md:text-5xl">{title}</h1>
        <p className="mt-3 max-w-3xl text-sm leading-6 text-ink/70 md:text-base">
          {description}
        </p>
      </div>
      {actions ? (
        <div className="flex items-center gap-3">{actions}</div>
      ) : null}
    </div>
  );
}
