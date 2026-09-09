import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';
import { AppPage } from './pages/AppPage.js';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Evidence capture.
 *
 * These specs produce the screenshots referenced by the manual test
 * documentation. They run in CI on every push and the workflow commits the
 * output back to manual-testing/screenshots, so the evidence in this
 * repository is regenerated from the live application rather than pasted in by
 * hand and left to go stale.
 *
 * Each viewport captures its own set of files, so the two projects never
 * overwrite each other. Naming follows the convention in
 * manual-testing/screenshots/README.md.
 */

const DIR = '../manual-testing/screenshots/';

const shot = async (page, name) => {
  await page.waitForTimeout(1200);
  await page.screenshot({ path: DIR + name, fullPage: true });
};

test.describe('Evidence capture, desktop, unauthenticated', () => {
  test.skip(({ browserName }, testInfo) => testInfo.project.name !== 'chromium-desktop',
    'Desktop evidence is captured once, from the desktop project');

  test('EV-001 login page, default state', async ({ page }) => {
    await new LoginPage(page).goto();
    await shot(page, 'aviihai-EV-001-login-default.png');
  });

  test('EV-002 login page, native validation on empty submit', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitButton.click();
    await shot(page, 'aviihai-EV-002-login-validation.png');
    expect(await login.validationMessage(login.emailInput)).not.toEqual('');
  });

  test('EV-003 login page, rejected credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('nobody@example.com', 'not-a-real-password');
    await page.waitForTimeout(2500);
    await shot(page, 'aviihai-EV-003-login-rejected.png');
    await expect(page).toHaveURL(/\/login/);
  });
});

test.describe('Evidence capture, desktop, authenticated', () => {
  test.skip(({ browserName }, testInfo) => testInfo.project.name !== 'chromium-desktop',
    'Desktop evidence is captured once, from the desktop project');
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('EV-004 officer home', async ({ page }) => {
    await loginAsDemoUser(page);
    await shot(page, 'aviihai-EV-004-officer-home.png');
  });

  test('EV-005 new payment form', async ({ page }) => {
    await loginAsDemoUser(page);
    await new AppPage(page).goto('/payments/add');
    await shot(page, 'aviihai-EV-005-payments-add.png');
  });

  test('EV-006 new payment form, constraint validation on an empty form', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    await page.getByPlaceholder('Enter name').click();
    await page.getByPlaceholder('0.00').click();
    await page.getByRole('heading', { level: 1 }).click();

    await shot(page, 'aviihai-EV-006-payments-validation.png');
    const report = await app.constraintValidationReport();
    expect(report.formValid).toBe(false);
  });

  test('EV-007 payment records, empty state', async ({ page }) => {
    await loginAsDemoUser(page);
    await new AppPage(page).goto('/payments/records');
    await shot(page, 'aviihai-EV-007-payments-records.png');
  });

  test('EV-008 new clearance form', async ({ page }) => {
    await loginAsDemoUser(page);
    await new AppPage(page).goto('/clearance/add');
    await shot(page, 'aviihai-EV-008-clearance-add.png');
  });

  test('EV-009 clearance history, empty state', async ({ page }) => {
    await loginAsDemoUser(page);
    await new AppPage(page).goto('/clearance/records');
    await shot(page, 'aviihai-EV-009-clearance-records.png');
  });

  test('EV-010 settings, officer roster', async ({ page }) => {
    await loginAsDemoUser(page);
    await new AppPage(page).goto('/settings');
    await shot(page, 'aviihai-EV-010-settings.png');
  });
});

test.describe('Evidence capture, mobile', () => {
  test.skip(({ browserName }, testInfo) => testInfo.project.name !== 'mobile-chrome',
    'Mobile evidence is captured once, from the mobile project');

  test('EV-011 login page at a mobile viewport', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await shot(page, 'aviihai-EV-011-login-mobile.png');
    await expect(login.submitButton).toBeVisible();
  });

  test('EV-012 new payment form at a mobile viewport', async ({ page }) => {
    test.skip(!hasCredentials, CREDENTIALS_MISSING);
    await loginAsDemoUser(page);
    await new AppPage(page).goto('/payments/add');
    await shot(page, 'aviihai-EV-012-payments-add-mobile.png');
  });
});
