import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

/**
 * Playwright configuration for the AVIIHAI web application.
 *
 * Credentials are never committed. Set DEMO_EMAIL and DEMO_PASSWORD in a local
 * .env file, or as repository secrets when the suite runs in CI.
 */
export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',

  timeout: 60000,
  expect: { timeout: 10000 },

  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,

  reporter: process.env.CI
    ? [['list'], ['html', { open: 'never' }], ['github']]
    : [['list'], ['html', { open: 'never' }]],

  use: {
    baseURL: process.env.BASE_URL || 'https://aviihai.vercel.app',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 15000,
    navigationTimeout: 30000,
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
