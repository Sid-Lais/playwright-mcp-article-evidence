// Drives @playwright/mcp directly through the MCP TypeScript SDK. No LLM anywhere in this script.
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { getEncoding } from 'js-tiktoken';
import http from 'node:http';
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { performance } from 'node:perf_hooks';
import path from 'node:path';

const root = path.resolve(import.meta.dirname, '..');
const out = path.join(root, 'results');
mkdirSync(out, { recursive: true });
const enc = getEncoding('o200k_base');
const tok = (s: string) => enc.encode(s).length;

const server = http.createServer((req, res) => {
  const f = path.join(root, 'pages', (req.url === '/' ? '/login.html' : req.url!).split('?')[0]);
  try { res.setHeader('content-type', 'text/html'); res.end(readFileSync(f)); } catch { res.statusCode = 404; res.end('nf'); }
});
await new Promise<void>(r => server.listen(0, '127.0.0.1', r));
const base = `http://127.0.0.1:${(server.address() as any).port}`;

const extra = process.argv.slice(2); // e.g. --caps=testing
const transport = new StdioClientTransport({
  command: process.execPath,
  args: [path.join(root, 'node_modules/@playwright/mcp/cli.js'), '--headless', '--isolated', '--browser', 'chromium', ...extra],
});
const client = new Client({ name: 'repro', version: '1.0.0' });
await client.connect(transport);

const log: any = { base, extra, steps: [] };
async function call(label: string, name: string, args: any = {}) {
  const t0 = performance.now();
  const r: any = await client.callTool({ name, arguments: args });
  const ms = Math.round(performance.now() - t0);
  const text = (r.content as any[]).filter(c => c.type === 'text').map(c => c.text).join('\n');
  writeFileSync(path.join(out, `${label}.txt`), text);
  const yaml = text.match(/```yaml\n([\s\S]*?)```/)?.[1] ?? '';
  const step = { label, name, args, ms, isError: !!r.isError, responseTokens: tok(text), snapshotTokens: tok(yaml), refs: (text.match(/\[ref=\w+\]/g) ?? []).length };
  log.steps.push(step);
  console.log(`${label.padEnd(22)} ${String(ms).padStart(5)} ms  response=${String(step.responseTokens).padStart(6)} tok  snapshotYaml=${String(step.snapshotTokens).padStart(6)} tok  refs=${step.refs}`);
  return text;
}

// --- tool inventory
const { tools } = await client.listTools();
const defs = JSON.stringify(tools);
writeFileSync(path.join(out, 'tools.json'), JSON.stringify(tools, null, 2));
log.tools = { count: tools.length, names: tools.map(t => t.name), defTokens: tok(defs) };
console.log('tools:', tools.length, 'def tokens:', tok(defs));
if (process.env.DUMP_SCHEMAS) for (const t of tools) if (/click|snapshot|type|fill/.test(t.name)) console.log(t.name, JSON.stringify(t.inputSchema));

// --- login
await call('login-navigate', 'browser_navigate', { url: `${base}/login.html` });
const loginSnap = await call('login-snapshot', 'browser_snapshot');
const ref = (snap: string, re: RegExp) => snap.split('\n').find(l => re.test(l))?.match(/\[ref=(\w+)\]/)?.[1];
const emailRef = ref(loginSnap, /textbox "Email"/)!;
const btnRef = ref(loginSnap, /button "Sign in"/)!;
await call('login-type-email', 'browser_type', { target: emailRef, element: 'Email', text: 'qa@example.com' });
await call('login-click-signin', 'browser_click', { target: btnRef, element: 'Sign in' });

// --- products
await call('products-navigate', 'browser_navigate', { url: `${base}/products.html` });
const prodSnap = await call('products-snapshot', 'browser_snapshot');
const addRefs = prodSnap.split('\n').filter(l => /button "Add to cart"/.test(l)).map(l => l.match(/\[ref=(\w+)\]/)![1]);
log.productAddButtons = addRefs.length;
await call('products-click-add-3', 'browser_click', { target: addRefs[2], element: 'Add to cart (third card)' });

// --- checkout
await call('checkout-navigate', 'browser_navigate', { url: `${base}/checkout.html` });
await call('checkout-snapshot', 'browser_snapshot');

writeFileSync(path.join(out, process.env.OUT_NAME ?? 'summary.json'), JSON.stringify(log, null, 2));
await client.close(); server.close();
