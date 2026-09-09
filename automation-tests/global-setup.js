import { chromium } from '@playwright/test';

/**
 * Environment preflight.
 *
 * A suite should tell you when it did not run, and why. Before any spec
 * executes, this opens the application once and checks that it renders its
 * sign in form.
 *
 * If it does not, the specs that need the application skip with a stated
 * reason instead of failing many times over against an environment that was
 * never up. An unavailable environment is not a product defect, and a suite
 * that reports it as one is a suite nobody trusts.
 *
 * When the check fails it prints what it did find, so the next person does not
 * have to guess: final route, document title, headings, how many inputs
 * rendered, and any page error. That output is what identified DEF-111.
 *
 * Entry is at the site root, not /login, because a direct request to any sub
 * route returns the deployment's 404 page. That is DEF-111 itself, and it is
 * covered by its own test case rather than being papered over here.
 */

const BASE_URL = process.env.BASE_URL || 'https://aviihai.vercel.app';

export default async function globalSetup() {
  const browser = await chromium.launch();
  const page = await browser.newPage();

  const pageErrors = [];
  const consoleErrors = [];
  page.on('pageerror', (error) => pageErrors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') consoleErrors.push(message.text());
  });

  let reachable = false;

  try {
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.locator('input[type="email"]').waitFor({ state: 'visible', timeout: 25000 });
    reachable = true;
  } catch (error) {
    const diagnostics = await page.evaluate(() => ({
      route: window.location.pathname,
      title: document.title,
      readyState: document.readyState,
      headings: Array.from(document.querySelectorAll('h1, h2')).map((h) => h.textContent.trim()),
      inputCount: document.querySelectorAll('input').length,
      inputTypes: Array.from(document.querySelectorAll('input')).map((i) => i.type),
      buttonLabels: Array.from(document.querySelectorAll('button')).map((b) => b.textContent.trim()),
      bodyLength: document.body.innerText.length,
      firstText: document.body.innerText.slice(0, 300),
    })).catch(() => null);

    console.log('');
    console.log('PREFLIGHT FAILED. The application did not render its sign in form.');
    console.log('Reason: ' + error.message.split('\n')[0]);
    console.log('Diagnostics: ' + JSON.stringify(diagnostics, null, 2));
    console.log('Page errors: ' + JSON.stringify(pageErrors.slice(0, 5)));
    console.log('Console errors: ' + JSON.stringify(consoleErrors.slice(0, 5)));
    console.log('');

    await page.screenshot({ path: 'test-results/preflight-failure.png', fullPage: true })
      .catch(() => {});
  }

  await browser.close();

  process.env.APP_REACHABLE = reachable ? '1' : '';

  console.log('Preflight: application ' + (reachable ? 'is reachable' : 'is NOT reachable'));
}
