// Serve only the public application files, never project data or signing files.
const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const root = path.resolve(__dirname, '..');
const files = new Map([
  ['/', ['index.html', 'text/html; charset=utf-8']],
  ['/index.html', ['index.html', 'text/html; charset=utf-8']],
  ['/app.js', ['app.js', 'text/javascript; charset=utf-8']],
  ['/i18n.js', ['i18n.js', 'text/javascript; charset=utf-8']],
  ['/style.css', ['style.css', 'text/css; charset=utf-8']],
  ['/packaging/icon.png', ['packaging/icon.png', 'image/png']],
]);
const server = http.createServer((req, res) => {
  if (!['GET', 'HEAD'].includes(req.method)) {
    res.writeHead(405, {Allow: 'GET, HEAD'}); res.end(); return;
  }
  let entry;
  try { entry = files.get(new URL(req.url, 'http://localhost:8765').pathname); } catch {}
  if (!entry) { res.writeHead(404); res.end('Not found'); return; }
  fs.readFile(path.join(root, entry[0]), (error, data) => {
    if (error) { res.writeHead(500); res.end('Unable to load page'); return; }
    res.writeHead(200, {'Content-Type': entry[1], 'Cache-Control': 'no-cache', 'X-Content-Type-Options': 'nosniff'});
    res.end(req.method === 'HEAD' ? undefined : data);
  });
});
server.on('error', error => {
  console.error(error.code === 'EADDRINUSE'
    ? 'Port 8765 is already in use. If Now What is already running, open http://localhost:8765/ .'
    : `Unable to start Now What: ${error.message}`);
  process.exitCode = 1;
});
server.listen(8765, '127.0.0.1', () => {
  console.log('Now What: http://localhost:8765/');
  console.log('Keep this window open while using the local website. Press Ctrl+C to stop.');
});
