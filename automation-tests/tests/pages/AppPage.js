import { clientNavigate, openApp } from '../helpers/auth-helper.js';

/**
 * Page object for the authenticated area of the AVIIHAI application.
 *
 * Two constraints shape every selector and every navigation here.
 *
 * DEF-104. The application ships no data-testid, id or name attributes, and
 * DEF-106 means its visible labels are not associated with their controls.
 * Selectors therefore rely on role, heading level and placeholder text, which
 * are the most stable hooks available today.
 *
 * DEF-111. The deployment serves no single page application fallback, so a
 * direct request to a sub route returns a 404 page. goto() therefore enters at
 * the root and moves inside the running application, preferring the real user
 * path through the interface and falling back to the History API.
 */

/**
 * Cards are matched on their description text, not their title.
 *
 * The officer home also carries BACKUP PAYMENTS and BACKUP CLEARANCES buttons,
 * and a title based match on /payments/i selects one of those instead of the
 * module card. Those two controls write a file, so a suite that is supposed to
 * be read only must never click them by accident. The descriptions are unique
 * to the module cards.
 */
/**
 * How to reach each route through the interface.
 *
 * Every route is reached the way an officer reaches it: click the module card
 * on the officer home, then the Add or History tab. The History views used to
 * be reached with the History API instead, and that was the source of a suite
 * that failed two or three random cases per run. Driving the real controls
 * removed it, and it tests the navigation on the way past.
 *
 * Cards are matched on their description text, not their title. The officer
 * home also carries BACKUP PAYMENTS and BACKUP CLEARANCES buttons, and a title
 * based match on /payments/i selects one of those instead of the module card.
 * Those two controls write a file, so a suite that is meant to be read only
 * must never click them by accident.
 */
const ROUTE_PLAN = {
  '/': {},
  '/payments/add': { card: /record & view payments/i, tab: 'add' },
  '/payments/records': { card: /record & view payments/i, tab: 'history' },
  '/clearance/add': { card: /generate & track permits/i, tab: 'add' },
  '/clearance/records': { card: /generate & track permits/i, tab: 'history' },
  '/settings': { card: /officers & app config/i },
};

/**
 * The heading that proves a route has finished rendering.
 *
 * The level one heading is NOT a usable signal. It is the module name, so it
 * reads PAYMENTS on both payment views and Clearance on both clearance views.
 * Waiting on it can pass against the heading left over from the previous
 * route, and the assertions then run against a view that has not swapped yet.
 * The level two heading is unique per route, so that is what the wait uses.
 */
const READY_HEADING = {
  '/': /hello, officer/i,
  '/payments/add': /new payment/i,
  '/payments/records': /payment records/i,
  '/clearance/add': /new clearance/i,
  '/clearance/records': /clearance history/i,
  '/settings': /main officers/i,
};

export class AppPage {
  constructor(page) {
    this.page = page;
    this.h1 = page.getByRole('heading', { level: 1 });
    this.h2 = page.getByRole('heading', { level: 2 });
    this.addTab = page.getByRole('button', { name: /^add$/i });
    this.historyTab = page.getByRole('button', { name: /^history$/i });
  }

  /** Waits for the heading that belongs to a given route. */
  async waitForRoute(path, timeout = 25000) {
    const ready = READY_HEADING[path];
    if (!ready) return;
    await this.page
      .getByRole('heading', { name: ready })
      .first()
      .waitFor({ state: 'visible', timeout });
  }

  /**
   * Navigates to a route through the interface, and falls back to the History
   * API if a control does not appear. The fallback exists because a missing
   * control should fail the case that is about that control, not every case
   * that happens to start from that route.
   */
  async goto(path) {
    const plan = ROUTE_PLAN[path];

    await clientNavigate(this.page, '/');
    await this.waitForRoute('/');

    if (!plan || !plan.card) {
      if (path !== '/') await clientNavigate(this.page, path);
      await this.waitForRoute(path);
      return;
    }

    try {
      await this.page.getByRole('button', { name: plan.card }).first().click({ timeout: 15000 });

      if (plan.tab === 'history') {
        await this.historyTab.click({ timeout: 15000 });
      }

      await this.waitForRoute(path, 20000);
    } catch (error) {
      await clientNavigate(this.page, path);
      await this.waitForRoute(path);
    }
  }

  /** Reloads the application from the root. */
  async restart() {
    await openApp(this.page);
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
