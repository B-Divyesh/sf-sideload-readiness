import { createHash } from 'node:crypto';
import { cp, mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { resolve } from 'node:path';

const root = process.cwd();
const out = resolve(root, 'dist/site');
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
await cp(resolve(root, 'site'), out, { recursive: true });

const assetDirectory = resolve(out, 'assets');
await mkdir(assetDirectory);
const emitted = {};
for (const name of ['app.js', 'style.css']) {
  const contents = await readFile(resolve(out, name));
  const extension = name.slice(name.lastIndexOf('.'));
  const stem = name.slice(0, name.lastIndexOf('.'));
  const digest = createHash('sha256').update(contents).digest('hex').slice(0, 12);
  emitted[name] = `/assets/${stem}.${digest}${extension}`;
  await writeFile(resolve(out, emitted[name].slice(1)), contents);
  await rm(resolve(out, name));
}

const htmlPath = resolve(out, 'index.html');
const html = (await readFile(htmlPath, 'utf8'))
  .replace('/style.css', emitted['style.css'])
  .replace('/app.js', emitted['app.js']);
await writeFile(htmlPath, html);
const notFoundPath = resolve(out, '404.html');
const notFound = (await readFile(notFoundPath, 'utf8'))
  .replace('/style.css', emitted['style.css']);
await writeFile(notFoundPath, notFound);

const workerPath = resolve(out, 'service-worker.js');
const assetVersion = createHash('sha256')
  .update(`${emitted['app.js']}:${emitted['style.css']}`)
  .digest('hex')
  .slice(0, 12);
const worker = (await readFile(workerPath, 'utf8'))
  .replace('__ASSET_VERSION__', assetVersion)
  .replace("'/app.js'", `'${emitted['app.js']}'`)
  .replace("'/style.css'", `'${emitted['style.css']}'`);
await writeFile(workerPath, worker);

console.log(`Built static site to dist/site with immutable assets ${emitted['app.js']} and ${emitted['style.css']}`);
