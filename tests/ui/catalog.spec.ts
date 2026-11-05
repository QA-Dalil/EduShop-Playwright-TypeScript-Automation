import { test, expect } from '@playwright/test';

test('guest sees the seeded catalog', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'Welcome to EduShop' })).toBeVisible();
  await expect(page.locator('.product-card').first()).toBeVisible();
  await expect(page.getByText(/products found/)).toBeVisible();
});

test('search narrows products to laptop', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Search for textbooks, courses, supplies...').fill('Laptop');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.product-card')).toHaveCount(1);
  await expect(page.locator('.product-card .card-title')).toContainText('Laptop');
});

test('unmatched search gives no product cards', async ({ page }) => {
  await page.goto('/');
  await page.getByPlaceholder('Search for textbooks, courses, supplies...').fill('zzzx-no-such-product-9834');
  await page.getByRole('button', { name: 'Search' }).click();
  await expect(page.locator('.product-card')).toHaveCount(0);
  await expect(page.getByText('0 products found')).toBeVisible();
});

test('product detail opens from the catalog', async ({ page }) => {
  await page.goto('/');
  const firstCard = page.locator('.product-card').first();
  await expect(firstCard).toBeVisible();
  const name = (await firstCard.locator('.card-title').textContent())?.trim();
  await firstCard.getByRole('link', { name: 'View' }).click();
  await expect(page.locator('h2')).toHaveText(name ?? '');
  await expect(page.getByText('Availability:')).toBeVisible();
});

test('guest cannot visit checkout', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page).toHaveURL(/\/login$/);
});

test('guest cannot visit order history', async ({ page }) => {
  await page.goto('/orders');
  await expect(page).toHaveURL(/\/login$/);
});
