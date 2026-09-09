import { expect } from '@playwright/test';
import 'dotenv/config';

/**
 * Shared authentication and navigation helper.
 *
 * Credentials are read from the environment and are never committed. The suite
 * accepts either naming convention so that older specs and CI secrets keep
 * working:
 *
 *   DEMO_EMAIL    / DEMO_PASSWORD      preferred
 *   AVIIHAI_EMAIL / AVIIHAI_PASSWORD   legacy
 *
 * DEEP LINKS. The deployment serves no single page application fallback, so a
 * direct request to any route other than the site root returns a 404 page
 * rather than the application. This is recorded as DEF-111, and it is why
 * every spec here enters at the root and then navigates inside the running
 * application. Once the rewrite is added, clientNavigate can be replaced by an
 * ordinary page.goto.
 */

export const EMAIL = process.env.DEMO_EMAIL || process.env.AVIIHAI_EMAIL || '';
export const PASSWORD = process.env.DEMO_PASSWORD || process.env.AVIIHAI_PASSWORD || '';

/** True when credentials are available. */
export const hasCredentials = Boolean(EMAIL && PASSWORD);

/** Set by global-setup.js after it confirms the application renders. */
export const appReachable = process.env.APP_REACHABLE === '1';

/** Specs run only when both hold. Otherwise they skip with the reason below. */
export const suiteEnabled = hasCredentials && appReachable;

export const SUITE_DISABLED = !hasCredentials
  ? 'DEMO_EMAIL and DEMO_PASSWORD are not set. Add them as repository secrets to run the authenticated suite.'
  : 'Preflight could not reach the application. See the preflight diagnostics at the top of the run.';

/** Kept for older specs that imported the previous name. */
export const CREDENTIALS_MISSING = SUITE_DISABLED;

/** Opens the application at its root, the only entry point that is not a 404. */
export async function openApp(page) {
  await page.goto('/', { waitUntil: 'domcontentloaded' });
}

/**
 * Moves to a route inside the already loaded application.
 *
 * Uses the History API and a popstate event, which is what the router listens
 * to, rather than a fresh document request that the deployment would answer
 * with a 404. See DEF-111.
 */
export async function clientNavigate(page, path) {
  if (!page.url().includes('://')) {
    await openApp(page);
  }
  await page.evaluate((target) => {
    window.history.pushState({}, '', target);
    window.dispatchEvent(new PopStateEvent('popstate', { state: {} }));
  }, path);
  await page.waitForTimeout(400);
}

/**
 * Signs in and waits for the officer landing view.
 */
export async function loginAsDemoUser(page) {
  if (!hasCredentials) {
    throw new Error(SUITE_DISABLED);
  }

  await openApp(page);
  await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 40000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page.getByRole('heading', { name: /hello, officer/i }))
    .toBeVisible({ timeout: 40000 });
}
