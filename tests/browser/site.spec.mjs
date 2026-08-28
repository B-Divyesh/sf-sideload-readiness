import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const severe = results => results.violations.filter(item => ['serious', 'critical'].includes(item.impact));

test('landing page has one clear primary route and no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle('Sideload Readiness — Check Android update safety');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('production responses enforce policy and cache fingerprinted assets immutably', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
  const assetUrls = await page.locator('link[rel="stylesheet"], script[src]').evaluateAll(elements => elements.map(element => element.href || element.src));
  expect(assetUrls).toHaveLength(2);
  for (const url of assetUrls) {
    expect(url).toMatch(/\/assets\/(?:app|style)\.[a-f0-9]{12}\.(?:js|css)$/);
    const assetResponse = await page.request.get(url);
    expect(assetResponse.headers()['cache-control']).toBe('public, max-age=31536000, immutable');
  }
  const workerResponse = await page.request.get('/service-worker.js');
  expect(workerResponse.headers()['cache-control']).toBe('no-cache');
});

test('keyboard navigation reaches the demo and reset controls', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to report' })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\/demo$/);
  await expect(page.locator('h1')).toHaveText('Find the next safe step');
  await page.getByRole('button', { name: 'Reset demo' }).focus();
  await page.keyboard.press('Space');
  await expect(page.locator('h1')).toBeFocused();
  expect(await page.evaluate(() => localStorage.getItem('demo:sideload-readiness'))).toContain('device-6f31a0b2');
});

test('history navigation restores the route and focus', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await page.goBack();
  await expect(page).toHaveURL('http://127.0.0.1:4173/');
  await expect(page.locator('h1')).toHaveText('Check Android update safety');
  await expect(page.locator('h1')).toBeFocused();
});

for (const path of ['/', '/demo', '/privacy', '/terms', '/missing']) {
  test(`accessibility has no serious or critical findings on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(severe(results)).toEqual([]);
  });
}

test('mobile layout has no horizontal overflow and visible controls meet touch size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  await page.goto('/demo');
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
  const undersized = await page.locator('a:visible, button:visible, input:visible').evaluateAll(elements => elements
    .map(element => ({ label: element.textContent?.trim() || element.getAttribute('aria-label') || element.id, rect: element.getBoundingClientRect() }))
    .filter(item => item.rect.width < 44 || item.rect.height < 44)
    .map(item => ({ label: item.label, width: item.rect.width, height: item.rect.height })));
  expect(undersized).toEqual([]);
});

test('@claim:local-demo the sample uses only its demo storage namespace', async ({ page }) => {
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage));
  expect(keys).toEqual(['demo:sideload-readiness']);
  expect(await page.evaluate(() => localStorage.getItem('demo:sideload-readiness'))).toContain('device-6f31a0b2');
});

test('@claim:privacy page loads and the full demo flow make no third-party requests', async ({ page }) => {
  const external = [];
  page.on('request', request => {
    if (new URL(request.url()).origin !== 'http://127.0.0.1:4173') external.push(request.url());
  });
  await page.goto('/');
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.reload();
  await page.goto('/privacy');
  await page.goto('/terms');
  expect(external).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual(['demo:sideload-readiness']);
});

test('@claim:fleet-review a cached valid license enables the local report queue', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:sideload-readiness', 'fixture-license');
    localStorage.setItem('sb_license_verdict:sideload-readiness', JSON.stringify({ valid: true, checked_at: Date.now() }));
  });
  await page.goto('/');
  await expect(page.locator('.price')).toContainText('$39');
  await expect(page.getByRole('link', { name: 'Buy fleet review' })).toHaveAttribute('href', 'https://api.sociobot.in/api/v1/products/sideload-readiness/checkout');
  await expect(page.getByLabel('Add redacted JSON reports')).toBeVisible();
  await page.getByLabel('Add redacted JSON reports').setInputFiles({
    name: 'sample-report.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schema: 'sideload-readiness/v1', device: { id: 'device-test', android: '15' }, score: 83 }))
  });
  await expect(page.getByText('1 local report queued.')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'device-test' })).toBeVisible();
});

test('@claim:license-verification sends a pasted token only to Sociobot on submit', async ({ page }) => {
  let requested;
  await page.route('https://api.sociobot.in/api/v1/products/sideload-readiness/verify?**', async route => {
    requested = route.request().url();
    await route.fulfill({ status: 200, contentType: 'application/json', headers: { 'access-control-allow-origin': '*' }, body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await page.goto('/');
  await page.getByLabel('Have a license? Paste it here.').fill('fixture license');
  await page.getByRole('button', { name: 'Verify fleet license' }).click();
  await expect(page.locator('#license-status')).toHaveText('Fleet review is active on this browser.');
  expect(requested).toBe('https://api.sociobot.in/api/v1/products/sideload-readiness/verify?license=fixture%20license');
});

test('service worker activates and the demo reloads offline', async ({ page, context }) => {
  await page.goto('/demo');
  await page.waitForFunction(async () => {
    const registration = await navigator.serviceWorker.ready;
    return Boolean(registration.active);
  });
  await page.reload();
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('h1')).toHaveText('Find the next safe step');
  await expect(page.getByText('device-6f31a0b2')).toBeVisible();
});

test('release lookup selects an OS artifact and fails softly', async ({ browser }, testInfo) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  const expectedAsset = testInfo.project.name === 'mobile'
    ? 'sideload-readiness-linux-x86_64.tar.gz'
    : 'sideload-readiness-windows-x86_64.zip';
  await page.route('**/repos/B-Divyesh/sf-sideload-readiness/releases/latest', route => route.fulfill({
    status: 200,
    contentType: 'application/json',
    headers: { 'access-control-allow-origin': '*' },
    body: JSON.stringify({ assets: [
      { name: 'sideload-readiness-linux-x86_64.tar.gz', browser_download_url: 'https://example.invalid/release.tar.gz' },
      { name: 'sideload-readiness-windows-x86_64.zip', browser_download_url: 'https://example.invalid/release.zip' }
    ] })
  }));
  await page.goto('/');
  await page.getByRole('link', { name: 'Open release downloads' }).click();
  await expect(page.getByRole('link', { name: `Download ${expectedAsset}` })).toHaveAttribute('href', testInfo.project.name === 'mobile' ? 'https://example.invalid/release.tar.gz' : 'https://example.invalid/release.zip');

  await page.evaluate(() => localStorage.removeItem('sideload-readiness:release'));
  await page.reload();
  await page.unroute('**/repos/B-Divyesh/sf-sideload-readiness/releases/latest');
  await page.route('**/repos/B-Divyesh/sf-sideload-readiness/releases/latest', route => route.abort());
  await page.getByRole('link', { name: 'Open release downloads' }).click();
  await expect(page.locator('#download-status')).toContainText('Downloads are being published');
  await context.close();
});
