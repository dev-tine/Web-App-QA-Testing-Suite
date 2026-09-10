import { test, expect } from '@playwright/test';
import {
  loginAsDemoUser,
  openApp,
  clientNavigate,
  hasCredentials,
  SUITE_DISABLED,
} from './helpers/auth-helper.js';

/**
 * Authentication and access control.
 *
 * The unauthenticated cases run everywhere, including on forks and pull
 * requests where secrets are not exposed. The authenticated cases skip with a
 * readable reason when credentials are absent, so a missing secret produces a
 * skip rather than a false failure.
 *
 * Entry is always at the site root. A direct request to any sub route returns
 * the deployment's 404 page, which is DEF-111 and has its own case below.
 */

test.describe('Authentication, unauthenticated', () => {
  test('TC-AUTH-001 the application loads and renders the sign in form', async ({ page }) => {
    await openApp(page);

    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.getByText(/officer login/i)).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('TC-AUTH-002 the root path sends an unauthenticated visitor to the login view', async ({ page }) => {
    await openApp(page);
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
  });

  test('TC-AUTH-003 rejected credentials keep the user on the login view', async ({ page }) => {
    await openApp(page);
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 20000 });

    await page.locator('input[type="email"]').fill('nobody@example.com');
    await page.locator('input[type="password"]').fill('not-a-real-password');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible({ timeout: 15000 });
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('TC-AUTH-004 a protected route is not shown to a visitor without a session', async ({ page }) => {
    await openApp(page);
    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });

    for (const route of ['/payments/add', '/clearance/add', '/settings']) {
      await clientNavigate(page, route);
      await expect(
        page.getByText(/officer login/i),
        'access control on ' + route
      ).toBeVisible({ timeout: 20000 });
    }
  });

  /**
   * DEF-111, Major.
   * The deployment serves no single page application fallback. Any request for
   * a route other than the site root is answered with the hosting provider's
   * 404 page, so every bookmark, shared link and browser refresh on a sub route
   * fails. It is invisible while clicking through the app, which is exactly why
   * it survived to production.
   */
  test.fail('TC-AUTH-009 a deep link resolves to the application, DEF-111', async ({ page }) => {
    const response = await page.goto('/settings', { waitUntil: 'domcontentloaded' });

    expect(response.status(), 'HTTP status for a direct sub route request').toBeLessThan(400);
    expect(await page.title(), 'document title').not.toMatch(/404/i);
  });
});

test.describe('Authentication, authenticated', () => {
  test.skip(!hasCredentials, SUITE_DISABLED);

  test('TC-AUTH-005 a valid demo account reaches the officer home', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page).not.toHaveURL(/\/login/);
    await expect(page.getByRole('heading', { name: /hello, officer/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /payments/i }).first()).toBeVisible();
    await expect(page.getByRole('button', { name: /business clearance/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /settings/i })).toBeVisible();
  });

  test('TC-AUTH-006 the session survives a reload of the application', async ({ page }) => {
    await loginAsDemoUser(page);

    await page.reload({ waitUntil: 'domcontentloaded' });

    await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.getByRole('heading', { name: /hello, officer/i })).toBeVisible();
  });

  test('TC-AUTH-007 signing out returns the user to the login view', async ({ page }) => {
    await loginAsDemoUser(page);

    const signOut = page.locator('button:has(svg.lucide-log-out)');
    await expect(signOut).toBeVisible();
    await signOut.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 20000 });
    await expect(page.getByText(/officer login/i)).toBeVisible();
  });

  test('TC-AUTH-008 a protected route is not shown again after signing out', async ({ page }) => {
    await loginAsDemoUser(page);

    // Wait for the control before clicking it. Clicking the moment it appears
    // sometimes lands before the sign out handler is wired up, and the click
    // is then a no-op: the session survives and the assertion below fails with
    // an address that is still inside the application. That produced a case
    // which failed roughly one run in three and passed on a re-run.
    const signOut = page.locator('button:has(svg.lucide-log-out)');
    await expect(signOut).toBeVisible();
    await page.waitForLoadState('networkidle', { timeout: 10000 }).catch(() => {});
    await signOut.click();

    await expect(page).toHaveURL(/\/login/, { timeout: 25000 });

    await clientNavigate(page, '/settings');
    await expect(page.getByText(/officer login/i)).toBeVisible({ timeout: 20000 });
  });
});
