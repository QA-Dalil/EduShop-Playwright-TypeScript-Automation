import { test, expect } from '@playwright/test';
import { customerHeaders, firstProduct } from '../support/api';

test('product reviews are public', async ({ request }) => {
  const product = await firstProduct(request);
  const response = await request.get(`/api/review/product/${product.id}`);
  expect(response.status()).toBe(200);
  expect(Array.isArray(await response.json())).toBe(true);
});

test('anonymous users cannot write a review', async ({ request }) => {
  const response = await request.post('/api/review', {
    data: { productId: 1, rating: 5, comment: 'Test review' }
  });
  expect(response.status()).toBe(401);
});

test('rating below one is rejected', async ({ request }) => {
  const headers = await customerHeaders(request);
  const product = await firstProduct(request);
  const response = await request.post('/api/review', {
    headers, data: { productId: product.id, rating: 0, comment: 'Invalid rating' }
  });
  expect(response.status()).toBe(400);
});

test('rating above five is rejected', async ({ request }) => {
  const headers = await customerHeaders(request);
  const product = await firstProduct(request);
  const response = await request.post('/api/review', {
    headers, data: { productId: product.id, rating: 6, comment: 'Invalid rating' }
  });
  expect(response.status()).toBe(400);
});

test('anonymous users cannot delete reviews', async ({ request }) => {
  expect((await request.delete('/api/review/1')).status()).toBe(401);
});

test('customer can create, read and delete their own review', async ({ request }) => {
  const headers = await customerHeaders(request);
  const me = await (await request.get('/api/auth/me', { headers })).json();
  const products = await (await request.get('/api/product', { params: { pageSize: 100 } })).json();
  let productId: number | undefined;
  for (const product of products.items) {
    const reviews = await (await request.get(`/api/review/product/${product.id}`)).json();
    if (!reviews.some((review: { userId: string }) => review.userId === me.id)) {
      productId = product.id;
      break;
    }
  }
  if (!productId) throw new Error('No product is available for a new customer review');
  const comment = `Playwright test review ${Date.now()}`;
  const created = await request.post('/api/review', {
    headers, data: { productId, rating: 4, comment }
  });
  expect(created.status()).toBe(200);
  const review = await created.json();
  try {
    const listed = await request.get(`/api/review/product/${productId}`);
    expect(listed.status()).toBe(200);
    expect(JSON.stringify(await listed.json())).toContain(comment);
  } finally {
    const deleted = await request.delete(`/api/review/${review.id}`, { headers });
    expect(deleted.status()).toBe(200);
  }
});
