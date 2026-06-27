import { test, expect } from '@playwright/test';
import { loginAsDemoUser } from './helpers/auth-helper.js';

test.describe('AVIIHAI Dashboard', () => {
  test('DASH-001 dashboard loads after successful login', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page.getByText(/hello, officer/i)).toBeVisible();
    await expect(page.getByText(/demo@user\.com/i)).toBeVisible();
    await expect(page.getByRole('heading', { name: /aviihai/i })).toBeVisible();
    await expect(page.getByText(/hoa management system/i)).toBeVisible();
  });

  test('DASH-002 dashboard module cards are visible', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(
      page.getByRole('button', { name: /payments record & view payments/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /business clearance generate & track permits/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /settings officers & app config/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /backup payments/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /backup clearances/i })
    ).toBeVisible();
  });

  test('DASH-003 user can navigate to Payments module', async ({ page }) => {
    await loginAsDemoUser(page);

    await page.getByRole('button', { name: /payments record & view payments/i }).click();

    await expect(page).toHaveURL(/\/payments\/add/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('DASH-004 user can navigate to Business Clearance module', async ({ page }) => {
    await loginAsDemoUser(page);

    await page.getByRole('button', { name: /business clearance generate & track permits/i }).click();

    await expect(page).toHaveURL(/\/clearance\/add/);
    await expect(page.locator('body')).toBeVisible();
  });

  test('DASH-005 user can navigate to Settings module', async ({ page }) => {
    await loginAsDemoUser(page);

    await page.getByRole('button', { name: /settings officers & app config/i }).click();

    await expect(page).toHaveURL(/\/settings/);
    await expect(page.locator('body')).toBeVisible();
  });
});