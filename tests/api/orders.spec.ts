import { test, expect } from '@playwright/test';
import { clearCart, customerHeaders } from '../support/api';

test('anonymous users cannot list orders', async ({ request }) => {
  expect((await request.get('/api/order')).status()).toBe(401);
});

test('anonymous users cannot create orders', async ({ request }) => {
  const response = await request.post('/api/order', { data: { shippingAddress: 'Amman', paymentMethod: 'Card' } });
  expect(response.status()).toBe(401);
});

test('customer receives an order list', async ({ request }) => {
  const headers = await customerHeaders(request);
  const response = await request.get('/api/order', { headers });
  expect(response.status()).toBe(200);
  expect(Array.isArray(await response.json())).toBe(true);
});

test('unknown order returns 404', async ({ request }) => {
  const headers = await customerHeaders(request);
  const response = await request.get('/api/order/2147483647', { headers });
  expect(response.status()).toBe(404);
});

test('customer cannot change order status', async ({ request }) => {
  const headers = await customerHeaders(request);
  const response = await request.put('/api/order/1/status', {
    headers, data: { status: 'Shipped' }
  });
  expect(response.status()).toBe(403);
});

test('an empty cart cannot create an order', async ({ request }) => {
  const headers = await customerHeaders(request);
  await clearCart(request, headers);
  const response = await request.post('/api/order', {
    headers, data: { shippingAddress: '123 Test Street', paymentMethod: 'Card' }
  });
  expect(response.ok()).toBe(false);
});
