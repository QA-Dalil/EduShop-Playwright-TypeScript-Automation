import { test, expect } from '@playwright/test';
import { clearCart, customerHeaders, firstProduct } from '../support/api';

test('anonymous users cannot read the cart', async ({ request }) => {
  expect((await request.get('/api/cart')).status()).toBe(401);
});

test('anonymous users cannot add an item', async ({ request }) => {
  expect((await request.post('/api/cart/items', { data: { productId: 1, quantity: 1 } })).status()).toBe(401);
});

test('customer can add, update, remove and clear cart items', async ({ request }) => {
  const headers = await customerHeaders(request);
  await clearCart(request, headers);
  try {
    const product = await firstProduct(request);
    const added = await request.post('/api/cart/items', { headers, data: { productId: product.id, quantity: 1 } });
    expect(added.status()).toBe(200);
    const cart = await added.json();
    expect(cart.totalItems).toBe(1);
    expect(cart.items[0].productName).toBe(product.name);
    const itemId = cart.items[0].id as number;

    const updated = await request.put(`/api/cart/items/${itemId}`, { headers, data: { quantity: 2 } });
    expect(updated.status()).toBe(200);
    expect((await updated.json()).totalItems).toBe(2);

    const fetched = await request.get('/api/cart', { headers });
    expect(fetched.status()).toBe(200);
    expect((await fetched.json()).items[0].quantity).toBe(2);

    const removed = await request.delete(`/api/cart/items/${itemId}`, { headers });
    expect(removed.status()).toBe(200);
    expect((await removed.json()).items).toHaveLength(0);
  } finally {
    await clearCart(request, headers);
  }
});

test('cart rejects quantity zero', async ({ request }) => {
  const headers = await customerHeaders(request);
  const product = await firstProduct(request);
  const response = await request.post('/api/cart/items', {
    headers, data: { productId: product.id, quantity: 0 }
  });
  expect(response.status()).toBe(400);
});

test('cart rejects quantity over 100', async ({ request }) => {
  const headers = await customerHeaders(request);
  const product = await firstProduct(request);
  const response = await request.post('/api/cart/items', {
    headers, data: { productId: product.id, quantity: 101 }
  });
  expect(response.status()).toBe(400);
});

test('cart rejects an unknown product', async ({ request }) => {
  const headers = await customerHeaders(request);
  const response = await request.post('/api/cart/items', {
    headers, data: { productId: 2147483647, quantity: 1 }
  });
  expect(response.ok()).toBe(false);
});
