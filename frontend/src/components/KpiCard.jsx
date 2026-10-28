// frontend/src/components/KpiCard.jsx
// One headline metric: big number, unit, and a plain-English explanation for non-analysts.
export default function KpiCard({ label, value, unit, hint, accent = "bg-primary" }) {
  return (
    <div className="relative overflow-hidden rounded-panel border border-border bg-surface p-4 shadow-panel">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} aria-hidden="true" />
      <p className="text-xs font-semibold uppercase tracking-[0.12em] text-muted">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums tracking-tight text-ink">
        {value}
        <span className="ml-1 text-sm font-medium text-muted">{unit}</span>
      </p>
      <p className="mt-1 text-xs leading-snug text-muted">{hint}</p>
    </div>
  );
}