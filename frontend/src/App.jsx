// frontend/src/App.jsx
import { useState } from "react";
import { useDashboardData } from "./hooks/useDashboardData";
import { DATA_MIN, DATA_MAX } from "./lib/constants";
import { fmtNum, fmtSigned } from "./lib/format";
import Card from "./components/Card";
import KpiCard from "./components/KpiCard";
import DateRangeFilter from "./components/DateRangeFilter";
import ForecastChart from "./components/ForecastChart";
import HourlyErrorChart from "./components/HourlyErrorChart";
import HorizonChart from "./components/HorizonChart";

// One-sentence takeaway so the buyer does not have to interpret the numbers.
function Takeaway({ s }) {
  const direction = s.bias > 0 ? "over-forecast" : "under-forecast";
  return (
    <div className="rounded-2xl border border-teal-200 bg-teal-50 p-4 text-sm leading-relaxed text-teal-900">
      <strong>Buyer takeaway:</strong> over this period the day-ahead wind forecast was off by{" "}
      <strong>{fmtNum(s.mae)} MW</strong> on average ({fmtNum(s.nmae, 1)}% of average wind output) and
      tended to <strong>{direction}</strong> by {fmtNum(Math.abs(s.bias))} MW. One half-hour in twenty was
      missed by more than <strong>{fmtNum(s.p95_abs_error)} MW</strong>: consider holding that much
      flexible capacity or a hedge in reserve.
    </div>
  );
}

export default function App() {
  const [range, setRange] = useState({ start: DATA_MIN, end: DATA_MAX });
  const { series, summary, byHour, horizon, cutoffHour, status, error } = useDashboardData(range);
  const cutoff = `${String(cutoffHour).padStart(2, "0")}:00`;

  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-gradient-to-r from-teal-800 to-sky-800 text-white">
        <div className="mx-auto max-w-7xl px-4 py-8">
          <p className="text-xs font-semibold uppercase tracking-widest text-teal-200">
            Day-ahead purchasing
          </p>
          <h1 className="mt-1 text-3xl font-bold">Wind Forecast Monitor</h1>
          <p className="mt-2 max-w-3xl text-sm text-teal-50/90">
            How much wind will there be tomorrow, and how far can you trust the forecast? Each point
            uses the latest forecast available at <strong>{cutoff} UTC on the day before delivery</strong>,
            which is what you could see when placing the trade.
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-7xl space-y-6 px-4 py-6">
        <DateRangeFilter range={range} onChange={setRange} />

        {status === "error" && (
          <div role="alert" className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
            Could not load data from the API ({error?.message}). Check that the backend is running and
            that VITE_API_URL points to it.
          </div>
        )}

        {status === "empty" && (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            No data for the selected dates.
          </div>
        )}

        {status === "loading" && (
          <p className="animate-pulse text-sm text-slate-500">Loading latest data...</p>
        )}

        {summary && (
          <>
            <Takeaway s={summary} />
            <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-5" aria-label="Accuracy metrics">
              <KpiCard label="MAE" value={fmtNum(summary.mae)} unit="MW" accent="bg-teal-600"
                hint="Average size of the miss. The 'typical' forecast error." />
              <KpiCard label="RMSE" value={fmtNum(summary.rmse)} unit="MW" accent="bg-sky-600"
                hint="Like MAE but punishes big misses harder. Higher than MAE means occasional large errors." />
              <KpiCard label="Bias" value={fmtSigned(summary.bias)} unit="MW" accent="bg-amber-500"
                hint="Positive: forecast tends to be too high (you may under-buy). Negative: too low." />
              <KpiCard label="nMAE" value={fmtNum(summary.nmae, 1)} unit="%" accent="bg-violet-600"
                hint="Average error as a share of average wind output. Lets you compare periods fairly." />
              <KpiCard label="95th pct error" value={fmtNum(summary.p95_abs_error)} unit="MW" accent="bg-rose-500"
                hint="19 times in 20 the miss is smaller than this. A sensible buffer to plan for." />
            </section>
          </>
        )}

        <Card title="Actual vs day-ahead forecast"
          subtitle="Half-hourly national wind generation in MW. Drag the handles below the chart to zoom.">
          {series.length ? <ForecastChart data={series} /> : <p className="py-16 text-center text-slate-400">No data</p>}
        </Card>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <Card title="Error by hour of day"
            subtitle="Which delivery hours are hardest to forecast? Taller bars = riskier hours to buy.">
            <HourlyErrorChart data={byHour} />
          </Card>
          <Card title="Error by forecast lead time"
            subtitle="Forecasts get better closer to delivery. Across all January forecasts, hours before the target half-hour.">
            <HorizonChart data={horizon} />
          </Card>
        </div>

        <footer className="pt-4 text-xs text-slate-400">
          Data: Elexon BMRS (FUELHH actual wind outturn, WINDFOR wind forecasts). Scope: purchase
          decisions made in January 2026. Error = forecast minus actual.
        </footer>
      </main>
    </div>
  );
}