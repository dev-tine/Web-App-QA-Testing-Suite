import { test, expect } from '@playwright/test';

/**
 * External smoke check.
 *
 * The portfolio site is outside the application under test, so this spec is
 * kept separate and deliberately shallow. It exists to prove the site is up,
 * not to test it. Run it on its own with: npm run test:smoke
 */

test.describe('Portfolio site smoke', () => {
  test('TC-SMOKE-001 the portfolio homepage responds and renders', async ({ page }) => {
    const response = await page.goto('https://www.devtine.xyz/', {
      waitUntil: 'domcontentloaded',
      timeout: 30000,
    });

    expect(response, 'a response was received').not.toBeNull();
    expect(response.status(), 'HTTP status').toBeLessThan(400);
    await expect(page.locator('body')).toBeVisible();
  });
});
