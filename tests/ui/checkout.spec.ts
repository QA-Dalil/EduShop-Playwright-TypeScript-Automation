import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../support/auth';
import { addFirstAvailableProduct } from '../support/cart';

test.beforeEach(async ({ page }) => {
  await loginAsCustomer(page);
  await page.goto('/cart');
  await expect(page.locator('.spinner-overlay')).toBeHidden();
  const clear = page.getByRole('button', { name: 'Clear Cart' });
  if (await clear.isVisible()) await clear.click();
  await expect(page.getByText('Your cart is empty')).toBeVisible();
});

test('customer places an order and sees it in order history', async ({ page }) => {
  const productName = await addFirstAvailableProduct(page);
  await page.goto('/checkout');
  await expect(page.getByText(productName)).toBeVisible();
  await page.locator('[formControlName="shippingAddress"]').fill('123 Test Street, Amman, Jordan');
  await page.locator('[formControlName="paymentMethod"]').selectOption('CashOnDelivery');
  await page.getByRole('button', { name: 'Place Order' }).click();
  await expect(page.getByRole('heading', { name: 'Order Placed Successfully!' })).toBeVisible();
  const orderText = await page.getByText(/Your order #\d+ has been placed/).textContent();
  const orderId = orderText?.match(/#(\d+)/)?.[1];
  expect(orderId).toBeTruthy();
  await page.getByRole('link', { name: 'View Orders' }).click();
  await expect(page.getByText(`Order #${orderId}`, { exact: false })).toBeVisible();
});

test('shipping address is required', async ({ page }) => {
  await addFirstAvailableProduct(page);
  await page.goto('/checkout');
  await page.getByRole('button', { name: 'Place Order' }).click();
  await expect(page.getByText('Shipping address is required.')).toBeVisible();
});

test('an empty cart cannot place an order', async ({ page }) => {
  await page.goto('/checkout');
  await expect(page.getByRole('button', { name: 'Place Order' })).toBeDisabled();
});
