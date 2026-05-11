import { defineConfig } from "@playwright/test";

export default defineConfig({
  testDir: "./frontend/tests/e2e",
  timeout: 30_000,
  use: {
    headless: true,
    viewport: { width: 1280, height: 720 },
  },
});
