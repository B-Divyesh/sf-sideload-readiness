import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
const root = resolve(process.cwd(), process.env.SITE_ROOT || 'site');
const types = { '.html':'text/html; charset=utf-8', '.js':'text/javascript; charset=utf-8', '.css':'text/css; charset=utf-8', '.svg':'image/svg+xml', '.webp':'image/webp', '.json':'application/json', '.xml':'application/xml', '.txt':'text/plain' };
const policy = "default-src 'self'; connect-src 'self' https://api.github.com https://api.sociobot.in; img-src 'self'; style-src 'self'; script-src 'self'; base-uri 'self'; form-action 'self'; frame-ancestors 'none'";
const appRoutes = new Set(['/', '/demo', '/privacy', '/terms']);
createServer(async (req, res) => {
  const clean = normalize((req.url || '/').split('?')[0]).replace(/^\.\.(\/|\\|$)/, '');
  const file = appRoutes.has(clean) ? 'index.html' : clean.slice(1);
  const headers = {
    'content-type': types[extname(file)] || 'application/octet-stream',
    'content-security-policy': policy,
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=(), usb=(), serial=()'
  };
  if (clean.startsWith('/assets/')) headers['cache-control'] = 'public, max-age=31536000, immutable';
  if (clean === '/service-worker.js') headers['cache-control'] = 'no-cache';
  try { const data = await readFile(join(root, file)); res.writeHead(200, headers); res.end(data); }
  catch { const data = await readFile(join(root, '404.html')); res.writeHead(404, {...headers, 'content-type':'text/html; charset=utf-8'}); res.end(data); }
}).listen(4173, () => console.log('http://localhost:4173'));
