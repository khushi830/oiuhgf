// frontend/src/components/KpiCard.jsx
// One headline metric: big number, unit, and a plain-English explanation for non-analysts.
export default function KpiCard({ label, value, unit, hint, accent = "bg-teal-600" }) {
  return (
    <div className="relative overflow-hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <span className={`absolute inset-y-0 left-0 w-1 ${accent}`} aria-hidden />
      <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
      <p className="mt-1 text-3xl font-bold tabular-nums text-slate-900">
        {value}
        <span className="ml-1 text-sm font-medium text-slate-500">{unit}</span>
      </p>
      <p className="mt-1 text-xs leading-snug text-slate-500">{hint}</p>
    </div>
  );
}