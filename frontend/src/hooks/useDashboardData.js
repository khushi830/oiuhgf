// frontend/src/hooks/useDashboardData.js
import { useEffect, useState } from "react";
import { fetchSeries, fetchMetrics, fetchHorizon } from "../api";

/**
 * All data fetching for the dashboard lives in this hook, so components stay purely visual.
 *  - series + metrics re-load whenever the date range changes
 *  - horizon analysis does not depend on the range, so it loads once
 */
export function useDashboardData(range) {
  const [state, setState] = useState({
    series: [], summary: null, byHour: [], cutoffHour: 9, status: "loading", error: null,
  });
  const [horizon, setHorizon] = useState([]);

  useEffect(() => {
    fetchHorizon().then(setHorizon).catch(() => setHorizon([]));
  }, []);

  useEffect(() => {
    let cancelled = false; // ignore responses from outdated requests (fast date changes)
    setState((s) => ({ ...s, status: "loading", error: null }));

    Promise.all([fetchSeries(range.start, range.end), fetchMetrics(range.start, range.end).catch((e) => {
      if (e.status === 404) return null; // empty range is not an error, just "no data"
      throw e;
    })])
      .then(([s, m]) => {
        if (cancelled) return;
        setState({
          // Convert ISO strings to epoch ms once, so the chart can use a real time axis.
          series: s.data.map((d) => ({ ...d, ts: Date.parse(d.t) })),
          summary: m?.summary ?? null,
          byHour: m?.by_hour ?? [],
          cutoffHour: s.cutoff_hour_utc,
          status: s.data.length ? "ready" : "empty",
          error: null,
        });
      })
      .catch((error) => !cancelled && setState((s) => ({ ...s, status: "error", error })));

    return () => { cancelled = true; };
  }, [range.start, range.end]);

  return { ...state, horizon };
}