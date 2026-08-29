import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';
import { chromium, devices } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const baseURL = process.argv[2] || 'https://sideload-readiness.sociobot.in';
const browser = await chromium.launch();
const evidence = { baseURL, identity: {}, routes: {}, consoleErrors: [], expectedNotFoundNetworkErrors: 0, mobile: {}, demoIsolation: {}, offline: false };

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
  const routes = [
    ['/', 200, 'Sideload Readiness — Check Android update safety', '/', 'Check whether an Android device is ready for an approved sideloaded update.'],
    ['/?demo=1', 200, 'Demo — Sideload Readiness', '/demo', 'Try a redacted Android readiness report with isolated sample data.'],
    ['/demo', 200, 'Demo — Sideload Readiness', '/demo', 'Try a redacted Android readiness report with isolated sample data.'],
    ['/privacy', 200, 'Privacy — Sideload Readiness', '/privacy', 'Learn what Sideload Readiness reads, stores, and sends during device checks.'],
    ['/terms', 200, 'Terms — Sideload Readiness', '/terms', 'Read the terms for using Sideload Readiness with approved Android devices and apps.'],
    ['/unambiguously-missing-qa-route', 404, 'Not found — Sideload Readiness', '/404.html', 'The requested Sideload Readiness page could not be found.']
  ];
  for (const [route, status, title, canonicalPath, description] of routes) {
    checkingIntentionalNotFound = route === '/unambiguously-missing-qa-route';
    const response = await page.goto(`${baseURL}${route}`, { waitUntil: 'networkidle' });
    const violations = (await new AxeBuilder({ page }).analyze()).violations
      .filter(item => ['serious', 'critical'].includes(item.impact));
    evidence.routes[route] = {
      status: response.status(),
      title: await page.title(),
      canonical: await page.locator('link[rel="canonical"]').getAttribute('href'),
      description: await page.locator('meta[name="description"]').getAttribute('content'),
      ogTitle: await page.locator('meta[property="og:title"]').getAttribute('content'),
      ogUrl: await page.locator('meta[property="og:url"]').getAttribute('content'),
      h1: await page.locator('h1').count(),
      seriousOrCriticalAxe: violations.length
    };
    assert.equal(response.status(), status);
    assert.equal(evidence.routes[route].title, title);
    assert.equal(evidence.routes[route].canonical, `${baseURL}${canonicalPath}`);
    assert.equal(evidence.routes[route].description, description);
    assert.equal(evidence.routes[route].ogTitle, title);
    assert.equal(evidence.routes[route].ogUrl, `${baseURL}${canonicalPath}`);
    assert.equal(evidence.routes[route].h1, 1);
    assert.equal(violations.length, 0);
    checkingIntentionalNotFound = false;
  }
  await page.goto(baseURL);
  await page.keyboard.press('Tab');
  assert.equal(await page.getByRole('link', { name: 'Skip to report' }).evaluate(element => element === document.activeElement), true);
  await page.getByRole('heading', { level: 2, name: 'Install the command-line tool' }).waitFor();
  await page.getByRole('heading', { level: 2, name: 'How the readiness check works' }).waitFor();
  await page.getByRole('heading', { level: 3, name: 'What the CLI checks' }).waitFor();
  await page.getByRole('heading', { level: 3, name: 'What the CLI never does' }).waitFor();
  await page.evaluate(() => localStorage.setItem('real:sentinel', 'must-survive'));
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  assert.match(page.url(), /\?demo=1$/);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  const demoKeys = await page.evaluate(() => Object.keys(localStorage).sort());
  assert.deepEqual(demoKeys, ['demo:sideload-readiness', 'real:sentinel']);
  await page.getByRole('link', { name: 'Start for real' }).click();
  evidence.demoIsolation = {
    enteredAt: `${baseURL}/?demo=1`,
    resetKeys: demoKeys,
    demoKeyAfterExit: await page.evaluate(() => localStorage.getItem('demo:sideload-readiness')),
    realSentinelAfterExit: await page.evaluate(() => localStorage.getItem('real:sentinel'))
  };
  assert.equal(evidence.demoIsolation.demoKeyAfterExit, null);
  assert.equal(evidence.demoIsolation.realSentinelAfterExit, 'must-survive');
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
