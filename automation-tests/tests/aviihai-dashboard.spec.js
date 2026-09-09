import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage.js';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Officer home.
 *
 * The landing view after sign in. It is a launcher rather than a data
 * dashboard: three module cards and two backup actions.
 */

test.describe('Officer home', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-HOME-001 the officer home identifies the signed in account', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page.getByRole('heading', { name: /hello, officer/i })).toBeVisible();
    await expect(page.getByText(/hoa management system/i)).toBeVisible();
  });

  test('TC-HOME-002 all three module cards are present with their descriptions', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page.getByRole('heading', { name: /^payments$/i })).toBeVisible();
    await expect(page.getByText(/record & view payments/i)).toBeVisible();

    await expect(page.getByRole('heading', { name: /business clearance/i })).toBeVisible();
    await expect(page.getByText(/generate & track permits/i)).toBeVisible();

    await expect(page.getByRole('heading', { name: /^settings$/i })).toBeVisible();
    await expect(page.getByText(/officers & app config/i)).toBeVisible();
  });

  test('TC-HOME-003 both backup actions are offered', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page.getByRole('button', { name: /backup payments/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /backup clearances/i })).toBeVisible();
  });

  test('TC-HOME-004 the officer home loads without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await loginAsDemoUser(page);
    await page.waitForTimeout(1500);

    expect(consoleErrors, 'console errors on the officer home').toEqual([]);
  });

  /**
   * DEF-107, Minor. WCAG 2.1 SC 1.3.1.
   * The officer home renders no main landmark and no nav landmark, while the
   * payments and clearance routes render both. See TC-NAV-008.
   */
  test.fail('TC-HOME-005 the officer home exposes a main landmark, DEF-107', async ({ page }) => {
    await loginAsDemoUser(page);
    const snapshot = await new AppPage(page).structuralSnapshot();

    expect(snapshot.landmarkMain).toBeGreaterThan(0);
  });
});
