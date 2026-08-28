import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { readdir, readFile } from 'node:fs/promises';
import { promisify } from 'node:util';

const get = (name) => readFile(new URL(`../site/${name}`, import.meta.url), 'utf8');
const getRoot = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const exec = promisify(execFile);

test('npm clean installs are locked to the declared package', async () => {
  const manifest = JSON.parse(await getRoot('package.json'));
  const lock = JSON.parse(await getRoot('package-lock.json'));
  assert.equal(lock.lockfileVersion, 3);
  assert.equal(lock.name, manifest.name);
  assert.equal(lock.version, manifest.version);
  assert.deepEqual(lock.packages[''].devDependencies, manifest.devDependencies);
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
  const config = await get('staticwebapp.config.json');
  assert.match(html, /Sideload Readiness — Check Android update safety/);
  assert.match(html, /og-concrete-moss/);
  assert.match(config, /Content-Security-Policy/);
});

test('service worker replaces older offline shells during updates', async () => {
  const worker = await get('service-worker.js');
  assert.match(worker, /sideload-readiness-v3-__ASSET_VERSION__/);
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
  const worker = await getRoot('dist/site/service-worker.js');
  assert.doesNotMatch(worker, /__ASSET_VERSION__/);
  assert.match(worker, /\/assets\/app\.[a-f0-9]{12}\.js/);
  assert.match(worker, /\/assets\/style\.[a-f0-9]{12}\.css/);
});
