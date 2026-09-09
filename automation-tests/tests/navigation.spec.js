import { test, expect } from '@playwright/test';
import { AppPage } from './pages/AppPage.js';
import { loginAsDemoUser, hasCredentials, CREDENTIALS_MISSING } from './helpers/auth-helper.js';

/**
 * Navigation and cross route structure.
 *
 * Scope: route reachability, heading structure, landmark consistency and
 * document titles across the authenticated application.
 *
 * Non destructive by design. No spec in this file submits a form or writes to
 * the demo database.
 */

const ROUTES = [
  { path: '/', label: 'Officer home', h1: /hello, officer/i },
  { path: '/payments/add', label: 'New payment', h1: /payments/i },
  { path: '/payments/records', label: 'Payment records', h1: /payments/i },
  { path: '/clearance/add', label: 'New clearance', h1: /clearance/i },
  { path: '/clearance/records', label: 'Clearance history', h1: /clearance/i },
  { path: '/settings', label: 'Settings', h1: /settings/i },
];

test.describe('Navigation and cross route structure', () => {
  test.skip(!hasCredentials, CREDENTIALS_MISSING);

  test('TC-NAV-001 every authenticated route loads and renders exactly one h1', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    for (const route of ROUTES) {
      await app.goto(route.path);
      const snapshot = await app.structuralSnapshot();

      expect(snapshot.h1Count, 'h1 count on ' + route.path).toBe(1);
      await expect(app.h1, 'h1 text on ' + route.path).toHaveText(route.h1);
    }
  });

  test('TC-NAV-002 /clearance redirects to the clearance add form', async ({ page }) => {
    await loginAsDemoUser(page);
    await page.goto('/clearance', { waitUntil: 'domcontentloaded' });
    await expect(page).toHaveURL(/\/clearance\/add/, { timeout: 20000 });
  });

  test('TC-NAV-003 the module cards on the officer home route to the right modules', async ({ page }) => {
    await loginAsDemoUser(page);

    const cases = [
      { name: /payments/i, url: /\/payments\/add/ },
      { name: /business clearance/i, url: /\/clearance\/add/ },
      { name: /settings/i, url: /\/settings/ },
    ];

    for (const item of cases) {
      await page.goto('/', { waitUntil: 'domcontentloaded' });
      await page.getByRole('button', { name: item.name }).first().click();
      await expect(page).toHaveURL(item.url, { timeout: 20000 });
    }
  });

  test('TC-NAV-004 the Add and History tabs switch between the two payment views', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/payments/add');

    await app.historyTab.click();
    await expect(page).toHaveURL(/\/payments\/records/, { timeout: 20000 });

    await app.addTab.click();
    await expect(page).toHaveURL(/\/payments\/add/, { timeout: 20000 });
  });

  test('TC-NAV-005 the Add and History tabs switch between the two clearance views', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);
    await app.goto('/clearance/add');

    await app.historyTab.click();
    await expect(page).toHaveURL(/\/clearance\/records/, { timeout: 20000 });

    await app.addTab.click();
    await expect(page).toHaveURL(/\/clearance\/add/, { timeout: 20000 });
  });

  test('TC-NAV-006 the document language is declared on every route', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    for (const route of ROUTES) {
      await app.goto(route.path);
      const snapshot = await app.structuralSnapshot();
      expect(snapshot.lang, 'lang on ' + route.path).not.toEqual('');
    }
  });

  /**
   * DEF-105, Major. WCAG 2.1 SC 2.4.2 Page Titled, Level A.
   * Every route sets the same document title, so browser tabs, history entries
   * and bookmarks are indistinguishable and a screen reader announces no page
   * change on navigation.
   */
  test.fail('TC-NAV-007 each route sets a distinct document title, DEF-105', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    const titles = [];
    for (const route of ROUTES) {
      await app.goto(route.path);
      titles.push((await app.structuralSnapshot()).title);
    }

    expect(new Set(titles).size).toBe(ROUTES.length);
  });

  /**
   * DEF-107, Minor. WCAG 2.1 SC 1.3.1 Info and Relationships.
   * The main and nav landmarks are present on the payments and clearance
   * routes but absent on the officer home and settings routes, so landmark
   * navigation is unreliable across the application.
   */
  test.fail('TC-NAV-008 every route exposes a main landmark, DEF-107', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    const missing = [];
    for (const route of ROUTES) {
      await app.goto(route.path);
      const snapshot = await app.structuralSnapshot();
      if (snapshot.landmarkMain === 0) missing.push(route.path);
    }

    expect(missing, 'routes without a main landmark').toEqual([]);
  });

  /**
   * DEF-108, Minor. WCAG 2.1 SC 4.1.2 Name, Role, Value.
   * The icon only control in the application header carries no accessible
   * name, so it is announced only as "button".
   */
  test.fail('TC-NAV-009 every button exposes an accessible name, DEF-108', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    const offenders = [];
    for (const route of ROUTES) {
      await app.goto(route.path);
      const snapshot = await app.structuralSnapshot();
      if (snapshot.unnamedButtons > 0) {
        offenders.push(route.path + ' (' + snapshot.unnamedButtons + ')');
      }
    }

    expect(offenders, 'routes with unnamed buttons').toEqual([]);
  });

  /**
   * DEF-104, Minor. Not an accessibility defect, a testability one.
   * Zero data-testid, data-test or data-cy attributes exist anywhere in the
   * application, so automation is bound to placeholder text and role names
   * that change whenever the copy changes.
   */
  test.fail('TC-NAV-010 stable automation hooks exist on the main routes, DEF-104', async ({ page }) => {
    await loginAsDemoUser(page);
    const app = new AppPage(page);

    await app.goto('/payments/add');
    const snapshot = await app.structuralSnapshot();

    expect(snapshot.testHooks).toBeGreaterThan(0);
  });
});
