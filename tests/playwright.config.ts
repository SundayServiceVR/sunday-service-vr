import { defineConfig } from "@playwright/test";
import { defineBddConfig } from "playwright-bdd";
import { WEBAPP_URL } from "./helpers/env";

const testDir = defineBddConfig({
  features: "e2e/features/*.feature",
  steps: ["e2e/fixtures.ts", "e2e/steps/*.ts"],
});

export default defineConfig({
  testDir,
  globalSetup: "./e2e/globalSetup.ts",
  // Tests share one emulator stack and run serially.
  workers: 1,
  fullyParallel: false,
  retries: 0,
  timeout: 60_000,
  expect: { timeout: 10_000 },
  reporter: [["list"]],
  use: {
    baseURL: WEBAPP_URL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { browserName: "chromium" } }],
});
