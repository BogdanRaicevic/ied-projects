import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import { dependencies } from "./package.json";

function renderChunks(deps: Record<string, string>) {
  const chunks: Record<string, string[]> = {}; // Add index signature to allow indexing with a string key
  Object.keys(deps).forEach((key) => {
    if (["react", "react-router-dom", "react-dom"].includes(key)) return;
    chunks[key] = [key];
  });
  return chunks;
}

// https://vitejs.dev/config/
export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-router-dom", "react-dom"],
          ...renderChunks(dependencies),
        },
      },
    },
  },
});
