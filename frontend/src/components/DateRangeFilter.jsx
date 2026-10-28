// frontend/src/components/DateRangeFilter.jsx
import { DATA_MIN, DATA_MAX, PRESETS } from "../lib/constants";

// Date pickers (clamped to the January-decision window) plus one-click presets.
export default function DateRangeFilter({ range, onChange }) {
  const active = (p) => p.start === range.start && p.end === range.end;

  // Keep the range valid: if start moves past end (or vice versa) pull the other one along.
  const setStart = (start) => onChange({ start, end: start > range.end ? start : range.end });
  const setEnd = (end) => onChange({ start: end < range.start ? end : range.start, end });

  const input =
    "rounded-control border border-border-strong bg-surface px-3 py-1.5 text-sm text-ink shadow-panel " +
    "focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary";

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-panel border border-border bg-surface p-4 shadow-panel">
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        Delivery from
        <input type="date" className={`${input} mt-1 block`} value={range.start}
          min={DATA_MIN} max={DATA_MAX} onChange={(e) => e.target.value && setStart(e.target.value)} />
      </label>
      <label className="text-xs font-semibold uppercase tracking-[0.08em] text-muted">
        Delivery to
        <input type="date" className={`${input} mt-1 block`} value={range.end}
          min={DATA_MIN} max={DATA_MAX} onChange={(e) => e.target.value && setEnd(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => onChange({ start: p.start, end: p.end })}
            aria-pressed={active(p)}
            className={`rounded-control border px-3 py-1.5 text-sm font-medium transition-colors ${
              active(p)
                ? "border-primary bg-primary text-primary-ink"
                : "border-border bg-canvas text-ink hover:border-border-strong hover:bg-primary-soft"}`}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}