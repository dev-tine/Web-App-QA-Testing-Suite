/**
 * Page object for the authenticated area of the AVIIHAI application.
 *
 * The application ships no data-testid, id or name attributes (DEF-104), and
 * its visible field labels are not programmatically associated with their
 * controls (DEF-106). Selectors therefore rely on role, heading level and
 * placeholder text, which are the most stable hooks available today. Replace
 * them with data-testid selectors once the application exposes them.
 */
export class AppPage {
  constructor(page) {
    this.page = page;
    this.h1 = page.getByRole('heading', { level: 1 });
    this.h2 = page.getByRole('heading', { level: 2 });
    this.addTab = page.getByRole('button', { name: /^add$/i });
    this.historyTab = page.getByRole('button', { name: /^history$/i });
  }

  async goto(path) {
    await this.page.goto(path, { waitUntil: 'domcontentloaded' });
    await this.h1.waitFor({ state: 'visible', timeout: 20000 });
  }

  /**
   * Structural accessibility and DOM snapshot for the current route.
   * Kept deliberately data-only so assertions live in the specs, not here.
   */
  async structuralSnapshot() {
    return this.page.evaluate(() => {
      const all = (sel) => Array.from(document.querySelectorAll(sel));

      const isLabelled = (el) => {
        if (el.getAttribute('aria-label')) return true;
        if (el.getAttribute('aria-labelledby')) return true;
        if (el.closest('label')) return true;
        return Boolean(el.id && document.querySelector('label[for="' + el.id + '"]'));
      };

      const controls = all('input, select, textarea');

      return {
        route: window.location.pathname,
        title: document.title,
        lang: document.documentElement.lang || '',
        h1Count: all('h1').length,
        headingOrder: all('h1, h2, h3').map((h) => h.tagName),
        landmarkMain: all('main').length,
        landmarkNav: all('nav').length,
        landmarkHeader: all('header').length,
        controlCount: controls.length,
        labelledControls: controls.filter(isLabelled).length,
        visibleLabelCount: all('label').length,
        requiredControls: controls.filter((c) => c.required).length,
        buttonCount: all('button').length,
        unnamedButtons: all('button').filter(
          (b) => !((b.getAttribute('aria-label') || b.textContent || '').trim())
        ).length,
        imagesMissingAlt: all('img').filter((i) => !i.hasAttribute('alt')).length,
        testHooks: all('[data-testid], [data-test], [data-cy]').length,
        anchorCount: all('a').length,
      };
    });
  }

  /**
   * Reads native constraint validation for every control in the first form,
   * without submitting it. Submitting would write to the live demo database,
   * so validation is verified through the Constraint Validation API instead.
   */
  async constraintValidationReport() {
    return this.page.evaluate(() => {
      const form = document.querySelector('form');
      const scope = form || document;
      const controls = Array.from(scope.querySelectorAll('input, select, textarea'));
      return {
        hasForm: Boolean(form),
        formValid: form ? form.checkValidity() : null,
        controls: controls.map((c) => ({
          type: c.type,
          placeholder: c.placeholder || '',
          required: c.required,
          valueMissing: c.validity.valueMissing,
          validationMessage: c.validationMessage,
        })),
      };
    });
  }

  /** Option labels for the nth select on the page. */
  async selectOptions(index) {
    return this.page.locator('select').nth(index).locator('option')
      .allTextContents();
  }
}
