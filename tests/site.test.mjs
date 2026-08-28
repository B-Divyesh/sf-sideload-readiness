import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile as execFileCallback } from 'node:child_process';
import { readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const get = (name) => readFile(new URL(`../site/${name}`, import.meta.url), 'utf8');
const getRoot = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const execFile = promisify(execFileCallback);

test('npm clean installs are locked to the declared package', async () => {
  const manifest = JSON.parse(await getRoot('package.json'));
  const lock = JSON.parse(await getRoot('package-lock.json'));
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
});

test('demo source declares the sample and demo namespace', async () => {
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
  const config = await get('staticwebapp.config.json');
  assert.match(html, /Sideload Readiness — Check Android update safety/);
  assert.match(html, /og-concrete-moss/);
  assert.match(config, /Content-Security-Policy/);
});

test('service worker replaces older offline shells during updates', async () => {
  const worker = await get('service-worker.js');
  assert.match(worker, /sideload-readiness-v3/);
  assert.match(worker, /caches\.keys\(\)/);
  assert.match(worker, /caches\.delete\(key\)/);
  assert.match(worker, /self\.clients\.claim\(\)/);
});

test('production build fingerprints code assets and assigns safe cache policies', async () => {
  await execFile(process.execPath, ['scripts/build-site.mjs'], { cwd: new URL('..', import.meta.url).pathname });
  const html = await getRoot('dist/site/index.html');
  const app = html.match(/\/assets\/app\.([a-f0-9]{12})\.js/)?.[0];
  const style = html.match(/\/assets\/style\.([a-f0-9]{12})\.css/)?.[0];
  assert.ok(app, 'fingerprinted app asset is referenced');
  assert.ok(style, 'fingerprinted style asset is referenced');
  await Promise.all([getRoot(`dist/site${app}`), getRoot(`dist/site${style}`)]);
  assert.doesNotMatch(html, /(?:src|href)="\/(?:app\.js|style\.css)"/);
  const worker = await getRoot('dist/site/service-worker.js');
  assert.match(worker, new RegExp(app.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  assert.match(worker, new RegExp(style.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
  const config = JSON.parse(await getRoot('dist/site/staticwebapp.config.json'));
  const immutable = config.routes.find(route => route.route === '/assets/*');
  const serviceWorker = config.routes.find(route => route.route === '/service-worker.js');
  assert.equal(immutable.headers['Cache-Control'], 'public, max-age=31536000, immutable');
  assert.equal(serviceWorker.headers['Cache-Control'], 'no-cache, no-store, must-revalidate');
});
