// frontend/src/lib/constants.js
// Delivery-day window covered by decisions made in January 2026 (decision day + 1).
export const DATA_MIN = "2026-01-02";
export const DATA_MAX = "2026-02-01";

export const PRESETS = [
  { label: "Full period", start: "2026-01-02", end: "2026-02-01" },
  { label: "Week 1", start: "2026-01-02", end: "2026-01-08" },
  { label: "Week 2", start: "2026-01-09", end: "2026-01-15" },
  { label: "Week 3", start: "2026-01-16", end: "2026-01-22" },
  { label: "Week 4", start: "2026-01-23", end: "2026-01-29" },
];

export const COLORS = {
  actual: "#0f766e",
  forecast: "#d97706",
  hourly: "#0369a1",
  horizon: "#7c3aed",
};