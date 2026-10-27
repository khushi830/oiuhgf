// frontend/src/lib/format.js
// Number and date helpers shared by every component.

export const fmtNum = (n, digits = 0) =>
  n === null || n === undefined || Number.isNaN(n)
    ? "-"
    : n.toLocaleString("en-GB", { maximumFractionDigits: digits });

// Signed number, e.g. +120 / -80 (used for bias).
export const fmtSigned = (n, digits = 0) =>
  n === null || n === undefined ? "-" : `${n > 0 ? "+" : ""}${fmtNum(n, digits)}`;

export const fmtDate = (ms) =>
  new Date(ms).toLocaleDateString("en-GB", { day: "2-digit", month: "short", timeZone: "UTC" });

export const fmtDateTime = (ms) =>
  new Date(ms).toLocaleString("en-GB", {
    day: "2-digit", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "UTC",
  }) + " UTC";