import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./tests/e2e",
  use: {
    baseURL: "http://localhost:5001",
    headless: true,
  },
  webServer: {
    command: "npm run preview",
    url: "http://localhost:5001",
    reuseExistingServer: true,
    timeout: 30000,
  },
});
