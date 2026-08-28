import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { execFile as execFileCallback } from 'node:child_process';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { delimiter, join } from 'node:path';
import { promisify } from 'node:util';
import { releaseManifest } from '../scripts/release-manifest.mjs';

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const execFile = promisify(execFileCallback);

test('release workflow retains the installer artifact matrix', async () => {
  const workflow = await read('.github/workflows/release.yml');
  for (const value of [
    "tags: ['v*']",
    'workflow_dispatch:',
    'x86_64-unknown-linux-musl',
    'aarch64-apple-darwin',
    'x86_64-apple-darwin',
    'x86_64-pc-windows-msvc',
    'sideload-readiness-linux-x86_64.deb',
    'sideload-readiness-linux-x86_64.rpm',
    'SHA256SUMS',
    'latest.json',
    'softprops/action-gh-release@v2'
  ]) assert.match(workflow, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('one-line installers require a matching published checksum', async () => {
  const shell = await read('site/install.sh');
  const powershell = await read('site/install.ps1');
  assert.match(shell, /sha256sum|shasum -a 256/);
  assert.match(shell, /\[ "\$actual" = "\$expected" \]/);
  assert.match(powershell, /Get-FileHash \$archive -Algorithm SHA256/);
  assert.match(powershell, /\$actual -ne \$expected\.ToLower\(\)/);
});

test('@claim:installer-checksum the shell installer handles GitHub JSON and verifies its archive', async () => {
  const root = await mkdtemp(join(tmpdir(), 'sideload-installer-test-'));
  try {
    const mockBin = join(root, 'bin');
    const payloadDir = join(root, 'payload');
    const home = join(root, 'home');
    await Promise.all([mkdir(mockBin), mkdir(payloadDir), mkdir(home)]);
    const payload = join(payloadDir, 'sideload-readiness');
    await writeFile(payload, '#!/bin/sh\necho "fixture binary 9.8.7"\n');
    await chmod(payload, 0o755);
    const archive = join(root, 'sideload-readiness-linux-x86_64.tar.gz');
    await execFile('tar', ['-C', payloadDir, '-czf', archive, 'sideload-readiness']);
    const checksum = createHash('sha256').update(await readFile(archive)).digest('hex');
    const sums = join(root, 'SHA256SUMS');
    await writeFile(sums, `${checksum}  sideload-readiness-linux-x86_64.tar.gz\n`);
    const api = new URL('./fixtures/github-latest.json', import.meta.url).pathname;
    const log = join(root, 'curl.log');
    const fakeCurl = `#!/usr/bin/env node
import { appendFileSync, copyFileSync, readFileSync } from 'node:fs';
const args = process.argv.slice(2);
const url = args.find(value => value.startsWith('https://'));
const outputIndex = args.indexOf('-o');
appendFileSync(process.env.CURL_LOG, url + '\\n');
let source;
if (url.endsWith('/releases/latest')) source = process.env.API_FIXTURE;
else if (url.endsWith('/SHA256SUMS')) source = process.env.SUMS_FIXTURE;
else if (url.endsWith('/sideload-readiness-linux-x86_64.tar.gz')) source = process.env.ARCHIVE_FIXTURE;
else process.exit(22);
if (outputIndex >= 0) copyFileSync(source, args[outputIndex + 1]);
else process.stdout.write(readFileSync(source));
`;
    await writeFile(join(mockBin, 'curl'), fakeCurl);
    await chmod(join(mockBin, 'curl'), 0o755);
    await writeFile(join(mockBin, 'uname'), '#!/bin/sh\n[ "$1" = "-s" ] && echo Linux || echo x86_64\n');
    await chmod(join(mockBin, 'uname'), 0o755);

    const { stdout } = await execFile('sh', [new URL('../site/install.sh', import.meta.url).pathname], {
      env: {
        ...process.env,
        HOME: home,
        PATH: `${mockBin}${delimiter}${process.env.PATH}`,
        API_FIXTURE: api,
        ARCHIVE_FIXTURE: archive,
        SUMS_FIXTURE: sums,
        CURL_LOG: log
      }
    });
    assert.match(stdout, /SHA-256 verified/);
    assert.match(await readFile(join(home, '.local/bin/sideload-readiness'), 'utf8'), /fixture binary 9\.8\.7/);
    const requests = await readFile(log, 'utf8');
    assert.match(requests, /releases\/download\/v9\.8\.7\/sideload-readiness-linux-x86_64\.tar\.gz/);
    assert.match(requests, /releases\/download\/v9\.8\.7\/SHA256SUMS/);
  } finally {
    await rm(root, { recursive: true, force: true });
  }
});

test('@claim:release-platforms latest.json uses absolute URLs for every release platform', () => {
  const manifest = releaseManifest('0.1.1', 'B-Divyesh/sf-sideload-readiness');
  assert.deepEqual(Object.keys(manifest.platforms), [
    'linux', 'linux-deb', 'linux-rpm', 'macos-arm64', 'macos-arm64-pkg',
    'macos-x64', 'macos-x64-pkg', 'windows'
  ]);
  for (const url of Object.values(manifest.platforms)) {
    assert.equal(new URL(url).origin, 'https://github.com');
    assert.match(url, /\/releases\/download\/v0\.1\.1\//);
  }
});

test('packaging metadata keeps the CLI identity and version', async () => {
  const cargo = await read('Cargo.toml');
  const nfpm = await read('packaging/nfpm.yaml');
  const winget = await read('winget/Sociobot.SideloadReadiness/0.1.0/Sociobot.SideloadReadiness.yaml');
  const wingetInstaller = await read('winget/Sociobot.SideloadReadiness/0.1.0/Sociobot.SideloadReadiness.installer.yaml');
  const wingetLocale = await read('winget/Sociobot.SideloadReadiness/0.1.0/Sociobot.SideloadReadiness.locale.en-US.yaml');
  const scoop = await read('scoop-bucket/sideload-readiness.json');
  const brew = await read('packaging/homebrew/sideload-readiness.rb');
  assert.match(cargo, /name = "sideload-readiness"/);
  assert.match(cargo, /version = "0\.1\.1"/);
  assert.match(nfpm, /version: 0\.1\.1/);
  assert.match(winget, /PackageVersion: 0\.1\.0/);
  assert.match(winget, /ManifestType: version/);
  assert.match(wingetInstaller, /ManifestType: installer/);
  assert.match(wingetInstaller, /sideload-readiness-windows-x86_64\.zip/);
  assert.match(wingetLocale, /ManifestType: defaultLocale/);
  assert.match(scoop, /"version": "0\.1\.0"/);
  assert.match(brew, /on_arm do/);
  assert.match(brew, /on_intel do/);
});
