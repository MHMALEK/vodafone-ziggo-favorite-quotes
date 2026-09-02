import { expect, test } from '@playwright/test';

test('health responds', async ({ request }) => {
  const res = await request.get('/health');
  expect(res.status()).toBe(200);
  expect(await res.json()).toEqual({ status: 'ok' });
});

test('quote of the day proxies FavQs', async ({ request }) => {
  const res = await request.get('/api/quote');
  expect(res.status()).toBe(200);
  const { quote } = await res.json();
  expect(typeof quote.id).toBe('number');
  expect(typeof quote.body).toBe('string');
  expect(typeof quote.author).toBe('string');
});

test('favorites lifecycle: like, duplicate like, list, unlike', async ({ request }) => {
  const quote = { id: 990001, body: 'e2e body', author: 'e2e author', tags: ['e2e'] };

  const created = await request.post('/api/favorites', { data: quote });
  expect(created.status()).toBe(201);

  const duplicate = await request.post('/api/favorites', { data: quote });
  expect(duplicate.status()).toBe(200);
  expect((await duplicate.json()).favorite.savedAt).toBe((await created.json()).favorite.savedAt);

  const list = await request.get('/api/favorites');
  const { favorites } = await list.json();
  expect(favorites.map((favorite: { id: number }) => favorite.id)).toContain(quote.id);

  const removed = await request.delete(`/api/favorites/${quote.id}`);
  expect(removed.status()).toBe(204);

  const removedAgain = await request.delete(`/api/favorites/${quote.id}`);
  expect(removedAgain.status()).toBe(404);
});

test('validation errors carry code, message, and correlation id', async ({ request }) => {
  const res = await request.post('/api/favorites', {
    data: { id: 0, body: '', author: 'x' },
    headers: { 'x-request-id': 'e2e-val-1' },
  });
  expect(res.status()).toBe(400);
  const { error } = await res.json();
  expect(error.code).toBe('VALIDATION_ERROR');
  expect(error.correlationId).toBe('e2e-val-1');
});

test('search without q is rejected', async ({ request }) => {
  const res = await request.get('/api/quotes/search');
  expect(res.status()).toBe(400);
});

test('unknown routes return a JSON 404', async ({ request }) => {
  const res = await request.get('/definitely-not-a-route');
  expect(res.status()).toBe(404);
  expect((await res.json()).error.code).toBe('NOT_FOUND');
});

test('docs and metrics are exposed', async ({ request }) => {
  expect((await request.get('/openapi.json')).status()).toBe(200);
  expect((await request.get('/docs/')).status()).toBe(200);
  const metrics = await request.get('/metrics');
  expect(metrics.status()).toBe(200);
  expect(await metrics.text()).toContain('http_request_duration_seconds');
});
