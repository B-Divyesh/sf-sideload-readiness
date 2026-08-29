import test from 'node:test';
import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';
import { inflateRawSync, inflateSync } from 'node:zlib';
import { verifyPublishedSignatures } from '../scripts/verify-release-signatures.mjs';

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

test('@claim:release-signatures every current release asset passes pinned Cosign verification', { timeout: 180_000 }, async () => {
  const result = await verifyPublishedSignatures();
  assert.match(result.tag, /^v\d+\.\d+\.\d+$/);
  assert.equal(result.cosignVersion, '2.4.1');
  assert.ok(result.verifiedAssets.length >= 8);
});

test('@claim:release-checksums every current release archive has a matching published SHA-256', async () => {
  const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-sideload-readiness/releases/latest');
  assert.equal(response.status, 200);
  const release = await response.json();
  assert.match(release.tag_name, /^v\d+\.\d+\.\d+$/);
  const archives = release.assets.filter(asset => /\.(?:tar\.gz|zip|pkg|deb|rpm)$/.test(asset.name));
  assert.ok(archives.length >= 8, 'the current cross-platform release must advertise every archive');
  const sumsAsset = release.assets.find(asset => asset.name === 'SHA256SUMS');
  assert.ok(sumsAsset, 'the current release must publish SHA256SUMS');
  const sumsResponse = await fetch(sumsAsset.browser_download_url);
  assert.equal(sumsResponse.status, 200);
  const sums = new Map((await sumsResponse.text()).trim().split('\n').map(line => {
    const match = line.match(/^([a-f0-9]{64})\s+([^\s]+)$/);
    assert.ok(match, `valid SHA-256 line: ${line}`);
    return [match[2], match[1]];
  }));
  for (const asset of archives) {
    const expected = sums.get(asset.name);
    assert.ok(expected, `${asset.name} has a SHA256SUMS entry`);
    const assetResponse = await fetch(asset.browser_download_url);
    assert.equal(assetResponse.status, 200, `${asset.name} downloads`);
    const actual = createHash('sha256').update(Buffer.from(await assetResponse.arrayBuffer())).digest('hex');
    assert.equal(actual, expected, `${asset.name} matches its published SHA-256`);
  }
});

function zipEntry(archive, wanted) {
  const eocd = archive.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  assert.ok(eocd >= 0, 'zip end record exists');
  let offset = archive.readUInt32LE(eocd + 16);
  const count = archive.readUInt16LE(eocd + 10);
  for (let index = 0; index < count; index += 1) {
    assert.equal(archive.readUInt32LE(offset), 0x02014b50, 'zip central entry is valid');
    const method = archive.readUInt16LE(offset + 10);
    const compressedSize = archive.readUInt32LE(offset + 20);
    const nameLength = archive.readUInt16LE(offset + 28);
    const extraLength = archive.readUInt16LE(offset + 30);
    const commentLength = archive.readUInt16LE(offset + 32);
    const localOffset = archive.readUInt32LE(offset + 42);
    const name = archive.subarray(offset + 46, offset + 46 + nameLength).toString();
    if (name === wanted) {
      assert.equal(archive.readUInt32LE(localOffset), 0x04034b50, 'zip local entry is valid');
      const localNameLength = archive.readUInt16LE(localOffset + 26);
      const localExtraLength = archive.readUInt16LE(localOffset + 28);
      const start = localOffset + 30 + localNameLength + localExtraLength;
      const bytes = archive.subarray(start, start + compressedSize);
      return method === 8 ? inflateRawSync(bytes) : bytes;
    }
    offset += 46 + nameLength + extraLength + commentLength;
  }
  assert.fail(`${wanted} must exist in the release zip`);
}

test('@claim:unsigned-platform-disclosure current macOS and Windows downloads are unsigned', async () => {
  const response = await fetch('https://api.github.com/repos/B-Divyesh/sf-sideload-readiness/releases/latest');
  assert.equal(response.status, 200);
  const release = await response.json();
  const asset = name => release.assets.find(item => item.name === name)?.browser_download_url;
  const [pkgResponse, zipResponse] = await Promise.all([
    fetch(asset('sideload-readiness-macos-aarch64.pkg')),
    fetch(asset('sideload-readiness-windows-x86_64.zip'))
  ]);
  assert.equal(pkgResponse.status, 200);
  assert.equal(zipResponse.status, 200);
  const pkg = Buffer.from(await pkgResponse.arrayBuffer());
  assert.equal(pkg.subarray(0, 4).toString(), 'xar!');
  const headerSize = pkg.readUInt16BE(4);
  const compressedTocSize = Number(pkg.readBigUInt64BE(8));
  const toc = inflateSync(pkg.subarray(headerSize, headerSize + compressedTocSize)).toString();
  assert.doesNotMatch(toc, /<signature\b/i, 'macOS package must not contain an Apple package signature');
  const archive = Buffer.from(await zipResponse.arrayBuffer());
  const executable = zipEntry(archive, 'sideload-readiness.exe');
  const peOffset = executable.readUInt32LE(0x3c);
  assert.equal(executable.readUInt32LE(peOffset), 0x00004550, 'Windows app is a PE file');
  const optional = peOffset + 24;
  const dataDirectories = optional + (executable.readUInt16LE(optional) === 0x20b ? 112 : 96);
  assert.equal(executable.readUInt32LE(dataDirectories + 8 * 4 + 4), 0, 'Windows app has no Authenticode certificate table');
});

