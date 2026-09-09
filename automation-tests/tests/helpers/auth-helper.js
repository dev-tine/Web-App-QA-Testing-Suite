import { expect } from '@playwright/test';
import 'dotenv/config';

/**
 * Shared authentication helper.
 *
 * Credentials are read from the environment and are never committed. The suite
 * accepts either naming convention so that older specs and CI secrets keep
 * working:
 *
 *   DEMO_EMAIL    / DEMO_PASSWORD      preferred
 *   AVIIHAI_EMAIL / AVIIHAI_PASSWORD   legacy
 *
 * The base URL comes from playwright.config.js, so specs navigate with
 * relative paths and the whole suite can be pointed at a staging build by
 * setting BASE_URL.
 */

export const EMAIL = process.env.DEMO_EMAIL || process.env.AVIIHAI_EMAIL || '';
export const PASSWORD = process.env.DEMO_PASSWORD || process.env.AVIIHAI_PASSWORD || '';

/** True when credentials are available. Specs skip rather than fail without them. */
export const hasCredentials = Boolean(EMAIL && PASSWORD);

export const CREDENTIALS_MISSING =
  'DEMO_EMAIL and DEMO_PASSWORD are not set. Add them as repository secrets to run the authenticated suite.';

/**
 * Logs in and waits for the officer landing view.
 * Throws early with a readable message if credentials were not provided.
 */
export async function loginAsDemoUser(page) {
  if (!hasCredentials) {
    throw new Error(CREDENTIALS_MISSING);
  }

  await page.goto('/login', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page.getByRole('heading', { name: /hello, officer/i }))
    .toBeVisible({ timeout: 20000 });
}

/**
 * Logs in, then navigates to an authenticated route and waits for its h1.
 * Returns the h1 locator so the caller can assert on it.
 */
export async function gotoAuthenticated(page, path) {
  await loginAsDemoUser(page);
  await page.goto(path, { waitUntil: 'domcontentloaded' });
  const heading = page.getByRole('heading', { level: 1 });
  await heading.waitFor({ state: 'visible', timeout: 20000 });
  return heading;
}
