export default function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div className="flex items-baseline justify-between">
      <h3 className="text-sm font-medium text-white/90">{title}</h3>
      {subtitle && <p className="text-xs text-secondary-text">{subtitle}</p>}
    </div>
  );
}
