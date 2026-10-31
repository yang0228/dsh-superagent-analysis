import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { resolve, dirname, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
const root = resolve(dirname(fileURLToPath(import.meta.url)), '../../.preview');
export function serve(port = 4178) {
  return createServer(async (req, res) => {
    const pathname = new URL(req.url, 'http://127.0.0.1').pathname;
    const file = pathname === '/' ? 'index.html' : pathname.slice(1);
    if (!['index.html', 'app.js'].includes(file) || req.method !== 'GET') { res.writeHead(404); res.end(); return; }
    try { const data = await readFile(resolve(root, file)); res.writeHead(200, { 'content-type': extname(file) === '.js' ? 'text/javascript' : 'text/html; charset=utf-8',
      'content-security-policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; connect-src 'self'; img-src 'self' data:; font-src 'self' data:; base-uri 'none'; form-action 'none'" }); res.end(data); }
    catch { res.writeHead(404); res.end('Build the preview first.'); }
  }).listen(port, '127.0.0.1');
}
if (process.argv[1] === fileURLToPath(import.meta.url)) { serve(); console.log('Read-only preview: http://127.0.0.1:4178/?view=overview'); }
