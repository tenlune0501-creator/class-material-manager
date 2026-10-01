import { createServer } from 'node:http';
import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import { spawnSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Readable } from 'node:stream';
import { randomBytes } from 'node:crypto';
import { sourceDigest, verifyBuild, isLocalRequest } from './identity.mjs';

const root = dirname(dirname(fileURLToPath(import.meta.url)));
const viewer = join(root, 'viewer');
const [mode, portText, launchId, expectedBuildId = ''] = process.argv.slice(2);
if (!['dev', 'production'].includes(mode) || !/^\d+$/.test(portText ?? '') || !launchId) throw new Error('Invalid Desktop runtime arguments');
const port = Number(portText);
if (port !== 4318 && port !== 4319) throw new Error('Desktop uses only ports 4318 (dev) and 4319 (build)');
process.chdir(viewer);
process.env.CMM_DESKTOP = '1';
process.env.NODE_ENV = mode === 'dev' ? 'development' : 'production';
const require = createRequire(join(viewer, 'package.json'));
require('@next/env').loadEnvConfig(viewer, mode === 'dev');
const ttsUrl = new URL(process.env.NEXT_PUBLIC_MELOTTS_URL || 'http://127.0.0.1:8787');
if (ttsUrl.protocol !== 'http:' || !['127.0.0.1', 'localhost'].includes(ttsUrl.hostname) || ttsUrl.username || ttsUrl.password || ttsUrl.pathname !== '/') {
  throw new Error('Desktop MeloTTS must be an HTTP loopback service origin');
}
const source = await sourceDigest(root);
let identity = { mode, source, commit: spawnSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8', windowsHide: true }).stdout.trim() };
if (mode === 'production') {
  const manifest = JSON.parse(await readFile(join(root, 'desktop/.runtime/build.json'), 'utf8'));
  const buildId = (await readFile(join(viewer, '.next-desktop/BUILD_ID'), 'utf8')).trim();
  verifyBuild(manifest, { source, buildId, expectedBuildId });
  identity = { ...identity, ...manifest };
}
const nonce = randomBytes(24).toString('base64');
const bootstrap = `<!doctype html><html lang="ko"><meta charset="utf-8"><title>Class Material Manager</title>
<body><p id="status">CMM Desktop을 시작하고 있습니다.</p><script nonce="${nonce}">
(async () => {
  if ('serviceWorker' in navigator) {
    await Promise.all((await navigator.serviceWorker.getRegistrations()).map(r => r.unregister()));
  }
  await Promise.all((await caches.keys()).map(k => caches.delete(k)));
  location.replace('/tutor');
})().catch(() => document.getElementById('status').textContent = 'Desktop 캐시 초기화에 실패했습니다. 창을 닫고 다시 실행해 주세요.');
</script></body></html>`;

let app;
let handle;
let ready = false;
async function proxyTts(req, res, pathname) {
  const suffix = pathname.slice('/__cmm_desktop/melotts'.length);
  if (!((suffix === '/health' && req.method === 'GET') || (suffix === '/synthesize' && req.method === 'POST'))) {
    res.writeHead(404).end(); return;
  }
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 180_000);
  res.on('close', () => { clearTimeout(timeout); controller.abort(); });
  try {
    let body;
    if (req.method === 'POST') {
      const parts = []; let size = 0;
      for await (const part of req) {
        size += part.length;
        if (size > 32768) { res.writeHead(413).end(); return; }
        parts.push(part);
      }
      const data = JSON.parse(Buffer.concat(parts).toString('utf8'));
      if (typeof data.text !== 'string' || !data.text.trim()) { res.writeHead(400).end(); return; }
      body = JSON.stringify({ text: data.text });
    }
    const response = await fetch(new URL(suffix, ttsUrl), { method: req.method, body,
      headers: body ? { 'content-type': 'application/json' } : {}, signal: controller.signal,
      redirect: 'error' });
    res.writeHead(response.status, { 'content-type': response.headers.get('content-type') || 'application/octet-stream' });
    if (response.body) Readable.fromWeb(response.body).on('error', () => res.destroy()).pipe(res);
    else res.end();
  } catch {
    if (!res.headersSent) res.writeHead(502).end('Local MeloTTS unavailable');
    else res.destroy();
  }
}
const server = createServer(async (req, res) => {
  // Next may set immutable cache headers; override at the final write boundary.
  const originalWriteHead = res.writeHead;
  res.writeHead = function (...args) {
    this.setHeader('Cache-Control', 'no-store');
    const headers = typeof args[1] === 'object' ? args[1] : args[2];
    if (headers && !Array.isArray(headers)) {
      for (const key of Object.keys(headers)) if (key.toLowerCase() === 'cache-control') delete headers[key];
    }
    return originalWriteHead.apply(this, args);
  };
  if (!isLocalRequest(req.headers, port)) { res.writeHead(403).end('Desktop origin required'); return; }
  const pathname = new URL(req.url, `http://127.0.0.1:${port}`).pathname;
  if (!ready) { res.writeHead(503).end('Starting'); return; }
  if (pathname === '/__cmm_desktop/ready') { res.end(launchId); return; }
  if (pathname === '/__cmm_desktop/identity') {
    res.setHeader('content-type', 'application/json');
    res.end(JSON.stringify({ ...identity, ...(mode === 'dev' ? { currentSource: await sourceDigest(root) } : {}) })); return;
  }
  if (pathname === '/__cmm_desktop/start') {
    res.setHeader('content-type', 'text/html; charset=utf-8');
    res.setHeader('Content-Security-Policy', `default-src 'none'; script-src 'nonce-${nonce}'`);
    res.end(bootstrap); return;
  }
  if (pathname === '/sw.js') {
    res.setHeader('content-type', 'application/javascript');
    res.end("self.addEventListener('install',()=>self.skipWaiting());self.addEventListener('activate',e=>e.waitUntil(self.registration.unregister()));"); return;
  }
  if (pathname.startsWith('/__cmm_desktop/melotts/')) { await proxyTts(req, res, pathname); return; }
  try { await handle(req, res); }
  catch { if (!res.headersSent) res.writeHead(500).end('Desktop request failed'); else res.destroy(); }
});
// Reserve the port before preparing Next. Never attach to or stop somebody else's server.
await new Promise((resolve, reject) => {
  server.once('error', reject);
  server.listen(port, '127.0.0.1', resolve);
});
app = require('next')({ dev: mode === 'dev', dir: viewer, hostname: '127.0.0.1', port, httpServer: server });
await app.prepare();
handle = app.getRequestHandler();
ready = true;
console.log('[CMM Desktop]', JSON.stringify(identity));
// Parent owns this process via a pipe: EOF also stops it if the native app crashes.
if (launchId !== 'terminal') { process.stdin.resume(); process.stdin.on('end', () => process.exit(0)); }
for (const signal of ['SIGINT', 'SIGTERM']) process.on(signal, () => process.exit(0));
