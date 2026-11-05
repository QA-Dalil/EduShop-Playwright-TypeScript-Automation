import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../support/auth';
import { addFirstAvailableProduct } from '../support/cart';

test.beforeEach(async ({ page }) => {
  await loginAsCustomer(page);
  // Clear through the UI so each case starts with an isolated cart.
  await page.goto('/cart');
  await expect(page.locator('.spinner-overlay')).toBeHidden();
  const clear = page.getByRole('button', { name: 'Clear Cart' });
  if (await clear.isVisible()) await clear.click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('customer adds, updates and removes a product', async ({ page }) => {
  const productName = await addFirstAvailableProduct(page);
  await page.goto('/cart');
  const item = page.locator('.card-body .border-bottom').filter({ hasText: productName });
  await expect(item).toBeVisible();
  await expect(item.locator('span.fw-bold')).toHaveText('1');
  await item.getByRole('button', { name: '+' }).click();
  await expect(item.locator('span.fw-bold')).toHaveText('2');
  await item.getByRole('button', { name: '−' }).click();
  await expect(item.locator('span.fw-bold')).toHaveText('1');
  await item.locator('button.btn-outline-danger').click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('checkout link is available for a populated cart', async ({ page }) => {
  const productName = await addFirstAvailableProduct(page);
  await page.goto('/cart');
  await expect(page.getByText(productName)).toBeVisible();
  await expect(page.getByRole('link', { name: 'Proceed to Checkout' })).toBeVisible();
});
