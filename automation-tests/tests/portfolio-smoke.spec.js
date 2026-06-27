import { test, expect } from '@playwright/test';

test('devtine portfolio homepage loads successfully', async ({ page }) => {
  await page.goto('https://www.devtine.xyz/');

  await expect(page).toHaveURL(/devtine\.xyz/);
  await expect(page.locator('body')).toBeVisible();
});