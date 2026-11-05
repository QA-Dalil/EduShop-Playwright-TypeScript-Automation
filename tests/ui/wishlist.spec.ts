import { test, expect } from '@playwright/test';
import { loginAsCustomer } from '../support/auth';

test('customer adds and removes a wishlist item', async ({ page }) => {
  await loginAsCustomer(page);
  const card = page.locator('.product-card').first();
  await expect(card).toBeVisible();
  const name = (await card.locator('.card-title').textContent())?.trim();
  await card.locator('button.btn-outline-danger').click();
  await expect(page.locator('.alert-success')).toContainText('added to wishlist');
  await page.goto('/wishlist');
  const wishCard = page.locator('.product-card').filter({ hasText: name ?? '' });
  await expect(wishCard).toBeVisible();
  await wishCard.locator('button.btn-outline-danger').click();
  await expect(wishCard).toBeHidden();
});

test('guest is redirected from wishlist', async ({ page }) => {
  await page.goto('/wishlist');
  await expect(page).toHaveURL(/\/login$/);
});
