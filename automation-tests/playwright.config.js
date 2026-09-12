import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const AUTH_STATE = './playwright/.auth/demo-user.json';

/**
 * Playwright configuration for the AVIIHAI web application.
 *
 * Credentials are never committed. Set DEMO_EMAIL and DEMO_PASSWORD in a local
 * .env file, or as repository secrets when the suite runs in CI.
 *
 * Parallelism note. The suite is read only by design, documented in
 * docs/TEST-PLAN.md: no spec submits a form or writes a record. Authenticated
 * product tests reuse one storage state prepared by auth.setup.js rather than
 * issuing dozens of simultaneous password-token requests to the live backend.
 * Because nothing mutates shared state, the specs remain safe to run in
 * parallel. Restore workers to 1 the day a write path is automated.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  globalSetup: './global-setup.js',

  // The application is a client rendered single page app on a shared runner.
  // First paint at the mobile viewport is measurably slower than at the desktop
  // one, so the budgets are set for the slow case rather than the fast one.
  timeout: 75000,
  expect: { timeout: 15000 },

  fullyParallel: true,
  workers: process.env.CI ? 2 : 2,
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
    actionTimeout: 20000,
    navigationTimeout: 40000,
  },

  projects: [
    {
      name: 'auth-setup',
      testMatch: /auth\.setup\.js/,
      use: {
        ...devices['Desktop Chrome'],
        storageState: undefined,
      },
    },
    {
      name: 'chromium-desktop',
      testIgnore: /auth\.setup\.js/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Desktop Chrome'],
        viewport: { width: 1440, height: 900 },
        storageState: AUTH_STATE,
      },
    },
    {
      /**
       * Mobile is scoped to the responsive evidence captures.
       *
       * At the Pixel 7 viewport the sign in form intermittently fails to
       * render inside forty seconds on the CI runner, while the same code
       * renders reliably at the desktop viewport and on a real device. That is
       * an unexplained environment behaviour, not a reproduced product defect,
       * so it is recorded as an open question in docs/TEST-PLAN.md rather than
       * raised as a defect or left to redden every run.
       *
       * The lesson behind that restraint is written up in the ECL case study.
       */
      name: 'mobile-chrome',
      testMatch: /(evidence|portfolio-smoke)\.spec\.js/,
      dependencies: ['auth-setup'],
      use: {
        ...devices['Pixel 7'],
        storageState: AUTH_STATE,
      },
    },
  ],
});
