import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright configuration for the AVIIHAI web application.
 *
 * Credentials are never committed. Set DEMO_EMAIL and DEMO_PASSWORD in a local
 * .env file, or as repository secrets when the suite runs in CI.
 *
 * Parallelism note. The suite is read only by design, documented in
 * docs/TEST-PLAN.md: no spec submits a form or writes a record. Because
 * nothing mutates shared state, the specs are safe to run in parallel, and
 * doing so keeps a full cross viewport run inside the CI budget. Restore
 * workers to 1 the day a write path is automated.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  globalSetup: './global-setup.js',

  timeout: 45000,
  expect: { timeout: 8000 },

  fullyParallel: true,
  workers: process.env.CI ? 4 : 2,
  forbidOnly: !!process.env.CI,

  // No retries. Known defects are marked with test.fail() rather than left to
  // flap, so a retry would only triple the cost of a genuine failure.
  retries: 0,

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://aviihai.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 12000,
    navigationTimeout: 25000,
  },

  projects: [
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1440, height: 900 } },
    },
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 7'] },
    },
  ],
});
