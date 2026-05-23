import { defineConfig } from 'playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 30_000,
  use: {
    headless: true,
    launchOptions: {
      executablePath:
        process.env.PLAYWRIGHT_CHROME_EXECUTABLE ?? '/usr/bin/google-chrome',
    },
    viewport: { width: 1280, height: 720 },
  },
});
