import { test, expect } from '@playwright/test';
import { customerHeaders, firstProduct } from '../support/api';

test('wishlist requires authentication', async ({ request }) => {
  expect((await request.get('/api/wishlist')).status()).toBe(401);
});

test('customer can add and remove a product from wishlist', async ({ request }) => {
  const headers = await customerHeaders(request);
  const product = await firstProduct(request);
  try {
    const added = await request.post(`/api/wishlist/${product.id}`, { headers });
    expect(added.status()).toBe(200);
    const listed = await request.get('/api/wishlist', { headers });
    expect(listed.status()).toBe(200);
    expect((await listed.json()).items).toEqual(expect.arrayContaining([
      expect.objectContaining({ productId: product.id, productName: product.name })
    ]));
  } finally {
    const removed = await request.delete(`/api/wishlist/${product.id}`, { headers });
    expect(removed.status()).toBe(200);
  }
  const after = await request.get('/api/wishlist', { headers });
  expect((await after.json()).items.some((item: { productId: number }) => item.productId === product.id)).toBe(false);
});

test('unknown product cannot be wishlisted', async ({ request }) => {
  const headers = await customerHeaders(request);
  const response = await request.post('/api/wishlist/2147483647', { headers });
  expect(response.ok()).toBe(false);
});
