import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const severe = results => results.violations.filter(item => ['serious', 'critical'].includes(item.impact));
const releaseApi = 'https://api.github.com/repos/B-Divyesh/sf-sideload-readiness/releases/latest';
const releaseRoot = 'https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.4';
const releaseAssets = [
  'sideload-readiness-linux-x86_64.tar.gz',
  'sideload-readiness-macos-aarch64.pkg',
  'sideload-readiness-macos-x86_64.pkg',
  'sideload-readiness-windows-x86_64.zip'
].map(name => ({ name, browser_download_url: `${releaseRoot}/${name}` }));

async function useUserAgent(page, userAgent) {
  await page.addInitScript(value => {
    Object.defineProperty(Navigator.prototype, 'userAgent', { configurable: true, get: () => value });
  }, userAgent);
}

async function mockRelease(page) {
  await page.route(releaseApi, route => route.fulfill({ contentType: 'application/json', body: JSON.stringify({ assets: releaseAssets }) }));
  await page.route(`${releaseRoot}/**`, route => route.fulfill({ body: 'download fixture' }));
}

async function undersizedTargets(page) {
  return page.locator('a:visible, button:visible, input:visible').evaluateAll(elements => elements
    .map(element => ({ label: element.textContent?.trim() || element.getAttribute('aria-label') || element.id, rect: element.getBoundingClientRect() }))
    .filter(item => item.rect.width < 44 || item.rect.height < 44)
    .map(item => ({ label: item.label, width: item.rect.width, height: item.rect.height })));
}

test('landing page has one clear primary route and no console errors', async ({ page }) => {
  const errors = [];
  page.on('console', message => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await expect(page).toHaveTitle('Sideload Readiness — Check Android update safety');
  await expect(page.locator('main h1')).toHaveCount(1);
  await expect(page.locator('main')).toBeVisible();
  await expect(page.getByRole('link', { name: 'Try it with sample data' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Sample readiness report' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 2, name: 'Fleet report review' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Connect one Android device' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Check device and app readiness' })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Follow the report’s next step' })).toBeVisible();
  expect(errors).toEqual([]);
});

test('390px first viewport contains the complete sample action and outcome', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/');
  for (const locator of [
    page.getByRole('link', { name: 'Try it with sample data' }),
    page.getByText('See a redacted report and the next safe step.')
  ]) {
    const box = await locator.boundingBox();
    expect(box).not.toBeNull();
    expect(box.y).toBeGreaterThanOrEqual(0);
    expect(box.y + box.height).toBeLessThanOrEqual(844);
  }
});

