import path from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig, searchForWorkspaceRoot } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    target: "esnext",
  },
  server: {
    // preview binds to localhost behind nginx, so the host check adds nothing; domains live in nginx config
    allowedHosts: true,
    fs: {
      allow: [
        path.resolve(import.meta.dirname),
        searchForWorkspaceRoot(process.cwd()),
      ],
    },
  },
});
