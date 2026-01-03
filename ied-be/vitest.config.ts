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
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      enabled: true,
    },
  },
});
