#!/usr/bin/env node
/*
 * dev-server.mjs — preview the website on your own computer.
 *
 *   node scripts/dev-server.mjs        (or: npm run dev)
 *   then open http://localhost:8080
 *
 * Why is this needed? The pages load translations and the fleet/team lists
 * with JavaScript, which browsers refuse to do when you simply double-click
 * an .html file. This tiny server behaves like the real website: clean web
 * addresses (/about instead of /about.html) and a proper 404 page.
 * It needs only Node.js (no installs). Stop it with Ctrl+C.
 */
import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const PORT = Number(process.env.PORT) || 8080;

const TYPES = {
  '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8',
  '.json': 'application/json; charset=utf-8', '.webmanifest': 'application/manifest+json',
  '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.gif': 'image/gif', '.webp': 'image/webp', '.ico': 'image/x-icon', '.pdf': 'application/pdf',
  '.mp4': 'video/mp4', '.txt': 'text/plain; charset=utf-8', '.xml': 'application/xml; charset=utf-8',
};

// Same files that .assetsignore keeps off the real website.
const PRIVATE = /^\/(\.|node_modules\/|scripts\/|wrangler\.jsonc$|package(-lock)?\.json$|README\.md$|CHANGELOG\.md$|_headers$)/;

function isFile(p) {
  try { return fs.statSync(p).isFile(); } catch (e) { return false; }
}

function resolve(urlPath) {
  if (PRIVATE.test(urlPath)) return null;
  const base = path.join(ROOT, urlPath);
  if (!base.startsWith(ROOT)) return null;                 // never leave the project folder
  if (urlPath.endsWith('/')) return isFile(base + 'index.html') ? base + 'index.html' : null;
  if (isFile(base)) return base;
  if (isFile(base + '.html')) return base + '.html';        // /about -> about.html
  return null;
}

http.createServer((req, res) => {
  let urlPath;
  try { urlPath = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); }
  catch (e) { res.writeHead(400); return res.end('Bad request'); }

  // Like the real site: /about.html and /index.html redirect to the clean address.
  if (/\.html$/.test(urlPath) && !PRIVATE.test(urlPath)) {
    const clean = urlPath.replace(/(^|\/)index\.html$/, '$1').replace(/\.html$/, '') || '/';
    res.writeHead(307, { Location: clean });
    return res.end();
  }

  const file = resolve(urlPath);
  const status = file ? 200 : 404;
  const target = file || path.join(ROOT, '404.html');
  res.writeHead(status, {
    'Content-Type': TYPES[path.extname(target).toLowerCase()] || 'application/octet-stream',
    'Cache-Control': 'no-store',
  });
  fs.createReadStream(target).pipe(res);
  console.log(status, urlPath);
}).listen(PORT, () => {
  console.log(`\nNext Millionaire site running at http://localhost:${PORT}\nPress Ctrl+C to stop.\n`);
});