test('production responses enforce policy and cache fingerprinted assets immutably', async ({ page }) => {
  const response = await page.goto('/');
  expect(response.headers()['content-security-policy']).toContain("default-src 'self'");
  expect(response.headers()['permissions-policy']).toContain('usb=()');
  expect(response.headers()['permissions-policy']).toContain('serial=()');
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

test('unknown server paths return the designed 404 document with HTTP 404', async ({ page }) => {
  const response = await page.goto('/unambiguously-missing-qa-route');
  expect(response.status()).toBe(404);
  await expect(page).toHaveTitle('Not found — Sideload Readiness');
  await expect(page.getByRole('heading', { level: 1, name: 'That page is not here' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Return to Sideload Readiness' })).toBeVisible();
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://sideload-readiness.sociobot.in/404.html');
  await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', 'Not found — Sideload Readiness');
});

test('demo install link reaches the real install section', async ({ page }) => {
  await page.goto('/?demo=1');
  await page.getByRole('link', { name: 'See install options' }).click();
  await expect(page).toHaveURL(/\/#install$/);
  await expect(page.locator('#install')).toBeInViewport();
  await expect(page.locator('h1')).toBeFocused();
});

for (const { label, userAgent, expectedAsset } of [
  {
    label: 'Windows',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
    expectedAsset: 'sideload-readiness-windows-x86_64.zip'
  },
  {
    label: 'Linux',
    userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
    expectedAsset: 'sideload-readiness-linux-x86_64.tar.gz'
  }
]) {
  test(`detected ${label} downloads use the exact release asset`, async ({ page }) => {
    await useUserAgent(page, userAgent);
    await mockRelease(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Open release downloads' }).click();
    await expect(page).toHaveURL(`${releaseRoot}/${expectedAsset}`);
  });
}

for (const { label, userAgent, expectedChoice, expectedAsset } of [
  {
    label: 'Intel Mac',
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 Chrome/140.0 Safari/537.36',
    expectedChoice: 'Intel Mac (.pkg)',
    expectedAsset: 'sideload-readiness-macos-x86_64.pkg'
  },
  {
    label: 'Apple silicon Mac',
    userAgent: 'Mozilla/5.0 (Macintosh; Apple Silicon Mac OS X 14_6) AppleWebKit/605.1.15 Version/18.6 Safari/605.1.15',
    expectedChoice: 'Apple silicon Mac (.pkg)',
    expectedAsset: 'sideload-readiness-macos-aarch64.pkg'
  }
]) {
  test(`${label} users choose a matching macOS package before download`, async ({ page }) => {
    await useUserAgent(page, userAgent);
    await mockRelease(page);
    await page.goto('/');
    await page.getByRole('link', { name: 'Open release downloads' }).click();
    await expect(page.locator('#download-choices-label')).toBeVisible();
    await expect(page.getByRole('link', { name: expectedChoice })).toHaveAttribute('href', `${releaseRoot}/${expectedAsset}`);
    await expect(page.getByRole('link', { name: 'Intel Mac (.pkg)' })).toHaveAttribute('href', `${releaseRoot}/sideload-readiness-macos-x86_64.pkg`);
    await expect(page.getByRole('link', { name: 'Apple silicon Mac (.pkg)' })).toHaveAttribute('href', `${releaseRoot}/sideload-readiness-macos-aarch64.pkg`);
    await expect(page.locator('#download-status')).toHaveText('Choose Apple silicon or Intel before downloading.');
  });
}

for (const { label, userAgent } of [
  { label: 'Android', userAgent: 'Mozilla/5.0 (Linux; Android 15; Pixel 9) AppleWebKit/537.36 Chrome/140.0 Mobile Safari/537.36' },
  { label: 'iPhone', userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_6 like Mac OS X) AppleWebKit/605.1.15 Version/18.6 Mobile/15E148 Safari/604.1' }
]) {
  test(`${label} does not default to a desktop installer`, async ({ page }) => {
    await useUserAgent(page, userAgent);
    let releaseRequests = 0;
    await page.route(releaseApi, route => { releaseRequests += 1; return route.abort(); });
    await page.goto('/');
    await page.getByRole('link', { name: 'Open release downloads' }).click();
    await expect(page.locator('#download-status')).toHaveText('This browser does not identify a supported desktop system. Open releases to choose a file.');
    await expect(page.locator('#download-choices')).toBeHidden();
    expect(releaseRequests).toBe(0);
  });
}

test('keyboard navigation reaches the demo and reset controls', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  await expect(page.getByRole('link', { name: 'Skip to report' })).toBeFocused();
  await page.getByRole('link', { name: 'Try it with sample data' }).focus();
  await page.keyboard.press('Enter');
  await expect(page).toHaveURL(/\?demo=1$/);
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
  await expect(page).toHaveURL(new URL('/', process.env.BASE_URL || 'http://127.0.0.1:4173').href);
  await expect(page.locator('h1')).toHaveText('Check Android update safety');
  await expect(page.locator('h1')).toBeFocused();
});

for (const expected of [
  { path: '/', title: 'Sideload Readiness — Check Android update safety', canonical: '/', description: 'Check whether an Android device is ready for an approved sideloaded update.' },
  { path: '/?demo=1', title: 'Demo — Sideload Readiness', canonical: '/demo', description: 'Try a redacted Android readiness report with isolated sample data.' },
  { path: '/demo', title: 'Demo — Sideload Readiness', canonical: '/demo', description: 'Try a redacted Android readiness report with isolated sample data.' },
  { path: '/privacy', title: 'Privacy — Sideload Readiness', canonical: '/privacy', description: 'Learn what Sideload Readiness reads, stores, and sends during device checks.' },
  { path: '/terms', title: 'Terms — Sideload Readiness', canonical: '/terms', description: 'Read the terms for using Sideload Readiness with approved Android devices and apps.' }
]) {
  test(`route metadata is specific to ${expected.path}`, async ({ page }) => {
    await page.goto(expected.path);
    await expect(page).toHaveTitle(expected.title);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', `https://sideload-readiness.sociobot.in${expected.canonical}`);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', expected.description);
    await expect(page.locator('meta[property="og:title"]')).toHaveAttribute('content', expected.title);
    await expect(page.locator('meta[property="og:description"]')).toHaveAttribute('content', expected.description);
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute('content', `https://sideload-readiness.sociobot.in${expected.canonical}`);
  });
}

for (const path of ['/', '/demo', '/privacy', '/terms', '/missing']) {
  test(`accessibility has no serious or critical findings on ${path}`, async ({ page }) => {
    await page.goto(path);
    const results = await new AxeBuilder({ page }).analyze();
    expect(severe(results)).toEqual([]);
  });
}

test('mobile layout has no horizontal overflow and every route meets touch size', async ({ page }, testInfo) => {
  test.skip(testInfo.project.name !== 'mobile', 'mobile project only');
  for (const path of ['/', '/demo', '/privacy', '/terms']) {
    await page.goto(path);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
    expect(await undersizedTargets(page)).toEqual([]);
  }
  await page.goto('/');
  await page.evaluate(() => localStorage.setItem('sb_license_verdict:sideload-readiness', JSON.stringify({ valid: true, checked_at: Date.now() })));
  await page.reload();
  await expect(page.locator('#fleet-files')).toBeVisible();
  expect(await undersizedTargets(page)).toEqual([]);
});

test('reduced motion and 200% text preserve the report', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto('/demo');
  const motion = await page.locator('.finding').first().evaluate(element => {
    const style = getComputedStyle(element);
    return { animation: style.animationName, transition: style.transitionDuration };
  });
  expect(motion.animation).toBe('none');
  expect(Number.parseFloat(motion.transition)).toBeLessThanOrEqual(0.001);
  await page.evaluate(() => { document.documentElement.style.fontSize = '200%'; });
  await expect(page.locator('h1')).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reset demo' })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth)).toBe(true);
});

test('@claim:local-demo the sample uses only its demo storage namespace', async ({ page }) => {
  await page.addInitScript(() => localStorage.setItem('real:sentinel', 'must-survive'));
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  const keys = await page.evaluate(() => Object.keys(localStorage).sort());
  expect(keys).toEqual(['demo:sideload-readiness', 'real:sentinel']);
  expect(await page.evaluate(() => localStorage.getItem('demo:sideload-readiness'))).toContain('device-6f31a0b2');
  await page.getByRole('link', { name: 'Start for real' }).click();
  expect(await page.evaluate(() => localStorage.getItem('demo:sideload-readiness'))).toBeNull();
  expect(await page.evaluate(() => localStorage.getItem('real:sentinel'))).toBe('must-survive');
});

test('@claim:browser-demo-no-device the browser sample never requests WebUSB or Web Serial access', async ({ page }) => {
  await page.addInitScript(() => {
    sessionStorage.setItem('device-api-requests', sessionStorage.getItem('device-api-requests') || '0');
    const recordRequest = () => {
      const count = Number(sessionStorage.getItem('device-api-requests') || '0');
      sessionStorage.setItem('device-api-requests', String(count + 1));
      return Promise.reject(new DOMException('Blocked by the test sandbox', 'NotAllowedError'));
    };
    Object.defineProperty(Navigator.prototype, 'usb', {
      configurable: true,
      get: () => ({ requestDevice: recordRequest, getDevices: recordRequest })
    });
    Object.defineProperty(Navigator.prototype, 'serial', {
      configurable: true,
      get: () => ({ requestPort: recordRequest, getPorts: recordRequest })
    });
  });
  await page.goto('/');
  await page.getByRole('link', { name: 'Try it with sample data' }).click();
  await expect(page).toHaveURL(/\?demo=1$/);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.reload();
  await expect(page.getByText('Demo — sample data, nothing is saved.')).toBeVisible();
  await page.getByRole('link', { name: 'Start for real' }).click();
  expect(await page.evaluate(() => Number(sessionStorage.getItem('device-api-requests')))).toBe(0);
});

test('starting for real discards the demo storage namespace', async ({ page }) => {
  await page.goto('/demo');
  expect(await page.evaluate(() => localStorage.getItem('demo:sideload-readiness'))).not.toBeNull();
  await page.getByRole('link', { name: 'Start for real' }).click();
  await expect(page).toHaveURL(new URL('/', process.env.BASE_URL || 'http://127.0.0.1:4173').href);
  expect(await page.evaluate(() => localStorage.getItem('demo:sideload-readiness'))).toBeNull();
});

test('@claim:privacy page loads and the full demo flow make no third-party requests', async ({ page }) => {
  const external = [];
  const productOrigin = new URL(process.env.BASE_URL || 'http://127.0.0.1:4173').origin;
  page.on('request', request => {
    if (new URL(request.url()).origin !== productOrigin) external.push(request.url());
  });
  await page.goto('/');
  await page.goto('/demo');
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await page.reload();
  await page.goto('/privacy');
  await page.goto('/terms');
  expect(external).toEqual([]);
  expect(await page.evaluate(() => Object.keys(localStorage))).toEqual([]);
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
    buffer: Buffer.from(JSON.stringify({ schema: 'sideload-readiness/v1', device: { id: 'device-1234abcd', android: '15' }, score: 83 }))
  });
  await expect(page.getByText('1 local report queued.')).toBeVisible();
  await expect(page.getByRole('cell', { name: 'device-1234abcd' })).toBeVisible();
});

test('fleet imports reject forged and invalid reports with an announced recovery step', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:sideload-readiness', 'fixture-license');
    localStorage.setItem('sb_license_verdict:sideload-readiness', JSON.stringify({ valid: true, checked_at: Date.now() }));
  });
  await page.goto('/');
  const input = page.getByLabel('Add redacted JSON reports');
  await input.setInputFiles({
    name: 'forged.json',
    mimeType: 'application/json',
    buffer: Buffer.from(JSON.stringify({ schema: 'sideload-readiness/v1', device: { id: '<a href="https://example.invalid">device</a>', android: '15' }, score: 83 }))
  });
  await expect(page.locator('#fleet-table')).toContainText('No reports added. forged.json is not a valid redacted Sideload Readiness report.');
  await expect(page.locator('#fleet-table a')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('fleet:reports'))).toBe('[]');

  await input.setInputFiles({ name: 'broken.json', mimeType: 'application/json', buffer: Buffer.from('{not json') });
  await expect(page.locator('#fleet-table')).toContainText('Choose a JSON report exported by the CLI.');
});

