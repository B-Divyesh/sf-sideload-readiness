import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { createHash } from 'node:crypto';
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const repository = 'B-Divyesh/sf-sideload-readiness';
const issuer = 'https://token.actions.githubusercontent.com';
const workflowIdentity = `^https://github.com/${repository}/.github/workflows/(release|sign-release)\\.yml@`;

const cosignVersion = '2.4.1';
const cosignBuilds = {
  'linux-x64': ['cosign-linux-amd64', '8b24b946dd5809c6bd93de08033bcf6bc0ed7d336b7785787c080f574b89249b'],
  'darwin-x64': ['cosign-darwin-amd64', '666032ca283da92b6f7953965688fd51200fdc891a86c19e05c98b898ea0af4e'],
  'darwin-arm64': ['cosign-darwin-arm64', '13343856b69f70388c4fe0b986a31dde5958e444b41be22d785d3dc5e1a9cc62'],
  'win32-x64': ['cosign-windows-amd64.exe', '8d57f8a42a981d27290c4227271fa9f0f62ca6630eb4a21d316bd6b01405b87c']
};

async function pinnedCosign() {
  const build = cosignBuilds[`${process.platform}-${process.arch}`];
  assert.ok(build, `Cosign ${cosignVersion} is not pinned for ${process.platform}-${process.arch}`);
  const [filename, digest] = build;
  const cache = join(tmpdir(), `sideload-readiness-cosign-${cosignVersion}`);
  const binary = join(cache, process.platform === 'win32' ? 'cosign.exe' : 'cosign');
  await mkdir(cache, { recursive: true });
  let bytes;
  try { bytes = await readFile(binary); } catch { bytes = null; }
  if (!bytes || createHash('sha256').update(bytes).digest('hex') !== digest) {
    const response = await fetch(`https://github.com/sigstore/cosign/releases/download/v${cosignVersion}/${filename}`);
    assert.equal(response.status, 200, `pinned Cosign ${cosignVersion} must download`);
    bytes = Buffer.from(await response.arrayBuffer());
    assert.equal(createHash('sha256').update(bytes).digest('hex'), digest, 'pinned Cosign checksum must match');
    await writeFile(binary, bytes, { mode: 0o755 });
  }
  if (process.platform !== 'win32') await chmod(binary, 0o755);
  return binary;
}

export async function verifyPublishedSignatures(tag) {
  const endpoint = tag ? `releases/tags/${tag}` : 'releases/latest';
  const releaseResponse = await fetch(`https://api.github.com/repos/${repository}/${endpoint}`, {
    headers: { Accept: 'application/vnd.github+json' }
  });
  assert.equal(releaseResponse.status, 200, tag ? `release ${tag} must exist` : 'the latest release must exist');
  const release = await releaseResponse.json();
  const assets = release.assets.filter(asset => !asset.name.endsWith('.sigstore.json'));
  const bundles = new Map(release.assets.filter(asset => asset.name.endsWith('.sigstore.json')).map(asset => [asset.name, asset]));
  assert.ok(assets.length > 0, 'the release must contain assets to verify');
  const cosign = await pinnedCosign();
  const directory = await mkdtemp(join(tmpdir(), 'sideload-readiness-signatures-'));
  try {
    for (const asset of assets) {
      const bundle = bundles.get(`${asset.name}.sigstore.json`);
      assert.ok(bundle, `${asset.name} must have a Sigstore bundle`);
      const [assetResponse, bundleResponse] = await Promise.all([
        fetch(asset.browser_download_url),
        fetch(bundle.browser_download_url)
      ]);
      assert.equal(assetResponse.status, 200, `${asset.name} must download`);
      assert.equal(bundleResponse.status, 200, `${bundle.name} must download`);
      const assetPath = join(directory, asset.name);
      const bundlePath = join(directory, bundle.name);
      await Promise.all([
        writeFile(assetPath, Buffer.from(await assetResponse.arrayBuffer())),
        writeFile(bundlePath, Buffer.from(await bundleResponse.arrayBuffer()))
      ]);
      await exec(cosign, [
        'verify-blob', '--bundle', bundlePath,
        '--certificate-identity-regexp', workflowIdentity,
        '--certificate-oidc-issuer', issuer,
        assetPath
      ]);
    }
    return { tag: release.tag_name, cosignVersion, verifiedAssets: assets.map(asset => asset.name) };
  } finally {
    await rm(directory, { recursive: true, force: true });
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.log(JSON.stringify(await verifyPublishedSignatures(process.argv[2]), null, 2));
}
