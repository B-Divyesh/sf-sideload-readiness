import assert from 'node:assert/strict';
import { execFile } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { promisify } from 'node:util';

const exec = promisify(execFile);
const repository = 'B-Divyesh/sf-sideload-readiness';
const tag = process.argv[2] || 'v0.1.1';
const issuer = 'https://token.actions.githubusercontent.com';
const workflowIdentity = `^https://github.com/${repository}/.github/workflows/(release|sign-release)\\.yml@`;
const releaseResponse = await fetch(`https://api.github.com/repos/${repository}/releases/tags/${tag}`, {
  headers: { Accept: 'application/vnd.github+json' }
});
assert.equal(releaseResponse.status, 200, `release ${tag} must exist`);
const release = await releaseResponse.json();
const unsigned = release.assets.filter(asset => !asset.name.endsWith('.sigstore.json'));
const bundles = new Map(release.assets.filter(asset => asset.name.endsWith('.sigstore.json')).map(asset => [asset.name, asset]));
assert.ok(unsigned.length > 0, 'the release must contain assets to verify');

const directory = await mkdtemp(join(tmpdir(), 'sideload-readiness-signatures-'));
try {
  for (const asset of unsigned) {
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
    await exec('cosign', [
      'verify-blob', '--bundle', bundlePath,
      '--certificate-identity-regexp', workflowIdentity,
      '--certificate-oidc-issuer', issuer,
      assetPath
    ]);
  }
  console.log(JSON.stringify({ tag, verifiedAssets: unsigned.map(asset => asset.name) }, null, 2));
} finally {
  await rm(directory, { recursive: true, force: true });
}
