import { pathToFileURL } from 'node:url';

export function releaseManifest(version, repository, tag = `v${version}`) {
  if (!/^\d+\.\d+\.\d+$/.test(version)) throw new Error('version must use semantic versioning');
  if (!/^[\w.-]+\/[\w.-]+$/.test(repository)) throw new Error('repository must be owner/name');
  if (!/^v\d+\.\d+\.\d+$/.test(tag)) throw new Error('tag must be v followed by a semantic version');
  const release = `https://github.com/${repository}/releases/tag/${tag}`;
  const asset = name => `https://github.com/${repository}/releases/download/${tag}/${name}`;
  return {
    version,
    release,
    platforms: {
      linux: asset('sideload-readiness-linux-x86_64.tar.gz'),
      'linux-deb': asset('sideload-readiness-linux-x86_64.deb'),
      'linux-rpm': asset('sideload-readiness-linux-x86_64.rpm'),
      'macos-arm64': asset('sideload-readiness-macos-aarch64.tar.gz'),
      'macos-arm64-pkg': asset('sideload-readiness-macos-aarch64.pkg'),
      'macos-x64': asset('sideload-readiness-macos-x86_64.tar.gz'),
      'macos-x64-pkg': asset('sideload-readiness-macos-x86_64.pkg'),
      windows: asset('sideload-readiness-windows-x86_64.zip')
    }
  };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , version, repository, tag = `v${version}`] = process.argv;
  process.stdout.write(`${JSON.stringify(releaseManifest(version, repository, tag))}\n`);
}
