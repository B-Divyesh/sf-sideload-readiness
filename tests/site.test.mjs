import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const get = (name) => readFile(new URL(`../site/${name}`, import.meta.url), 'utf8');
const getRoot = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');

test('npm clean installs are locked to the declared package', async () => {
  const manifest = JSON.parse(await getRoot('package.json'));
  const lock = JSON.parse(await getRoot('package-lock.json'));
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
});

test('@claim:local-demo the sample report is present and local', async () => {
  const app = await get('app.js');
  assert.match(app, /Try it with sample data/);
  assert.match(app, /DEMO_REPORT/);
  assert.match(app, /demo:/);
});
test('@claim:privacy no third-party runtime code is declared', async () => {
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
  assert.match(worker, /sideload-readiness-v2/);
  assert.match(worker, /caches\.keys\(\)/);
  assert.match(worker, /caches\.delete\(key\)/);
  assert.match(worker, /self\.clients\.claim\(\)/);
});
