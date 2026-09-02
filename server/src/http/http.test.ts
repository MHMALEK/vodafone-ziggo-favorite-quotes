import request from 'supertest';
import { describe, expect, it, vi } from 'vitest';

import { makeTestApp, stubFavqsClient } from '../testing/helpers';

describe('correlation ids', () => {
  it('echoes a provided x-request-id in error responses and the response header', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/nope').set('x-request-id', 'test-123');

    expect(res.status).toBe(404);
    expect(res.body.error.correlationId).toBe('test-123');
    expect(res.headers['x-request-id']).toBe('test-123');
  });

  it('generates a correlation id when none is provided', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/nope');

    expect(res.body.error.correlationId).toMatch(/[0-9a-f-]{36}/);
  });
});

describe('hardening', () => {
  it('maps a malformed JSON body to 400', async () => {
    const { app } = makeTestApp();

    const res = await request(app)
      .post('/api/favorites')
      .set('content-type', 'application/json')
      .send('{bad json');

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INVALID_JSON');
  });

  it('maps an unexpected exception to a JSON 500 with a correlation id', async () => {
    const { app } = makeTestApp({
      favqsClient: stubFavqsClient({
        getQotd: async () => {
          throw new Error('boom');
        },
      }),
    });

    const res = await request(app).get('/api/quote').set('x-request-id', 'crash-1');

    expect(res.status).toBe(500);
    expect(res.body.error).toMatchObject({ code: 'INTERNAL', correlationId: 'crash-1' });
    expect(JSON.stringify(res.body)).not.toContain('boom');
  });
});

describe('GET /metrics', () => {
  it('exposes Prometheus metrics including the request histogram', async () => {
    const { app } = makeTestApp();
    await request(app).get('/api/quote');

    const res = await request(app).get('/metrics');

    expect(res.status).toBe(200);
    expect(res.text).toContain('http_request_duration_seconds');
    expect(res.text).toContain('process_cpu_user_seconds_total');
  });
});

describe('index route', () => {
  it('lists the entry points', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/');

    expect(res.status).toBe(200);
    expect(res.body.docs).toBe('/docs');
  });
});

describe('API docs', () => {
  it('serves the OpenAPI spec', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/openapi.json');

    expect(res.status).toBe(200);
    expect(res.body.openapi).toMatch(/^3\./);
    expect(Object.keys(res.body.paths)).toEqual(
      expect.arrayContaining(['/api/quote', '/api/quotes/search', '/api/favorites']),
    );
  });

  it('serves Swagger UI', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/docs/');

    expect(res.status).toBe(200);
    expect(res.text).toContain('swagger-ui');
  });
});

describe('favqs client observation', () => {
  it('reports success and failure outcomes with durations', async () => {
    const observe = vi.fn();
    const { createFavqsClient, UpstreamError } = await import('../quotes/favqs.client');

    const ok = createFavqsClient({
      apiKey: 'k',
      observe,
      fetchFn: async () =>
        new Response(JSON.stringify({ quote: { id: 1, body: 'b', author: 'a', tags: [] } }), {
          status: 200,
        }),
    });
    await ok.getQotd();
    expect(observe).toHaveBeenCalledWith('qotd', 'success', expect.any(Number));

    const failing = createFavqsClient({
      apiKey: 'k',
      observe,
      fetchFn: async () => new Response('nope', { status: 500 }),
    });
    await expect(failing.searchQuotes('x')).rejects.toBeInstanceOf(UpstreamError);
    expect(observe).toHaveBeenCalledWith('search', 'http', expect.any(Number));
  });
});
