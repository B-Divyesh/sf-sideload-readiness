import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, 'dist/site');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(resolve(root, 'site'), out, { recursive: true });

const assets = resolve(out, 'assets');
await mkdir(assets);
const fingerprint = async name => {
  const sourcePath = resolve(out, name);
  const body = await readFile(sourcePath);
  const extension = name.slice(name.lastIndexOf('.'));
  const stem = name.slice(0, -extension.length);
  const hash = createHash('sha256').update(body).digest('hex').slice(0, 12);
  const fingerprinted = `${stem}.${hash}${extension}`;
  await writeFile(resolve(assets, fingerprinted), body);
  await rm(sourcePath);
  return `/assets/${fingerprinted}`;
};

const style = await fingerprint('style.css');
const app = await fingerprint('app.js');
for (const page of ['index.html', '404.html']) {
  const path = resolve(out, page);
  const html = (await readFile(path, 'utf8'))
    .replaceAll('/style.css', style)
    .replaceAll('/app.js', app);
  await writeFile(path, html);
}
const workerPath = resolve(out, 'service-worker.js');
const worker = (await readFile(workerPath, 'utf8'))
  .replaceAll("'/app.js'", `'${app}'`)
  .replaceAll("'/style.css'", `'${style}'`)
  .replace('sideload-readiness-v3', `sideload-readiness-v3-${app.match(/[a-f0-9]{12}/)[0]}`);
await writeFile(workerPath, worker);
console.log('Built static site to dist/site');
