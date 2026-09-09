import { test, expect } from '@playwright/test';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Authentication.
 *
 * The unauthenticated cases run everywhere, including on forks and on pull
 * requests where secrets are not exposed. The authenticated cases skip with a
 * readable reason when credentials are absent, so a missing secret produces a
 * skip rather than a false failure.
 *
 * Base URL comes from playwright.config.js. Every navigation here is relative,
 * so the same suite runs against a staging build by setting BASE_URL.
 */

test.describe('Authentication, unauthenticated', () => {
  test('TC-AUTH-001 the login page loads and renders every control', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/officer login/i)).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('TC-AUTH-002 the root path sends an unauthenticated visitor to login', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
  });

  test('TC-AUTH-003 rejected credentials keep the user on the login page', async ({ page }) => {
    await page.goto('/login', { waitUntil: 'domcontentloaded' });

    await page.locator('input[type="email"]').fill('nobody@example.com');
    await page.locator('input[type="password"]').fill('not-a-real-password');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('TC-AUTH-004 protected routes are not reachable without a session', async ({ page }) => {
    const protectedRoutes = ['/payments/add', '/payments/records', '/clearance/add', '/settings'];

    for (const route of protectedRoutes) {
      await page.goto(route, { waitUntil: 'domcontentloaded' });
      await expect(page, 'access control on ' + route).toHaveURL(/\/login/, { timeout: 20000 });
    }
  });
});

test.describe('Authentication, authenticated', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-AUTH-005 a valid demo account reaches the officer home', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /hello, officer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /payments/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /business clearance/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
  });

  test('TC-AUTH-006 the session survives a page reload', async ({ page }) => {
    await loginAsDemoUser(page);

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /hello, officer/i })).toBeVisible();
  });

  test('TC-AUTH-007 signing out returns the user to the login page', async ({ page }) => {
    await loginAsDemoUser(page);

    const signOut = page.locator('button:has(svg.lucide-log-out)');
    await expect(signOut).toBeVisible();
    await signOut.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.getByText(/officer login/i)).toBeVisible();
  });

  test('TC-AUTH-008 a protected route is not reachable again after signing out', async ({ page }) => {
    await loginAsDemoUser(page);

    await page.locator('button:has(svg.lucide-log-out)').click();
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });

    await page.goto('/settings', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
  });
});
