import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';

const get = (name) => readFile(new URL(`../site/${name}`, import.meta.url), 'utf8');
test('@claim:local-demo the sample report is present and local', async () => {
  const html = await get('index.html');
  const app = await get('app.js');
  assert.match(html, /Try it with sample data/);
  assert.match(app, /DEMO_REPORT/);
  assert.match(app, /demo:/);
});
test('@claim:privacy no third-party runtime code is declared', async () => {
  const html = await get('index.html');
  assert.doesNotMatch(html, /https?:\/\/(?!sideload-readiness\.sociobot\.in)/);
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
