import path from "node:path";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    setupFiles: ["./tests/setup.ts"],
    include: ["tests/**/*.test.ts"],
    testTimeout: 30000, // 30s for mongodb-memory-server startup
    hookTimeout: 30000,
    pool: "forks", // Better isolation for database tests
    poolOptions: {
      forks: {
        singleFork: true, // Run tests sequentially to avoid DB conflicts
      },
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      enabled: true,
    },
  },

  resolve: {
    alias: {
      "@ied-shared": path.resolve(__dirname, "../ied-shared/dist"),
    },
  },
});
