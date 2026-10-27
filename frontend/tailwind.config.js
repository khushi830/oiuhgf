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
        // Brand palette used across charts and accents (one place to re-theme).
        actual: "#0f766e",    // teal: what really happened
        forecast: "#d97706",  // amber: what we were told
      },
    },
  },
  plugins: [],
};