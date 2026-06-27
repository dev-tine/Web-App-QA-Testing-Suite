import { test, expect } from '@playwright/test';
import dotenv from 'dotenv';

dotenv.config();

const baseURL = process.env.AVIIHAI_BASE_URL;

async function loginAsDemoUser(page) {
  await page.goto(baseURL);

  await page.getByPlaceholder('officer@aviihai.com').fill(process.env.AVIIHAI_EMAIL);
  await page.locator('input[type="password"]').fill(process.env.AVIIHAI_PASSWORD);
  await page.getByRole('button', { name: /log in/i }).click();

  await expect(page.getByText(/hello, officer/i)).toBeVisible({ timeout: 15000 });
}

test.describe('AVIIHAI Authentication', () => {
  test('AUTH-001 login page loads successfully from base URL', async ({ page }) => {
    await page.goto(baseURL);

    await expect(page).toHaveURL(/\/login/);

    await expect(page.getByText(/officer login/i)).toBeVisible();
    await expect(page.getByPlaceholder('officer@aviihai.com')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test('AUTH-002 user can log in with valid demo account', async ({ page }) => {
    await loginAsDemoUser(page);

    await expect(page.getByText(/demo@user\.com/i)).toBeVisible();

    await expect(
      page.getByRole('button', { name: /payments record & view payments/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /business clearance generate & track permits/i })
    ).toBeVisible();

    await expect(
      page.getByRole('button', { name: /settings officers & app config/i })
    ).toBeVisible();
  });

  test('AUTH-003 invalid login credentials show an error message', async ({ page }) => {
    await page.goto(baseURL);

    await page.getByPlaceholder('officer@aviihai.com').fill('wrong@example.com');
    await page.locator('input[type="password"]').fill('wrongpass123');
    await page.getByRole('button', { name: /log in/i }).click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/invalid login credentials/i)).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });

  test.describe('AUTH-004 Protected Route Access', () => {
    const protectedRoutes = [
      { name: 'Payments', path: '/payments/add' },
      { name: 'Business Clearance', path: '/clearance/add' },
      { name: 'Settings', path: '/settings' },
    ];

    for (const route of protectedRoutes) {
      test.skip(`AUTH-004 unauthenticated user should be redirected to login - ${route.name}`, async ({ page }) => {
        await page.goto(`${baseURL}${route.path}`);

        await expect(page).toHaveURL(/\/login/);
        await expect(page.getByText(/officer login/i)).toBeVisible();
        await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
      });
    }
  });

  test('AUTH-005 user can log out successfully', async ({ page }) => {
    await loginAsDemoUser(page);

    const logoutButton = page.locator('button:has(svg.lucide-log-out)');
    await expect(logoutButton).toBeVisible();
    await logoutButton.click();

    await expect(page).toHaveURL(/\/login/);
    await expect(page.getByText(/officer login/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /log in/i })).toBeVisible();
  });
});