// Records the exact environment into results/environment.txt.
import { chromium } from '@playwright/test';
import { readFileSync, writeFileSync } from 'node:fs';
import { execSync } from 'node:child_process';
import os from 'node:os';

const v = name => JSON.parse(readFileSync(new URL(`../node_modules/${name}/package.json`, import.meta.url))).version;
const b = await chromium.launch();
const lines = [
  `date: ${new Date().toISOString()}`,
  `os: ${os.type()} ${os.release()} ${os.arch()}`,
  `cpu: ${os.cpus()[0].model}`,
  `ram_gib: ${Math.round(os.totalmem() / 2 ** 30)}`,
  `node: ${process.version}`,
  `npm: ${execSync('npm -v').toString().trim()}`,
  ...['@playwright/mcp', 'playwright', 'playwright-core', '@playwright/test', '@modelcontextprotocol/sdk', 'js-tiktoken', 'tsx', 'typescript'].map(n => `${n}: ${v(n)}`),
  `chromium: ${b.version()}`,
];
await b.close();
writeFileSync(new URL('../results/environment.txt', import.meta.url), lines.join('\n') + '\n');
console.log(lines.join('\n'));
