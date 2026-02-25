// ─────────────────────────────────────────────────────────
//  vite.config.js
//
//  The proxy section is important!
//  Without it, /api and /auth requests from React would fail
//  because React runs on port 5173 and the backend is on 5000.
//  The proxy silently forwards them to the backend.
// ─────────────────────────────────────────────────────────

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      // Any request to /api/... gets sent to http://localhost:5000/api/...
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
      // Any request to /auth/... gets sent to http://localhost:5000/auth/...
      "/auth": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});
