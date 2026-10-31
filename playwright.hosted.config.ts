import { defineConfig } from "@playwright/test";

const configuredUrl = process.env.PLAYWRIGHT_HOSTED_URL;
if (!configuredUrl) {
  throw new Error("Set PLAYWRIGHT_HOSTED_URL to the public Site URL before running the hosted smoke test.");
}

const baseURL = configuredUrl.endsWith("/") ? configuredUrl : `${configuredUrl}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "hosted-planning.spec.ts",
  fullyParallel: false,
  reporter: "list",
  retries: 0,
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
});
