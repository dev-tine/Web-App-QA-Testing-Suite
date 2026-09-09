import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage.js';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Settings module.
 *
 * Covers the officer roster, board of directors and contacts sections.
 *
 * Non destructive by design. SAVE ALL SETTINGS is never clicked, because doing
 * so would overwrite the live officer roster on every CI run.
 */

const OFFICER_ROLES = [
  'Name of President',
  'Name of Vice President',
  'Name of Secretary',
  'Name of Treasurer',
  'Name of Auditor',
  'Name of Business Manager',
  'Name of P.R.O',
];

test.describe('Settings', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-SET-001 the settings route renders its three sections', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');

    await expect(app.h1).toHaveText(/settings/i);
    await expect(page.getByRole('heading', { name: /main officers/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /board of directors/i })).toBeVisible();
    await expect(page.getByRole('heading', { name: /contacts/i })).toBeVisible();
  });

  test('TC-SET-002 every officer role has its own field', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');

    for (const role of OFFICER_ROLES) {
      await expect(page.getByPlaceholder(role), role).toBeVisible();
    }
  });

  test('TC-SET-003 the contacts section captures a label and a number', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');

    await expect(page.getByPlaceholder('Office')).toBeVisible();
    await expect(page.getByPlaceholder('0912 345 6789')).toBeVisible();
  });

  test('TC-SET-004 the save control is present and reachable', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');

    const save = page.getByRole('button', { name: /save all settings/i });
    await expect(save).toBeVisible();
    await expect(save).toBeEnabled();
  });

  test('TC-SET-005 officer fields accept input', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');

    const president = page.getByPlaceholder('Name of President');
    const original = await president.inputValue();

    await president.fill('QA Automation Check');
    expect(await president.inputValue()).toBe('QA Automation Check');

    await president.fill(original);
    expect(await president.inputValue()).toBe(original);
  });

  /**
   * DEF-106, Major. WCAG 2.1 SC 1.3.1 Info and Relationships and SC 4.1.2
   * Name, Role, Value.
   * Settings renders a visible label beside every field, but none of them are
   * programmatically associated with their control. There is no for attribute,
   * no wrapping label and no aria-label, so a screen reader announces eleven
   * fields as "edit text, blank" with no indication of which office each one
   * belongs to.
   */
  test.fail('TC-SET-006 every settings field has a programmatic label, DEF-106', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');

    const snapshot = await app.structuralSnapshot();

    expect(snapshot.visibleLabelCount, 'visible labels are present').toBeGreaterThan(0);
    expect(snapshot.labelledControls, 'programmatically labelled controls')
      .toBe(snapshot.controlCount);
  });

  test('TC-SET-007 the settings route loads without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/settings');
    await page.waitForTimeout(1500);

    expect(consoleErrors, 'console errors on the settings view').toEqual([]);
  });
});
