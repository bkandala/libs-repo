/**
 * Local dev server for the libs repo.
 * Run `npm run libs` inside the libs-repo — it serves /libs on port 6456
 * so consuming repos can reference http://localhost:6456/libs during dev.
 *
 * Requires: node 18+ (native fetch + http module only)
 */
import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const PORT = 6456;
const ROOT = path.dirname(fileURLToPath(import.meta.url), '..');

const MIME = {
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.html': 'text/html',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff2': 'font/woff2',
};

http.createServer((req, res) => {
  const urlPath = req.url.split('?')[0];
  const filePath = path.join(ROOT, '..', urlPath);

  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Headers', '*');

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    res.writeHead(404);
    res.end('Not found');
    return;
  }

  const ext = path.extname(filePath);
  res.writeHead(200, { 'Content-Type': MIME[ext] || 'text/plain' });
  fs.createReadStream(filePath).pipe(res);
}).listen(PORT, () => {
  console.log(`\n  Libs server running at http://localhost:${PORT}/libs\n`);
});
