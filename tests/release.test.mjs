import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const read = (name) => readFile(new URL(`../${name}`, import.meta.url), 'utf8');
const exec = promisify(execFile);

test('@claim:platform-packaging release workflow retains the installer artifact matrix', async () => {
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
    'id-token: write',
    'sigstore/cosign-installer@v3',
    'cosign sign-blob --yes --bundle',
    'softprops/action-gh-release@v2'
  ]) assert.match(workflow, new RegExp(value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')));
});

test('@claim:release-signatures release workflows use GitHub OIDC to sign every published asset', async () => {
  const release = await read('.github/workflows/release.yml');
  const repair = await read('.github/workflows/sign-release.yml');
  for (const workflow of [release, repair]) {
    assert.match(workflow, /id-token: write/);
    assert.match(workflow, /sigstore\/cosign-installer@v3/);
    assert.match(workflow, /cosign sign-blob --yes --bundle/);
  }
  assert.match(repair, /endswith\("\.sigstore\.json"\) \| not/);
});

test('one-line installers require a matching published checksum', async () => {
  const shell = await read('site/install.sh');
  const powershell = await read('site/install.ps1');
  assert.match(shell, /sha256sum|shasum -a 256/);
  assert.match(shell, /\[ "\$actual" = "\$expected" \]/);
  assert.match(powershell, /Get-FileHash \$archive -Algorithm SHA256/);
  assert.match(powershell, /\$actual -ne \$expected\.ToLower\(\)/);
});

