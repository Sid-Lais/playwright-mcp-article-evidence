// Checks the secondary technical claims in the article against the pinned server.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const root = path.resolve(import.meta.dirname, '..');
const cli = path.join(root, 'node_modules/@playwright/mcp/cli.js');

async function session(extra: string[], fn: (c: Client) => Promise<void>) {
  const c = new Client({ name: 'claims', version: '1' });
  await c.connect(new StdioClientTransport({ command: process.execPath, args: [cli, '--headless', '--isolated', '--browser', 'chromium', ...extra] }));
  try { await fn(c); } finally { await c.close(); }
}
const text = (r: any) => (r.content as any[]).map(x => x.text ?? '').join('\n');
const products = pathToFileURL(path.join(root, 'pages/products.html')).href;

await session([], async c => {
  // file:// is blocked by default?
  console.log('--- navigate to file:// URL ---\n', text(await c.callTool({ name: 'browser_navigate', arguments: { url: products } })).slice(0, 200));
});

// serve via http for the rest
import http from 'node:http';
import { readFileSync } from 'node:fs';
const srv = http.createServer((q, s) => { s.setHeader('content-type', 'text/html'); try { s.end(readFileSync(path.join(root, 'pages', q.url!.split('?')[0]))); } catch { s.statusCode = 404; s.end(); } });
await new Promise<void>(r => srv.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${(srv.address() as any).port}`;

await session([], async c => {
  await c.callTool({ name: 'browser_navigate', arguments: { url: `${base}/products.html` } });
  const old = await c.callTool({ name: 'browser_click', arguments: { ref: 'f1e11', element: 'x' } });
  console.log('--- browser_click with legacy "ref" arg ---\n', text(old).slice(0, 400), '\nisError=', old.isError);
  const f = await c.callTool({ name: 'browser_find', arguments: { text: 'Trail Shoe Model 3' } });
  console.log('--- browser_find ---\n', text(f).slice(0, 600));
  const d = await c.callTool({ name: 'browser_snapshot', arguments: { depth: 2 } });
  console.log('--- snapshot depth=2 ---  chars', text(d).length);
});
await session(['--snapshot-mode=none'], async c => {
  await c.callTool({ name: 'browser_navigate', arguments: { url: `${base}/login.html` } });
  const r = await c.callTool({ name: 'browser_click', arguments: { target: 'x', element: 'x' } });
  const n = await c.callTool({ name: 'browser_navigate', arguments: { url: `${base}/products.html` } });
  console.log('--- --snapshot-mode=none: navigate response ---\n', text(n));
});
await session(['--caps=testing'], async c => {
  const { tools } = await c.listTools();
  console.log('--- --caps=testing adds ---\n', tools.map(t => t.name).filter(n => /locator|verify/.test(n)).join(', '));
  await c.callTool({ name: 'browser_navigate', arguments: { url: `${base}/products.html` } });
  const snap = text(await c.callTool({ name: 'browser_snapshot' }));
  const third = snap.split('\n').filter(l => /button "Add to cart"/.test(l))[2].match(/\[ref=(\w+)\]/)![1];
  const g = await c.callTool({ name: 'browser_generate_locator', arguments: { target: third, element: 'Add to cart 3rd' } });
  console.log('--- browser_generate_locator ---\n', text(g).slice(0, 400));
});
await session(['--allowed-origins=http://example.invalid'], async c => {
  const r = await c.callTool({ name: 'browser_navigate', arguments: { url: `${base}/login.html` } });
  console.log('--- --allowed-origins blocks main navigation? ---\n', text(r).slice(0, 300));
});
srv.close();
