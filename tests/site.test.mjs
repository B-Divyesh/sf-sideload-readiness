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
    ['cli-report-storage', 'claim_cli_report_storage_matches_privacy_disclosure'],
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

test('privacy copy distinguishes regular output from automatic demo files', async () => {
  const [app, readme, claims] = await Promise.all([
    get('app.js'),
    getRoot('README.md'),
    getRoot('.factory/claims.json').then(JSON.parse)
  ]);
  assert.match(app, /A regular check writes a report file only with <code>--output PATH<\/code>/);
  assert.match(app, /A demo without <code>--output<\/code> creates a private temporary report/);
  assert.match(app, /The CLI never uploads reports/);
  assert.match(readme, /A regular check writes a file only with\s+`--output PATH`/);
  assert.match(readme, /A demo without `--output` creates a private temporary file/);
  assert.match(readme, /The CLI has no report-upload command/);
  const claim = claims.find(item => item.id === 'cli-report-storage');
  assert.deepEqual(claim, {
    id: 'cli-report-storage',
    claim: 'A regular check writes a report file only with --output; a demo without --output creates a private temporary file and prints its path.',
    where: 'Privacy page and README',
    test: 'cargo test --test cli claim_cli_report_storage_matches_privacy_disclosure -- --exact',
    sandbox: 'Run a public regular check and demo in isolated temporary paths; assert only the requested regular output is written and the automatic demo file is private.'
  });
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

test('first-read operating headings name their Android readiness tasks', async () => {
  const [app, readme] = await Promise.all([get('app.js'), getRoot('README.md')]);
  for (const heading of [
    'Connect one Android device',
    'Check device and app readiness',
    'Follow the report’s next step'
  ]) assert.match(app, new RegExp(`<h3>${heading}</h3>`));
  assert.match(readme, /^## Run a device readiness check$/m);
});

test('site source declares no third-party runtime code', async () => {
  const html = await get('index.html');
  assert.doesNotMatch(html, /<script[^>]+src=["']https?:\/\//);
  assert.match(html, /<main id="main"/);
  assert.match(html, /<html lang="en"/);
});

test('static and generated external links disclose their destination', async () => {
  const [app, html, notFound] = await Promise.all([get('app.js'), get('index.html'), get('404.html')]);
  assert.match(app, /Open releases on GitHub \(external\)/);
  assert.match(app, /Buy fleet review through Sociobot \(external checkout\)/);
  assert.match(app, /Mac \(\.pkg\) on GitHub \(external\)/);
  assert.match(app, /Download \$\{asset\.name\} from GitHub \(external\)/);
  assert.match(html, /Param Factory on Sociobot \(external\)/);
  assert.match(notFound, /Param Factory on Sociobot \(external\)/);
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
