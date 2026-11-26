// Tiny static server with caching disabled (ES modules otherwise stay cached while you edit).
// Usage: node tools/serve.mjs [port]
import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = fileURLToPath(new URL('..', import.meta.url));
const port = Number(process.argv[2] || 8765);
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.mjs': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.json': 'application/json', '.svg': 'image/svg+xml', '.md': 'text/markdown; charset=utf-8' };
const server = createServer(async (req, res) => {
  const path = normalize(decodeURIComponent(new URL(req.url, 'http://x').pathname)).replace(/^(\.\.[/\\])+/, '');
  const file = join(root, path.endsWith('/') ? path + 'index.html' : path);
  if (!file.startsWith(root)) { res.writeHead(403).end(); return; }
  try {
    const body = await readFile(file);
    res.writeHead(200, { 'Content-Type': types[extname(file)] || 'application/octet-stream', 'Cache-Control': 'no-store' });
    res.end(body);
  } catch { res.writeHead(404).end('Not found'); }
});

// If the port is taken (for example by another copy of this server), try the next ones.
let tryPort = port;
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE' && tryPort < port + 20) {
    console.log(`Port ${tryPort} is in use, trying ${tryPort + 1}...`);
    tryPort++;
    server.listen(tryPort);
  } else throw err;
});
server.on('listening', () => console.log(`Lexiseed on http://localhost:${tryPort}`));
server.listen(tryPort);
