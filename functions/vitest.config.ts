import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    include: ["test/**/*.test.ts"],
    environment: "node",
    globalSetup: ["./test/globalSetup.ts"],
    testTimeout: 30_000,
    // One worker: tests share one emulator set and run serially.
    fileParallelism: false,
  },
});
