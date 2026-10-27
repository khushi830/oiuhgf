// frontend/src/api.js
// The ONLY file that knows where the backend lives.
//
//   VITE_API_URL=http://localhost:8000          (local dev, see .env.example)
//   VITE_API_URL=https://<your-aws-backend>     (production, set in Vercel)
//   (empty)                                     (same origin: docker-compose, nginx proxies /api)
//
// Vite inlines this value at BUILD time.
const BASE = (import.meta.env.VITE_API_URL || "").replace(/\/+$/, "");

async function get(path, params = {}) {
  // Drop empty params so the backend applies its own defaults.
  const qs = new URLSearchParams(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== null && v !== "")
  ).toString();
  const res = await fetch(`${BASE}${path}${qs ? `?${qs}` : ""}`);
  if (!res.ok) {
    // Preserve the status so callers can tell "no data" (404) from a real failure.
    const err = new Error(`Request to ${path} failed (${res.status})`);
    err.status = res.status;
    throw err;
  }
  return res.json();
}

export const fetchSeries = (start, end) => get("/api/series", { start, end });
export const fetchMetrics = (start, end) => get("/api/metrics", { start, end });
export const fetchHorizon = () => get("/api/horizon");