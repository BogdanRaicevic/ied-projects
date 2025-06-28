import path from "node:path";
import react from "@vitejs/plugin-react-swc";
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
    allowedHosts: ["ied-baza.xyz", "bs-baza.xyz"],
    fs: {
      allow: [path.resolve(__dirname), searchForWorkspaceRoot(process.cwd())],
    },
  },
  resolve: {
    alias: {
      "@ied-shared": path.resolve(__dirname, "../ied-shared/src"),
    },
  },
});
