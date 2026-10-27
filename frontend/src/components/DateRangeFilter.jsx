// frontend/src/components/DateRangeFilter.jsx
import { DATA_MIN, DATA_MAX, PRESETS } from "../lib/constants";

// Date pickers (clamped to the January-decision window) plus one-click presets.
export default function DateRangeFilter({ range, onChange }) {
  const active = (p) => p.start === range.start && p.end === range.end;

  // Keep the range valid: if start moves past end (or vice versa) pull the other one along.
  const setStart = (start) => onChange({ start, end: start > range.end ? start : range.end });
  const setEnd = (end) => onChange({ start: end < range.start ? end : range.start, end });

  const input =
    "rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-sm shadow-sm " +
    "focus:border-teal-600 focus:outline-none focus:ring-2 focus:ring-teal-600/20";

  return (
    <div className="flex flex-wrap items-end gap-4 rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <label className="text-xs font-medium text-slate-500">
        Delivery from
        <input type="date" className={`${input} mt-1 block`} value={range.start}
          min={DATA_MIN} max={DATA_MAX} onChange={(e) => e.target.value && setStart(e.target.value)} />
      </label>
      <label className="text-xs font-medium text-slate-500">
        to
        <input type="date" className={`${input} mt-1 block`} value={range.end}
          min={DATA_MIN} max={DATA_MAX} onChange={(e) => e.target.value && setEnd(e.target.value)} />
      </label>
      <div className="flex flex-wrap gap-2">
        {PRESETS.map((p) => (
          <button key={p.label} type="button" onClick={() => onChange({ start: p.start, end: p.end })}
            className={`rounded-full px-3 py-1.5 text-sm font-medium transition ${
              active(p) ? "bg-teal-700 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}>
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}