/**
 * Page object for the AVIIHAI officer login screen.
 *
 * DEF-104. The application ships no data-testid, id or name attributes on its
 * form controls. Selectors therefore rely on input type and on the accessible
 * role of the submit control, which are the most stable hooks available today.
 * Swap these for data-testid selectors once the app adds them.
 *
 * DEF-111. A direct request to /login returns the deployment's 404 page,
 * because no single page application fallback is configured. The suite enters
 * at the site root instead, which the router then resolves to the login view
 * for an unauthenticated visitor.
 */
export class LoginPage {
  constructor(page) {
    this.page = page;
    this.emailInput = page.locator('input[type="email"]');
    this.passwordInput = page.locator('input[type="password"]');
    this.submitButton = page.getByRole('button', { name: /log in/i });
    this.heading = page.getByRole('heading', { level: 1 });
    this.form = page.locator('form');
  }

  /**
   * The sign in form is client rendered, and first paint at the mobile
   * viewport is measurably slower than at the desktop one. The wait is sized
   * for the slow case, and a failure here is reported as a load timeout rather
   * than as a missing element, which is a more useful thing to read.
   */
  async goto() {
    await this.page.goto('/', { waitUntil: 'domcontentloaded' });
    await this.emailInput.waitFor({ state: 'visible', timeout: 40000 });
  }

  async login(email, password) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  /** Native constraint validation message for a given control. */
  async validationMessage(locator) {
    return locator.evaluate((el) => el.validationMessage);
  }

  /** Structural accessibility snapshot used by the accessibility specs. */
  async accessibilitySnapshot() {
    return this.page.evaluate(() => {
      const all = (sel) => Array.from(document.querySelectorAll(sel));
      const isLabelled = (input) => {
        if (input.getAttribute('aria-label')) return true;
        if (input.getAttribute('aria-labelledby')) return true;
        if (input.closest('label')) return true;
        return Boolean(input.id && document.querySelector('label[for="' + input.id + '"]'));
      };
      const inputs = all('input');
      return {
        lang: document.documentElement.lang || '',
        title: document.title,
        h1Count: all('h1').length,
        landmarkMain: all('main').length,
        formCount: all('form').length,
        inputCount: inputs.length,
        labelledInputs: inputs.filter(isLabelled).length,
        autocompleteValues: inputs.map((i) => i.getAttribute('autocomplete')),
        unnamedButtons: all('button').filter(
          (b) => !(b.getAttribute('aria-label') || b.textContent || '').trim()
        ).length,
        imagesMissingAlt: all('img').filter((i) => !i.hasAttribute('alt')).length,
        testHooks: all('[data-testid], [data-test], [data-cy]').length,
        metaDescription: (document.querySelector('meta[name="description"]') || {}).content || '',
      };
    });
  }
}
