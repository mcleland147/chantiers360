import { defineConfig, devices } from "@playwright/test";

/**
 * Configuration Playwright — recette MOA assistée (stack réelle).
 * Prérequis : PostgreSQL seedé + backend sur :3000 (voir scripts/run-recette.sh).
 */
export default defineConfig({
  testDir: "./tests/recette",
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  timeout: 60_000,
  reporter: [
    ["list"],
    ["html", { open: "never", outputFolder: "playwright-report-recette" }],
    ["json", { outputFile: "recette-results.json" }],
  ],
  use: {
    baseURL: process.env.RECETTE_BASE_URL ?? "http://localhost:5173",
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: "npm run dev",
    cwd: "../frontend",
    url: "http://localhost:5173",
    reuseExistingServer: true,
    timeout: 120_000,
  },
});
