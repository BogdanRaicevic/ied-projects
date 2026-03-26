import path from "node:path";
import { defineConfig, searchForWorkspaceRoot } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [],
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
});
