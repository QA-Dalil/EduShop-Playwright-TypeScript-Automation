import { expect, type Page } from '@playwright/test';

export async function addFirstAvailableProduct(page: Page): Promise<string> {
  await page.goto('/');
  // Pick a product with an enabled Add button; seeded inventory can vary.
  const enabledAdd = page.locator('.product-card button:has-text("Add"):not([disabled])').first();
  await expect(enabledAdd).toBeVisible();
  const productCard = enabledAdd.locator('xpath=ancestor::*[contains(@class,"product-card")]');
  const name = (await productCard.locator('.card-title').textContent())?.trim();
  if (!name) throw new Error('The selected product has no name');
  await enabledAdd.click();
  await expect(page.locator('.alert-success')).toContainText('added to cart');
  return name;
}
