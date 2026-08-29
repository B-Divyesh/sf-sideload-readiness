import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.argv[2] || 'https://sideload-readiness.sociobot.in';
const browser = await chromium.launch();
const evidence = { baseURL, identity: {}, routes: {}, consoleErrors: [], expectedNotFoundNetworkErrors: 0, mobile: {}, offline: false };

const localIndex = await readFile(resolve('dist/site/index.html'));
const indexText = localIndex.toString('utf8');
const fingerprinted = [...indexText.matchAll(/(?:href|src)="(\/assets\/[^"]+)"/g)].map(match => match[1]);
for (const [route, localPath] of [
  ['/', 'index.html'],
  ...fingerprinted.map(route => [route, route.slice(1)]),
  ['/service-worker.js', 'service-worker.js'],
  ['/public/hero-concrete-moss-768.webp', 'public/hero-concrete-moss-768.webp']
]) {
  const [local, response] = await Promise.all([
    readFile(resolve('dist/site', localPath)),
    fetch(`${baseURL}${route}`, { cache: 'no-store' })
  ]);
  assert.equal(response.status, 200, `${route} must load for identity verification`);
  const remote = Buffer.from(await response.arrayBuffer());
  assert.deepEqual(remote, local, `${route} must byte-match the local production build`);
  evidence.identity[route] = createHash('sha256').update(remote).digest('hex');
}

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

  const mobile = await browser.newContext({ ...devices['Pixel 5'], viewport: { width: 390, height: 844 } });
  const mobilePage = await mobile.newPage();
  const external = [];
  mobilePage.on('request', request => {
    if (new URL(request.url()).origin !== new URL(baseURL).origin) external.push(request.url());
  });
  await mobilePage.goto(baseURL, { waitUntil: 'networkidle' });
  const sampleAction = await mobilePage.getByRole('link', { name: 'Try it with sample data' }).boundingBox();
  const actionOutcome = await mobilePage.getByText('See a redacted report and the next safe step.').boundingBox();
  assert.ok(sampleAction && sampleAction.y + sampleAction.height <= 844);
  assert.ok(actionOutcome && actionOutcome.y + actionOutcome.height <= 844);
  evidence.mobile.firstViewport = { sampleAction, actionOutcome };
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