test('@claim:billing-provider-boundary runtime payment requests go only through Sociobot', async () => {
  const sources = await Promise.all(['site/app.js', 'site/index.html', 'site/install.sh', 'site/install.ps1'].map(read));
  const runtime = sources.join('\n');
  assert.doesNotMatch(runtime, /(?:api\.|checkout\.)?(?:dodo|stripe|paddle|lemonsqueezy)\.[a-z]+/i);
  assert.match(runtime, /https:\/\/api\.sociobot\.in\/api\/v1\/products\/sideload-readiness\/checkout/);
  assert.match(runtime, /https:\/\/api\.sociobot\.in\/api\/v1\/products\/\$\{PRODUCT\}\/verify/);
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
  const winget = await read('winget/Sociobot.SideloadReadiness/0.1.4/Sociobot.SideloadReadiness.yaml');
  const wingetInstaller = await read('winget/Sociobot.SideloadReadiness/0.1.4/Sociobot.SideloadReadiness.installer.yaml');
  const wingetLocale = await read('winget/Sociobot.SideloadReadiness/0.1.4/Sociobot.SideloadReadiness.locale.en-US.yaml');
  const scoop = await read('scoop-bucket/sideload-readiness.json');
  const brew = await read('packaging/homebrew/sideload-readiness.rb');
  assert.match(cargo, /name = "sideload-readiness"/);
  assert.match(cargo, /version = "0\.1\.4"/);
  assert.match(nfpm, /version: 0\.1\.4/);
  assert.match(winget, /PackageVersion: 0\.1\.4/);
  assert.match(winget, /ManifestType: version/);
  assert.match(wingetInstaller, /ManifestType: installer/);
  assert.match(wingetInstaller, /sideload-readiness-windows-x86_64\.zip/);
  assert.match(wingetInstaller, /fc7191f6c755b94c0d7cbb552975acd0baab91075b9b57a681c03d374a465747/);
  assert.match(wingetLocale, /ManifestType: defaultLocale/);
  assert.match(scoop, /"version": "0\.1\.4"/);
  assert.match(scoop, /"hash": "fc7191f6c755b94c0d7cbb552975acd0baab91075b9b57a681c03d374a465747"/);
  assert.match(brew, /version "0\.1\.4"/);
  assert.match(brew, /on_arm do/);
  assert.match(brew, /on_intel do/);
  assert.match(brew, /b5ab461d53ab829c23fd56da364ed5369461aaf6f0178f5edf3848c492288330/);
  assert.match(brew, /e3a7c02fd347494669d24c46494cb69bbec1c16871eac267acb717c89ce339fb/);
});

test('crate package excludes dependencies installed for site checks', async () => {
  const { stdout } = await exec('cargo', ['package', '--list', '--allow-dirty', '--locked'], {
    cwd: new URL('..', import.meta.url).pathname
  });
  assert.match(stdout, /^Cargo\.toml$/m);
  assert.match(stdout, /^README\.md$/m);
  assert.doesNotMatch(stdout, /(^|\/)node_modules\//m);
});

test('@claim:published-installer-paths public installer paths match one checksummed release', async () => {
  const fetchText = async url => {
    const response = await fetch(url);
    assert.equal(response.status, 200, `${url} must be public`);
    return response.text();
  };
  const [shell, powershell, formula, scoopSource] = await Promise.all([
    fetchText('https://sideload-readiness.sociobot.in/install.sh'),
    fetchText('https://sideload-readiness.sociobot.in/install.ps1'),
    fetchText('https://raw.githubusercontent.com/B-Divyesh/homebrew-sideload-readiness/main/Formula/sideload-readiness.rb'),
    fetchText('https://raw.githubusercontent.com/B-Divyesh/scoop-sideload-readiness/main/bucket/sideload-readiness.json')
  ]);
  assert.match(shell, /SHA-256 verified/);
  assert.match(powershell, /SHA-256 verified/);

  const version = formula.match(/version "([^"]+)"/)?.[1];
  assert.ok(version, 'the public Homebrew formula must declare a version');
  const scoop = JSON.parse(scoopSource);
  assert.equal(scoop.version, version);
  const sums = await fetchText(`https://github.com/B-Divyesh/sf-sideload-readiness/releases/download/v${version}/SHA256SUMS`);
  const checksums = new Map(sums.trim().split('\n').map(line => {
    const [hash, filename] = line.trim().split(/\s+/);
    return [filename, hash];
  }));
  for (const [asset, hash] of [
    ['sideload-readiness-macos-aarch64.tar.gz', 'b5ab461d53ab829c23fd56da364ed5369461aaf6f0178f5edf3848c492288330'],
    ['sideload-readiness-macos-x86_64.tar.gz', 'e3a7c02fd347494669d24c46494cb69bbec1c16871eac267acb717c89ce339fb'],
    ['sideload-readiness-windows-x86_64.zip', scoop.hash]
  ]) {
    assert.equal(checksums.get(asset), hash);
    assert.match(formula + scoopSource, new RegExp(`releases/download/v${version}/${asset}`));
  }
});
