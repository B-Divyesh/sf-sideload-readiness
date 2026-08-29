import assert from 'node:assert/strict';
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.argv[2] || 'https://sideload-readiness.sociobot.in';
const browser = await chromium.launch();
const evidence = { baseURL, routes: {}, consoleErrors: [], expectedNotFoundNetworkErrors: 0, mobile: {}, offline: false };

try {
  const desktop = await browser.newContext({ ...devices['Desktop Chrome'] });
  const page = await desktop.newPage();
  let checkingIntentionalNotFound = false;
  page.on('pageerror', error => evidence.consoleErrors.push(String(error)));
  page.on('console', message => {
    const text = message.text();
    if (checkingIntentionalNotFound && message.type() === 'error' && /Failed to load resource: the server responded with a status of 404/.test(text)) {
      evidence.expectedNotFoundNetworkErrors += 1;
      return;
    }
    if (message.type() === 'error') evidence.consoleErrors.push(text);
  });
  for (const route of ['/', '/demo', '/privacy', '/terms', '/unambiguously-missing-qa-route']) {
    checkingIntentionalNotFound = route === '/unambiguously-missing-qa-route';
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
    const violations = (await new AxeBuilder({ page }).analyze()).violations
      .filter(item => ['serious', 'critical'].includes(item.impact));
    evidence.routes[route] = {
      status: response.status(),
      title: await page.title(),
      h1: await page.locator('h1').count(),
      seriousOrCriticalAxe: violations.length
    };
    assert.equal(response.status(), route === '/unambiguously-missing-qa-route' ? 404 : 200);
    assert.equal(evidence.routes[route].h1, 1);
    assert.equal(violations.length, 0);
    checkingIntentionalNotFound = false;
  }
  await page.goto(baseURL);
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('link', { name: 'Skip to report' }).evaluate(element => element === document.activeElement), true);
  await desktop.close();

  const mobile = await browser.newContext({ ...devices['Pixel 5'] });
  const mobilePage = await mobile.newPage();
  const external = [];
  mobilePage.on('request', request => {
    if (new URL(request.url()).origin !== new URL(baseURL).origin) external.push(request.url());
  });
  await mobilePage.goto(`${baseURL}/demo`, { waitUntil: 'networkidle' });
  evidence.mobile.noHorizontalOverflow = await mobilePage.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  evidence.mobile.undersizedTargets = await mobilePage.locator('a:visible, button:visible, input:visible').evaluateAll(elements => elements
    .map(element => ({ label: element.textContent?.trim() || element.getAttribute('aria-label'), rect: element.getBoundingClientRect() }))
    .filter(item => item.rect.width < 44 || item.rect.height < 44)
    .map(item => item.label));
  evidence.mobile.externalRequests = external;
  assert.equal(evidence.mobile.noHorizontalOverflow, true);
  assert.deepEqual(evidence.mobile.undersizedTargets, []);
  assert.deepEqual(external, []);
  await mobilePage.waitForFunction(async () => Boolean((await navigator.serviceWorker.ready).active));
  await mobilePage.reload();
  await mobile.setOffline(true);
  await mobilePage.reload();
  await mobilePage.getByRole('heading', { level: 1, name: 'Find the next safe step' }).waitFor();
  evidence.offline = true;
  await mobile.close();
} finally {
  await browser.close();
}

assert.deepEqual(evidence.consoleErrors, []);
console.log(JSON.stringify(evidence, null, 2));
