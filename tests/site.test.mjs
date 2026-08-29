import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const get = name => readFile(new URL(`../site/${name}`, import.meta.url), 'utf8');
const getRoot = name => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const exec = promisify(execFile);

test('npm clean installs are locked to the declared package', async () => {
  const manifest = JSON.parse(await getRoot('package.json'));
  const lock = JSON.parse(await getRoot('package-lock.json'));
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
});

test('browser claim commands install their declared clean-clone prerequisites', async () => {
  const claims = JSON.parse(await getRoot('.factory/claims.json'));
  const browserClaims = claims.filter(({ test: command }) => command.includes('test:browser'));
  assert.equal(browserClaims.length, 6);
  for (const claim of browserClaims) assert.match(claim.test, /^npm ci && npm run test:browser/);
});

test('published CLI file-safety promises have one tagged public-command claim each', async () => {
  const claims = JSON.parse(await getRoot('.factory/claims.json'));
  const cli = await getRoot('tests/cli.rs');
  const expected = [
    ['private-demo-file', 'claim_automatic_demo_file_is_private_and_never_reuses_a_name'],
    ['explicit-output-replacement', 'claim_explicit_demo_output_replaces_the_requested_file']
  ];
  for (const [id, testName] of expected) {
    const matching = claims.filter(claim => claim.id === id);
    assert.equal(matching.length, 1, `${id} is declared once`);
    assert.equal(matching[0].test, `cargo test --test cli ${testName} -- --exact`);
    const tag = new RegExp(`@claim:${id}`, 'g');
    assert.equal([...cli.matchAll(tag)].length, 1, `${id} has one test tag`);
    assert.match(cli, new RegExp(`@claim:${id}\\nfn ${testName}`));
  }
});

test('every declared claim has exactly one tagged executable test', async () => {
  const claims = JSON.parse(await getRoot('.factory/claims.json'));
  const sources = await Promise.all([
    'tests/cli.rs',
    'tests/release.test.mjs',
    'tests/browser/site.spec.mjs',
    'scripts/verify-billing.mjs'
  ].map(getRoot));
  const all = sources.join('\n');
  assert.equal(new Set(claims.map(claim => claim.id)).size, claims.length, 'claim ids are unique');
  for (const claim of claims) {
    const escaped = claim.id.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    assert.equal([...all.matchAll(new RegExp(`@claim:${escaped}(?![a-z0-9-])`, 'g'))].length, 1, `${claim.id} has exactly one tagged test`);
  }
});

test('the sample report source uses the isolated demo namespace', async () => {
  const app = await get('app.js');
  assert.match(app, /Try it with sample data/);
  assert.match(app, /DEMO_REPORT/);
  assert.match(app, /demo:/);
});

test('site source declares no third-party runtime code', async () => {
  const html = await get('index.html');
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//);
  assert.match(html, /<main id="main"/);
  assert.match(html, /<html lang="en"/);
});

test('site has required routes and metadata', async () => {
  const html = await get('index.html');
  const config = JSON.parse(await get('staticwebapp.config.json'));
  assert.match(html, /Sideload Readiness — Check Android update safety/);
  assert.match(html, /og-concrete-moss/);
  assert.match(config.globalHeaders['Content-Security-Policy'], /default-src 'self'/);
  assert.match(config.globalHeaders['Permissions-Policy'], /usb=\(\)/);
  assert.match(config.globalHeaders['Permissions-Policy'], /serial=\(\)/);
  assert.equal(config.navigationFallback, undefined);
  assert.deepEqual(
    config.routes.filter(route => route.rewrite === '/index.html').map(route => route.route),
    ['/demo', '/privacy', '/terms']
  );
  assert.deepEqual(config.responseOverrides['404'], { rewrite: '/404.html' });
});

test('catalog description is verb-first and at most 120 characters', async () => {
  const description = (await getRoot('.factory/catalog-description.txt')).trim();
  assert.ok(description.length <= 120);
  assert.match(description, /^(?:Check|Create|Find|Review|Test|Verify)\b/);
});

test('server 404 uses direct recovery copy', async () => {
  const notFound = await get('404.html');
  assert.match(notFound, /Page not found/);
  assert.match(notFound, /Check the address or return to the readiness check\./);
  assert.doesNotMatch(notFound, /concrete edge|report path has ended/i);
});

test('below-fold sections are painted for printing and full-page capture', async () => {
  const css = await get('style.css');
  assert.doesNotMatch(css, /content-visibility\s*:\s*auto/);
  assert.match(css, /main:empty\{min-height:6500px\}/);
});

test('service worker replaces older offline shells during updates', async () => {
  const worker = await get('service-worker.js');
  assert.match(worker, /sideload-readiness-v4-__ASSET_VERSION__/);
  assert.match(worker, /caches\.keys\(\)/);
  assert.match(worker, /caches\.delete\(key\)/);
  assert.match(worker, /self\.clients\.claim\(\)/);
});

test('production build fingerprints code assets and gives them immutable caching', async () => {
  await exec(process.execPath, [new URL('../scripts/build-site.mjs', import.meta.url).pathname], {
    cwd: new URL('..', import.meta.url).pathname
  });
  const html = await getRoot('dist/site/index.html');
  const notFound = await getRoot('dist/site/404.html');
  const assets = await readdir(new URL('../dist/site/assets', import.meta.url));
  const config = JSON.parse(await getRoot('dist/site/staticwebapp.config.json'));
  assert.match(html, /\/assets\/style\.[a-f0-9]{12}\.css/);
  assert.match(html, /\/assets\/app\.[a-f0-9]{12}\.js/);
  assert.match(notFound, /\/assets\/style\.[a-f0-9]{12}\.css/);
  assert.equal(assets.length, 2);
  const immutable = config.routes.find(route => route.route === '/assets/*');
  assert.equal(immutable.headers['Cache-Control'], 'public, max-age=31536000, immutable');
  const serviceWorkerPolicy = config.routes.find(route => route.route === '/service-worker.js');
  assert.equal(serviceWorkerPolicy.headers['Cache-Control'], 'no-cache');
  const worker = await getRoot('dist/site/service-worker.js');
  assert.doesNotMatch(worker, /__ASSET_VERSION__/);
  assert.match(worker, /\/assets\/app\.[a-f0-9]{12}\.js/);
  assert.match(worker, /\/assets\/style\.[a-f0-9]{12}\.css/);
});
