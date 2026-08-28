import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
const root = resolve(process.cwd(), process.env.SITE_ROOT || 'site');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain' };
createServer(async (req, res) => {
  const clean = normalize((req.url || '/').split('?')[0]).replace(/^\.\.(\/|\\|$)/, '');
  let file = clean === '/' ? 'index.html' : clean.slice(1);
  try { const data = await readFile(join(root, file)); res.writeHead(200, {'content-type': types[extname(file)] || 'application/octet-stream'}); res.end(data); }
  catch { const data = await readFile(join(root, 'index.html')); res.writeHead(200, {'content-type':'text/html; charset=utf-8'}); res.end(data); }
}).listen(4173, () => console.log('http://localhost:4173'));
