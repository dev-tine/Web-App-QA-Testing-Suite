import { test, expect } from '@playwright/test';
import { LoginPage } from './pages/LoginPage.js';

/**
 * AVIIHAI officer login.
 *
 * Positive path cases run only when DEMO_EMAIL and DEMO_PASSWORD are present,
 * so the suite stays green for anyone who clones the repository without them.
 * Cases declared with test.fail document a known defect. They are expected to
 * fail today and will turn the suite red the moment the defect is fixed, which
 * is the signal to update the test and close the defect.
 */

const EMAIL = process.env.DEMO_EMAIL;
const PASSWORD = process.env.DEMO_PASSWORD;
const hasCredentials = Boolean(EMAIL && PASSWORD);

test.describe('Login page, rendering and structure', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).goto();
  });

  test('TC-LOGIN-001 renders the email field, password field and submit control', async ({ page }) => {
    const login = new LoginPage(page);
    await expect(login.emailInput).toBeVisible();
    await expect(login.passwordInput).toBeVisible();
    await expect(login.submitButton).toBeVisible();
    await expect(login.submitButton).toBeEnabled();
  });

  test('TC-LOGIN-002 marks both credentials fields as required', async ({ page }) => {
    const login = new LoginPage(page);
    await expect(login.emailInput).toHaveAttribute('required', '');
    await expect(login.passwordInput).toHaveAttribute('required', '');
  });

  test('TC-LOGIN-003 masks the password field', async ({ page }) => {
    await expect(new LoginPage(page).passwordInput).toHaveAttribute('type', 'password');
  });

  test('TC-LOGIN-004 sets a page title', async ({ page }) => {
    await expect(page).toHaveTitle(/aviihai/i);
  });
});

test.describe('Login page, client side validation', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).goto();
  });

  test('TC-LOGIN-005 blocks submission when both fields are empty', async ({ page }) => {
    const login = new LoginPage(page);
    await login.submitButton.click();
    await expect(page).toHaveURL(/\/login/);
    expect(await login.validationMessage(login.emailInput)).not.toEqual('');
  });

  test('TC-LOGIN-006 rejects a malformed email address', async ({ page }) => {
    const login = new LoginPage(page);
    await login.emailInput.fill('not-an-email');
    await login.submitButton.click();
    await expect(page).toHaveURL(/\/login/);
    expect(await login.validationMessage(login.emailInput)).not.toEqual('');
  });

  test('TC-LOGIN-007 blocks submission when the password is empty', async ({ page }) => {
    const login = new LoginPage(page);
    await login.emailInput.fill('officer@example.com');
    await login.submitButton.click();
    await expect(page).toHaveURL(/\/login/);
    expect(await login.validationMessage(login.passwordInput)).not.toEqual('');
  });
});

test.describe('Login page, authentication', () => {
  test('TC-LOGIN-008 rejects an unknown account and stays on the login route', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    await login.login('nobody@example.com', 'wrong-password-value');
    await page.waitForTimeout(2000);
    await expect(page).toHaveURL(/\/login/);
  });

  test('TC-LOGIN-009 signs a valid officer in and leaves the login route', async ({ page }) => {
    test.skip(!hasCredentials, 'DEMO_EMAIL and DEMO_PASSWORD are not set');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(EMAIL, PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
  });

  test('TC-LOGIN-010 keeps the session across a reload', async ({ page }) => {
    test.skip(!hasCredentials, 'DEMO_EMAIL and DEMO_PASSWORD are not set');
    const login = new LoginPage(page);
    await login.goto();
    await login.login(EMAIL, PASSWORD);
    await expect(page).not.toHaveURL(/\/login/, { timeout: 20000 });
    const afterLogin = page.url();
    await page.reload({ waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(afterLogin);
  });
});

test.describe('Login page, accessibility', () => {
  test.beforeEach(async ({ page }) => {
    await new LoginPage(page).goto();
  });

  test('TC-A11Y-101 declares a document language', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.lang).not.toEqual('');
  });

  test('TC-A11Y-102 exposes exactly one level one heading', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.h1Count).toBe(1);
  });

  test('TC-A11Y-103 gives every button an accessible name', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.unnamedButtons).toBe(0);
  });

  test('TC-A11Y-104 gives every image an alt attribute', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.imagesMissingAlt).toBe(0);
  });

  // DEF-101, Major. Neither credential field is programmatically labelled.
  // Expected to fail until labels or aria-label attributes are added.
  test.fail('TC-A11Y-105 programmatically labels every form control, DEF-101', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.labelledInputs).toBe(snapshot.inputCount);
  });

  // DEF-102, Minor. No autocomplete attributes, so password managers and
  // browser autofill cannot identify the fields. WCAG 2.1 SC 1.3.5.
  test.fail('TC-A11Y-106 declares autocomplete on the credentials fields, DEF-102', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.autocompleteValues).toEqual(['username', 'current-password']);
  });

  // DEF-103, Minor. The page has no main landmark, so assistive technology
  // users cannot jump straight to the primary content.
  test.fail('TC-A11Y-107 exposes a main landmark, DEF-103', async ({ page }) => {
    const snapshot = await new LoginPage(page).accessibilitySnapshot();
    expect(snapshot.landmarkMain).toBeGreaterThan(0);
  });
});

test.describe('Login page, testability', () => {
  // DEF-104, Minor. No data-testid, data-test or data-cy hooks exist, so every
  // selector depends on presentation details that change with a redesign.
  test.fail('TC-TEST-101 exposes stable automation hooks, DEF-104', async ({ page }) => {
    const login = new LoginPage(page);
    await login.goto();
    const snapshot = await login.accessibilitySnapshot();
    expect(snapshot.testHooks).toBeGreaterThan(0);
  });
});
