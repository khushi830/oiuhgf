// frontend/vite.config.js
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The API location is NOT configured here. It comes from VITE_API_URL (see src/api.js and
// .env.example), so the same build works against localhost, docker-compose, or AWS.
export default defineConfig({
  plugins: [react()],
  server: { port: 5173 },
});