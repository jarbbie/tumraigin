import { defineConfig } from "@playwright/test";

const basePath = "/tumraigin";
const port = 4174;
const baseURL = `http://127.0.0.1:${port}${basePath}/`;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: false,
  reporter: "list",
  retries: 0,
  use: {
    baseURL,
    browserName: "chromium",
    headless: true,
    trace: "retain-on-failure",
  },
  webServer: {
    command: "pnpm build && pnpm start",
    url: baseURL,
    env: {
      GITHUB_PAGES_BASE_PATH: basePath,
      PORT: String(port),
    },
    reuseExistingServer: false,
    timeout: 180_000,
    stdout: "ignore",
  },
});