test('@claim:verified-installer the shell installer handles GitHub release JSON and installs a verified archive', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'sideload-readiness-installer-'));
  const fixtures = join(temporary, 'fixtures');
  const fakeBin = join(temporary, 'bin');
  const archiveRoot = join(temporary, 'archive');
  await Promise.all([mkdir(fixtures), mkdir(fakeBin), mkdir(archiveRoot)]);
  const binary = join(archiveRoot, 'sideload-readiness');
  await writeFile(binary, '#!/bin/sh\necho "sideload-readiness fixture"\n');
  await chmod(binary, 0o755);
  const assets = ['sideload-readiness-linux-x86_64.tar.gz', 'sideload-readiness-macos-aarch64.tar.gz'];
  for (const asset of assets) await exec('tar', ['-C', archiveRoot, '-czf', join(fixtures, asset), 'sideload-readiness']);
  const checksumLines = [];
  for (const asset of assets) {
    const archive = await readFile(join(fixtures, asset));
    checksumLines.push(`${createHash('sha256').update(archive).digest('hex')}  ${asset}`);
  }
  await writeFile(join(fixtures, 'SHA256SUMS'), `${checksumLines.join('\n')}\n`);
  await writeFile(join(fixtures, 'release.json'), JSON.stringify({
    tag_name: 'v0.1.0',
    assets: assets.map(name => ({ name, browser_download_url: `https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.0/${name}` }))
  }, null, 2));
  const curl = join(fakeBin, 'curl');
  await writeFile(curl, `#!/bin/sh
set -eu
url=''
output=''
while [ "$#" -gt 0 ]; do
  case "$1" in
    -o) output=$2; shift 2 ;;
    -*) shift ;;
    *) url=$1; shift ;;
  esac
done
case "$url" in
  *api.github.com*) source="$FIXTURE_DIR/release.json" ;;
  */SHA256SUMS) source="$FIXTURE_DIR/SHA256SUMS" ;;
  */*.tar.gz) source="$FIXTURE_DIR/\${url##*/}" ;;
  *) echo "Unexpected URL: $url" >&2; exit 8 ;;
esac
if [ -n "$output" ]; then cp "$source" "$output"; else command cat "$source"; fi
`);
  await chmod(curl, 0o755);
  const uname = join(fakeBin, 'uname');
  await writeFile(uname, `#!/bin/sh
case "$1" in
  -s) printf '%s\n' "$MOCK_OS" ;;
  -m) printf '%s\n' "$MOCK_ARCH" ;;
  *) exit 2 ;;
esac
`);
  await chmod(uname, 0o755);
  try {
    for (const [name, os, arch] of [['linux', 'Linux', 'x86_64'], ['macos', 'Darwin', 'arm64']]) {
      const home = join(temporary, `home-${name}`);
      await mkdir(home);
      const { stdout } = await exec('sh', [new URL('../site/install.sh', import.meta.url).pathname], {
        env: { ...process.env, HOME: home, FIXTURE_DIR: fixtures, MOCK_OS: os, MOCK_ARCH: arch, PATH: `${fakeBin}:${process.env.PATH}` }
      });
      assert.match(stdout, /SHA-256 verified/);
      assert.match(await readFile(join(home, '.local/bin/sideload-readiness'), 'utf8'), /fixture/);
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('@claim:release-manifest latest.json contains real per-platform release asset URLs', async () => {
  const temporary = await mkdtemp(join(tmpdir(), 'sideload-readiness-manifest-'));
  const filenames = [
    'sideload-readiness-linux-x86_64.tar.gz',
    'sideload-readiness-macos-aarch64.tar.gz',
    'sideload-readiness-macos-x86_64.tar.gz',
    'sideload-readiness-windows-x86_64.zip'
  ];
  try {
    await Promise.all(filenames.map(filename => writeFile(join(temporary, filename), 'fixture')));
    await exec(process.execPath, [
      new URL('../scripts/create-release-manifest.mjs', import.meta.url).pathname,
      temporary,
      'v0.1.1',
      'B-Divyesh/sf-sideload-readiness'
    ]);
    const manifest = JSON.parse(await readFile(join(temporary, 'latest.json'), 'utf8'));
    assert.equal(manifest.version, '0.1.1');
    for (const [platform, filename] of Object.entries({
      linux: filenames[0], 'macos-arm64': filenames[1], 'macos-x64': filenames[2], windows: filenames[3]
    })) {
      assert.equal(manifest.platforms[platform], `https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v0.1.1/${filename}`);
    }
  } finally {
    await rm(temporary, { recursive: true, force: true });
  }
});

test('packaging metadata keeps the CLI identity and version', async () => {
  const cargo = await read('Cargo.toml');
  const nfpm = await read('packaging/nfpm.yaml');
  const winget = await read('winget/Sociobot.SideloadReadiness/0.1.1/Sociobot.SideloadReadiness.yaml');
  const wingetInstaller = await read('winget/Sociobot.SideloadReadiness/0.1.1/Sociobot.SideloadReadiness.installer.yaml');
  const wingetLocale = await read('winget/Sociobot.SideloadReadiness/0.1.1/Sociobot.SideloadReadiness.locale.en-US.yaml');
  const scoop = await read('scoop-bucket/sideload-readiness.json');
  const brew = await read('packaging/homebrew/sideload-readiness.rb');
  assert.match(cargo, /name = "sideload-readiness"/);
  assert.match(cargo, /version = "0\.1\.1"/);
  assert.match(nfpm, /version: 0\.1\.1/);
  assert.match(winget, /PackageVersion: 0\.1\.1/);
  assert.match(winget, /ManifestType: version/);
  assert.match(wingetInstaller, /ManifestType: installer/);
  assert.match(wingetInstaller, /sideload-readiness-windows-x86_64\.zip/);
  assert.match(wingetInstaller, /c01caee6006897c1296d52f44698a8affc8234ad91260eee91c7446ea96769ee/);
  assert.match(wingetLocale, /ManifestType: defaultLocale/);
  assert.match(scoop, /"version": "0\.1\.1"/);
  assert.match(scoop, /"hash": "c01caee6006897c1296d52f44698a8affc8234ad91260eee91c7446ea96769ee"/);
  assert.match(brew, /version "0\.1\.1"/);
  assert.match(brew, /on_arm do/);
  assert.match(brew, /on_intel do/);
  assert.match(brew, /e999964dbe1f06631c341091ad215bdffb907e98d634d9095783babdf32f2fe8/);
  assert.match(brew, /c9b8e7bcaca39c3e8b0c4877d5872526e18ba98855be24c574ff4fb089730bf2/);
});
