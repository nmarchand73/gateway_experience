import { defineConfig, devices } from '@playwright/test';

const baseURL = 'http://127.0.0.1:4321/gateway_experience/';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  timeout: 60_000,
  expect: { timeout: 15_000 },
  reporter: 'list',
  use: {
    baseURL,
    trace: 'on-first-retry',
    ...devices['Desktop Chrome'],
  },
  webServer: {
    command:
      'npm run build-curriculum && SKIP_COPY_MEDIA=1 npx astro build && SKIP_COPY_MEDIA=1 npx astro preview --host 127.0.0.1 --port 4321',
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 180_000,
  },
});
