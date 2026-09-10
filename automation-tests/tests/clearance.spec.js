import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage.js';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Business clearance module.
 *
 * Covers the new clearance form and the clearance history view.
 *
 * Non destructive by design, on the same basis as the payments suite. Nothing
 * here submits the form.
 */

test.describe('Clearance, new clearance form', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-CLR-001 the new clearance form renders its heading and every control', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    await expect(app.h1).toHaveText(/clearance/i);
    await expect(page.getByRole('heading', { name: /new clearance/i })).toBeVisible();

    await expect(page.getByPlaceholder('e.g. Sari-Sari Store')).toBeVisible();
    await expect(page.getByPlaceholder('Full Name')).toBeVisible();
    await expect(page.getByPlaceholder('Street / Unit No.')).toBeVisible();
    await expect(page.getByPlaceholder('e.g. Retail')).toBeVisible();
    await expect(page.getByPlaceholder('Amount')).toBeVisible();
    await expect(page.getByRole('button', { name: /add clearance/i })).toBeVisible();
  });

  test('TC-CLR-002 the form exposes three select lists', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    await expect(page.locator('select')).toHaveCount(3);
  });

  test('TC-CLR-003 the permit type list offers new, renewal and others', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    const options = (await app.selectOptions(0)).join(' ').toLowerCase();
    expect(options).toContain('new');
    expect(options).toContain('renewal');
    expect(options).toContain('others');
  });

  test('TC-CLR-004 the building type list offers rented and owned', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    const options = (await app.selectOptions(1)).join(' ').toLowerCase();
    expect(options).toContain('rented');
    expect(options).toContain('owned');
  });

  test('TC-CLR-005 the ownership list offers the three legal structures', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    const options = (await app.selectOptions(2)).join(' ').toLowerCase();
    expect(options).toContain('sole proprietorship');
    expect(options).toContain('partnership');
    expect(options).toContain('corporation');
  });

  test('TC-CLR-006 business name and owner are required', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    const report = await app.constraintValidationReport();
    const byPlaceholder = (text) => report.controls.find((c) => c.placeholder === text);

    expect(byPlaceholder('e.g. Sari-Sari Store').required, 'business name required').toBe(true);
    expect(byPlaceholder('Full Name').required, 'owner required').toBe(true);
    expect(report.formValid, 'empty form must not validate').toBe(false);
  });

  /**
   * DEF-109, Minor. A business permit record is a legal document. Address,
   * business type, capitalization, building type and ownership are all
   * optional in the current build, so a clearance can be issued against an
   * incomplete record. Raised as a specification question rather than a code
   * defect: the expected behaviour needs confirming with the HOA before the
   * rule is fixed either way.
   */
  test.fail('TC-CLR-007 address and capitalization are required on a permit record, DEF-109', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    const report = await app.constraintValidationReport();
    const byPlaceholder = (text) => report.controls.find((c) => c.placeholder === text);

    expect(byPlaceholder('Street / Unit No.').required, 'address required').toBe(true);
    expect(byPlaceholder('Amount').required, 'capitalization required').toBe(true);
  });

  test('TC-CLR-008 capitalization accepts a numeric amount', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    const capital = page.getByPlaceholder('Amount');
    await expect(capital).toHaveAttribute('type', 'number');

    await capital.fill('50000');
    expect(await capital.inputValue()).toBe('50000');
    await capital.fill('');
  });
});

test.describe('Clearance, history view', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-CLR-009 the history view renders its heading, search and bulk select', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/records');

    await expect(page.getByRole('heading', { name: /clearance history/i })).toBeVisible();
    await expect(page.getByPlaceholder(/search by name or control no/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /select multiple/i })).toBeVisible();
  });

  test('TC-CLR-010 a search with no match shows the empty state rather than an error', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/records');

    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.getByPlaceholder(/search by name or control no/i).fill('zzz-no-such-business-zzz');
    await page.waitForTimeout(1500);

    // The assertion is that the view reports an empty result, not that it uses
    // one exact sentence. The two list modules word this differently, which is
    // DEF-110, so matching on one phrase here would make this case fail for the
    // wrong reason the day that defect is fixed.
    const emptyState = page.getByText(/no (clearances|records|results) found/i).first();
    await expect(emptyState, 'empty state after a search with no match').toBeVisible();

    expect(errors, 'uncaught page errors during search').toEqual([]);
  });

  /**
   * DEF-110, Minor. The two list modules describe an empty result in two
   * different shapes, "No records found for this date." on payments and
   * "No clearances found" on clearances. One of the two carries the reason the
   * list is empty, the other does not, and only one ends in a full stop.
   */
  test.fail('TC-CLR-011 both list modules use one empty state pattern, DEF-110', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    await app.goto('/payments/records');
    const payments = (await page.getByText(/no records found/i).first().innerText()).trim();

    await app.goto('/clearance/records');
    const clearances = (
      await page.getByText(/no (clearances|records|results) found/i).first().innerText()
    ).trim();

    const endsInStop = (text) => text.endsWith('.');
    expect(endsInStop(payments)).toBe(endsInStop(clearances));
  });
});