test('@claim:license-retention expired license results are removed before an unavailable recheck', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:sideload-readiness', 'fixture-license');
    localStorage.setItem('sb_license_verdict:sideload-readiness', JSON.stringify({ valid: true, checked_at: Date.now() - 172_800_000 }));
  });
  await page.route('https://api.sociobot.in/api/v1/products/sideload-readiness/verify?**', route => route.abort());
  await page.goto('/');
  await expect(page.locator('#license-status')).toContainText('could not be checked');
  await expect(page.locator('#fleet-tools')).toHaveCount(0);
  expect(await page.evaluate(() => localStorage.getItem('sb_license_verdict:sideload-readiness'))).toBeNull();
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

test('release lookup failures stay recoverable', async ({ browser }) => {
  const context = await browser.newContext({ serviceWorkers: 'block' });
  const page = await context.newPage();
  await useUserAgent(page, 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/140.0 Safari/537.36');
  await page.route(releaseApi, route => route.abort());
  await page.goto('/');
  await page.getByRole('link', { name: 'Open release downloads' }).click();
  await expect(page.locator('#download-status')).toContainText('Downloads are being published');
  await expect(page.getByRole('link', { name: 'Open release downloads' })).toHaveAttribute('href', 'https://github.com/B-Divyesh/sf-sideload-readiness/releases');
  await context.close();
});
