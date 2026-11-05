import { chromium } from '@playwright/test';
import { mkdir } from 'node:fs/promises';

const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
const baseURL = process.env.EDUSHOP_UI_URL ?? 'http://localhost:4200';

try {
  await mkdir('docs/images', { recursive: true });
  await page.goto(baseURL);
  await page.locator('.product-card').first().waitFor();
  await page.screenshot({ path: 'docs/images/catalog.png', fullPage: true });
  await page.locator('.product-card').first().getByRole('link', { name: 'View' }).click();
  await page.locator('app-product-detail h2').waitFor();
  await page.screenshot({ path: 'docs/images/product-detail.png', fullPage: true });
} finally {
  await browser.close();
}
