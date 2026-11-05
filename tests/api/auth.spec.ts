import { test, expect } from '@playwright/test';
import { customer } from '../support/data';

test('customer login issues a token and allows profile access', async ({ request }) => {
  const response = await request.post('/api/auth/login', { data: customer });
  expect(response.status()).toBe(200);
  const body = await response.json();
  expect(body.accessToken).toEqual(expect.any(String));
  expect(body.email).toBe(customer.email);
  expect(body.roles).toContain('Customer');
  const profile = await request.get('/api/auth/me', {
    headers: { Authorization: `Bearer ${body.accessToken}` }
  });
  expect(profile.status()).toBe(200);
  expect((await profile.json()).email).toBe(customer.email);
});

test('profile endpoint rejects anonymous access', async ({ request }) => {
  const response = await request.get('/api/auth/me');
  expect(response.status()).toBe(401);
});

test('invalid credentials are rejected', async ({ request }) => {
  const response = await request.post('/api/auth/login', {
    data: { email: customer.email, password: 'incorrect-password' }
  });
  expect(response.ok()).toBe(false);
});

test('registration rejects invalid email', async ({ request }) => {
  const response = await request.post('/api/auth/register', {
    data: { firstName: 'Test', lastName: 'User', email: 'not-an-email', password: 'Valid123!', confirmPassword: 'Valid123!' }
  });
  expect(response.status()).toBe(400);
});

test('registration rejects mismatched passwords', async ({ request }) => {
  const response = await request.post('/api/auth/register', {
    data: { firstName: 'Test', lastName: 'User', email: 'mismatch@example.test', password: 'Valid123!', confirmPassword: 'Other123!' }
  });
  expect(response.status()).toBe(400);
});

test('registration rejects an existing customer email', async ({ request }) => {
  const response = await request.post('/api/auth/register', {
    data: { firstName: 'Test', lastName: 'User', email: customer.email, password: 'Valid123!', confirmPassword: 'Valid123!' }
  });
  expect(response.ok()).toBe(false);
});

test('refresh token can be exchanged only once', async ({ request }) => {
  const login = await request.post('/api/auth/login', { data: customer });
  expect(login.status()).toBe(200);
  const body = await login.json();
  const data = { accessToken: body.accessToken, refreshToken: body.refreshToken };
  const refreshed = await request.post('/api/auth/refresh', { data });
  expect(refreshed.status()).toBe(200);
  expect((await refreshed.json()).accessToken).toEqual(expect.any(String));
  const replay = await request.post('/api/auth/refresh', { data });
  expect(replay.ok()).toBe(false);
});

test('logout requires authentication', async ({ request }) => {
  expect((await request.post('/api/auth/logout')).status()).toBe(401);
});
