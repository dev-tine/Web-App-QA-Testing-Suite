import { test as setup, expect } from '@playwright/test';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import 'dotenv/config';

const AUTH_STATE = path.resolve('playwright/.auth/demo-user.json');
const EMAIL = process.env.DEMO_EMAIL || process.env.AVIIHAI_EMAIL || '';
const PASSWORD = process.env.DEMO_PASSWORD || process.env.AVIIHAI_PASSWORD || '';

/**
 * Creates one reusable officer session for the read-only product suite.
 *
 * The previous design logged in again at the start of every authenticated
 * case. On the live deployment that produced bursts of password-token calls;
 * one of those calls was rejected by the auth service without CORS headers and
 * surfaced in the browser as "Failed to fetch". Preparing state once removes
 * that avoidable backend pressure while the dedicated login cases continue to
 * exercise the real sign-in flow with a clean browser context.
 */
setup('prepare the demo officer session', async ({ page }) => {
  await mkdir(path.dirname(AUTH_STATE), { recursive: true });

  // Keep the repository runnable on forks and local machines without secrets.
  // Authenticated specs already skip explicitly when credentials are absent.
  if (!EMAIL || !PASSWORD) {
    await page.context().storageState({ path: AUTH_STATE });
    return;
  }

  await page.goto('/', { waitUntil: 'domcontentloaded' });
  await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 40000 });
  await page.locator('input[type="email"]').fill(EMAIL);
  await page.locator('input[type="password"]').fill(PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page.getByRole('heading', { name: /hello, officer/i }))
    .toBeVisible({ timeout: 40000 });

  await page.context().storageState({ path: AUTH_STATE });
});
