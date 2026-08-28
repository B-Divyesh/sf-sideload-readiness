import { readdir, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const [directoryArg, tagArg, repositoryArg] = process.argv.slice(2);

if (!directoryArg || !tagArg || !repositoryArg) {
  console.error('Usage: node scripts/create-release-manifest.mjs <asset-directory> <tag> <owner/repository>');
  process.exit(2);
}

const directory = resolve(directoryArg);
const tag = tagArg.startsWith('v') ? tagArg : `v${tagArg}`;
const version = tag.slice(1);
const names = new Set(await readdir(directory));
const required = {
  linux: 'sideload-readiness-linux-x86_64.tar.gz',
  'macos-arm64': 'sideload-readiness-macos-aarch64.tar.gz',
  'macos-x64': 'sideload-readiness-macos-x86_64.tar.gz',
  windows: 'sideload-readiness-windows-x86_64.zip'
};

for (const filename of Object.values(required)) {
  if (!names.has(filename)) {
    throw new Error(`Cannot create latest.json: missing ${filename}`);
  }
}

const downloadRoot = `https://github.com/${repositoryArg}/releases/download/${tag}`;
const manifest = {
  version,
  release: `https://github.com/${repositoryArg}/releases/tag/${tag}`,
  platforms: Object.fromEntries(
    Object.entries(required).map(([platform, filename]) => [platform, `${downloadRoot}/${filename}`])
  )
};

await writeFile(resolve(directory, 'latest.json'), `${JSON.stringify(manifest)}\n`);
