// frontend/tailwind.config.js
/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "-apple-system", "Segoe UI", "Roboto", "sans-serif"],
      },
      colors: {
        canvas: "var(--color-canvas)",
        surface: "var(--color-surface)",
        ink: "var(--color-ink)",
        muted: "var(--color-muted)",
        border: "var(--color-border)",
        "border-strong": "var(--color-border-strong)",
        primary: "var(--color-primary)",
        "primary-soft": "var(--color-primary-soft)",
        "primary-ink": "var(--color-primary-ink)",
        danger: "var(--color-danger)",
        "danger-soft": "var(--color-danger-soft)",
        warning: "var(--color-warning)",
        "warning-soft": "var(--color-warning-soft)",
        actual: "var(--chart-actual)",
        forecast: "var(--chart-forecast)",
        hourly: "var(--chart-hourly)",
        horizon: "var(--chart-horizon)",
      },
      borderRadius: {
        panel: "4px",
        control: "3px",
      },
      boxShadow: {
        panel: "var(--shadow-panel)",
      },
    },
  },
  plugins: [],
};