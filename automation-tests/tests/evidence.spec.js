import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';

/**
 * Evidence capture.
 *
 * These specs produce the screenshots referenced by the manual test
 * documentation. They run in CI on every push, so the evidence in
 * manual-testing/screenshots is regenerated from the live application rather
 * than pasted in by hand and left to go stale.
 *
 * Each viewport captures its own set of files, so the two projects never
 * overwrite each other.
 */

const DIR = '../manual-testing/screenshots/';
const EMAIL = process.env.DEMO_EMAIL;
const PASSWORD = process.env.DEMO_PASSWORD;

test.describe('Evidence capture, desktop', () => {
  test.skip(({ browserName }, testInfo) => testInfo.project.name !== 'chromium-desktop',
    'Desktop evidence is captured once, from the desktop project');

  test('EV-001 login page, default state', async ({ page }) => {
    await new LoginPage(page).goto();
    await page.screenshot({ path: DIR + 'aviihai-EV-001-login-default.png', fullPage: true });
  });

  test('EV-002 login page, native validation on empty submit', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.submitButton.click();
    await page.waitForTimeout(500);
    await page.screenshot({ path: DIR + 'aviihai-EV-002-login-validation.png', fullPage: true });
    expect(await login.validationMessage(login.emailInput)).not.toEqual('');
  });

  test('EV-003 login page, rejected credentials', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('nobody@example.com', 'wrong-password-value');
    await page.waitForTimeout(2500);
    await page.screenshot({ path: DIR + 'aviihai-EV-003-login-rejected.png', fullPage: true });
    await expect(page).toHaveURL(/\/login/);
  });

  test('EV-004 authenticated landing view', async ({ page }) => {
    test.skip(!EMAIL || !PASSWORD, 'DEMO_EMAIL and DEMO_PASSWORD are not set');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(EMAIL, PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
    await page.waitForTimeout(1500);
    await page.screenshot({ path: DIR + 'aviihai-EV-004-authenticated-landing.png', fullPage: true });
  });
});

test.describe('Evidence capture, mobile', () => {
  test.skip(({ browserName }, testInfo) => testInfo.project.name !== 'mobile-chrome',
    'Mobile evidence is captured once, from the mobile project');

  test('EV-005 login page at a mobile viewport', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await page.screenshot({ path: DIR + 'aviihai-EV-005-login-mobile.png', fullPage: true });
    await expect(login.submitButton).toBeVisible();
  });
});
