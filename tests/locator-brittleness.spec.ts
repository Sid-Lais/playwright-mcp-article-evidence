import { test, expect } from '@playwright/test';
import { readFileSync } from 'node:fs';
import path from 'node:path';

// The locator Playwright MCP 0.0.83 returned for the 3rd "Add to cart" button (results/products-click-add-3.txt).
const recorded = (page: import('@playwright/test').Page) =>
  page.getByRole('listitem').filter({ hasText: 'Trail Shoe Model 3 $43.99' }).getByRole('button');

const html = readFileSync(path.resolve(import.meta.dirname, '../pages/products.html'), 'utf8');

test('recorded locator resolves to exactly one button while the price is $43.99', async ({ page }) => {
  await page.setContent(html);
  await expect(recorded(page)).toHaveCount(1);
});

test('failure state: same page, card 3 price changed to $44.99, locator matches nothing', async ({ page }) => {
  await page.setContent(html.replace('$43.99', '$44.99'));
  await expect(recorded(page)).toHaveCount(0);
  await expect(page.getByRole('listitem').filter({ hasText: 'Trail Shoe Model 3 $44.99' }).getByRole('button')).toHaveCount(1); // the button still exists
});
