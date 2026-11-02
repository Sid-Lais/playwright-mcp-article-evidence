import { test, expect } from '@playwright/test';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const url = pathToFileURL(path.resolve(import.meta.dirname, '../pages/checkout.html')).href;
const messages = [
  ['Order confirmed (off-screen drawer)', 'Order confirmed'],
  ['Payment declined (zero-height panel)', 'Payment declined'],
] as const;

for (const [name, text] of messages) {
  test.describe(name, () => {
    test('toHaveText passes although no user sees the text', async ({ page }) => {
      await page.goto(url);
      await expect(page.getByText(text)).toHaveText(text);
    });
    test('toBeVisible ALSO passes (Playwright visibility = non-empty box, not clipped/on-screen)', async ({ page }) => {
      await page.goto(url);
      await expect(page.getByText(text)).toBeVisible();
    });
    test('toBeInViewport is what actually fails', async ({ page }) => {
      await page.goto(url);
      await expect(page.getByText(text)).not.toBeInViewport();
    });
  });
}
