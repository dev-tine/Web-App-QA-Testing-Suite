import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage.js';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Payments module.
 *
 * Covers the new payment form and the payment records view.
 *
 * Non destructive by design. The suite runs on every push against a live
 * demo database, so no spec here submits the form. Required field behaviour is
 * verified through the Constraint Validation API, which is what the browser
 * itself consults before allowing a submit. Submission and persistence are
 * listed as deferred cases in docs/TEST-PLAN.md and need a seeded test
 * environment before they can be automated safely.
 */

const STREETS = ['CIRMONT', 'MOLAVE', 'IPIL', 'CAMAGONG', 'YAKAL', 'NARRA'];

test.describe('Payments, new payment form', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-PAY-001 the new payment form renders its heading and every control', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    await expect(app.h1).toHaveText(/payments/i);
    await expect(page.getByRole('heading', { name: /new payment/i })).toBeVisible();

    await expect(page.getByPlaceholder('Enter name')).toBeVisible();
    await expect(page.getByPlaceholder('0.00')).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
    await expect(page.getByRole('button', { name: /add payment/i })).toBeVisible();
  });

  test('TC-PAY-002 the amount field is numeric and the name field is text', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    // Read from the DOM rather than asserting on a locator attribute. The two
    // controls are siblings with similar placeholders, and reporting the whole
    // control list on failure says which field was actually wrong.
    const report = await app.constraintValidationReport();
    const types = Object.fromEntries(report.controls.map((c) => [c.placeholder, c.type]));

    expect(types, 'control types on the payment form').toMatchObject({
      '0.00': 'number',
      'Enter name': 'text',
    });
  });

  test('TC-PAY-003 the street list offers the six subdivision streets', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    const options = (await app.selectOptions(0)).map((o) => o.trim().toUpperCase());
    for (const street of STREETS) {
      expect(options, 'street list').toContain(street);
    }
  });

  test('TC-PAY-004 payer name and amount are required, notes are optional', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    const report = await app.constraintValidationReport();
    const required = Object.fromEntries(
      report.controls.map((c) => [c.placeholder, c.required])
    );

    expect(required, 'required flags on the payment form').toMatchObject({
      'Enter name': true,
      '0.00': true,
    });

    // The notes control is optional. It is asserted separately because it is a
    // textarea, and a textarea is not always inside the same form element.
    const notes = report.controls.find((c) => /notes/i.test(c.placeholder));
    if (notes) {
      expect(notes.required, 'notes are optional').toBe(false);
    } else {
      expect(await page.locator('textarea').getAttribute('required'),
        'notes are optional').toBeNull();
    }
  });

  test('TC-PAY-005 an empty form fails constraint validation before submit', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    const report = await app.constraintValidationReport();

    expect(report.hasForm, 'the controls are wrapped in a form element').toBe(true);
    expect(report.formValid, 'empty form must not validate').toBe(false);

    const missing = report.controls.filter((c) => c.valueMissing).map((c) => c.placeholder);
    expect(missing).toEqual(expect.arrayContaining(['Enter name', '0.00']));
  });

  test('TC-PAY-006 a filled form passes constraint validation, without submitting', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    await page.getByPlaceholder('Enter name').fill('QA Automation Check');
    await page.getByPlaceholder('0.00').fill('100');
    await page.locator('select').selectOption({ label: 'NARRA' });

    const report = await app.constraintValidationReport();
    expect(report.formValid, 'form validates once required fields are filled').toBe(true);

    await page.getByPlaceholder('Enter name').fill('');
    await page.getByPlaceholder('0.00').fill('');
  });

  test('TC-PAY-007 the amount field rejects non numeric text', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    const amount = page.getByPlaceholder('0.00');
    await amount.click();
    await amount.pressSequentially('abc');

    expect(await amount.inputValue(), 'a number input discards non numeric text').toBe('');
  });
});

test.describe('Payments, records view', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-PAY-008 the records view renders its heading, filter, search and exports', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/records');

    await expect(page.getByRole('heading', { name: /payment records/i })).toBeVisible();
    await expect(page.locator('select')).toBeVisible();
    await expect(page.getByPlaceholder('Search...')).toBeVisible();
    await expect(page.getByRole('button', { name: /excel/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /pdf/i })).toBeVisible();
  });

  test('TC-PAY-009 the records view shows a collected total', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/records');

    await expect(page.getByText(/total collected/i)).toBeVisible();
  });

  test('TC-PAY-010 a search with no match shows the empty state rather than an error', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/records');

    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));

    await page.getByPlaceholder('Search...').fill('zzz-no-such-payer-zzz');
    await page.waitForTimeout(1000);

    await expect(page.getByText(/no records found/i)).toBeVisible();
    expect(errors, 'uncaught page errors during search').toEqual([]);
  });

  test('TC-PAY-011 the records view loads without console errors', async ({ page }) => {
    const consoleErrors = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });

    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/records');
    await page.waitForTimeout(1500);

    expect(consoleErrors, 'console errors on the payment records view').toEqual([]);
  });
});
