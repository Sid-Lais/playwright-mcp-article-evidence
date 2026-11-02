// Renders results/tokens-chart.svg from results/summary.json (the numbers behind the article's token bar chart).
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';

const results = path.resolve(import.meta.dirname, '../results');
const s = JSON.parse(readFileSync(path.join(results, 'summary.json'), 'utf8'));
const step = (label: string) => s.steps.find((x: any) => x.label === label).responseTokens as number;
const bars = [
  { label: 'Login page snapshot', value: step('login-snapshot') },
  { label: 'Tool definitions (25 tools)', value: s.tools.defTokens as number },
  { label: 'Product list snapshot (60 cards)', value: step('products-snapshot') },
];
const max = Math.max(...bars.map(b => b.value));
const W = 760, left = 250, barH = 34, gap = 22, top = 50;
const rows = bars.map((b, i) => {
  const y = top + i * (barH + gap), w = Math.round(((W - left - 90) * b.value) / max);
  return `<text x="${left - 10}" y="${y + 22}" text-anchor="end" font-size="14">${b.label}</text>` +
    `<rect x="${left}" y="${y}" width="${w}" height="${barH}" fill="#2b6cb0"/>` +
    `<text x="${left + w + 8}" y="${y + 22}" font-size="14">${b.value.toLocaleString('en-US')}</text>`;
});
const H = top + bars.length * (barH + gap) + 10;
writeFileSync(path.join(results, 'tokens-chart.svg'),
`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}" font-family="sans-serif">
<rect width="${W}" height="${H}" fill="#fff"/>
<text x="${W / 2}" y="26" text-anchor="middle" font-size="16" font-weight="bold">Tokens added to context by Playwright MCP 0.0.83 (o200k_base)</text>
${rows.join('\n')}
</svg>
`);
console.log(bars.map(b => `${b.label}: ${b.value}`).join('\n'));
