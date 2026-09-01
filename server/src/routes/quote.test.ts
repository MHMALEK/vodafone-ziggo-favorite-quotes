import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { UpstreamError } from '../favqs/client';
import { makeTestApp, sampleQuote, stubFavqsClient } from '../test-helpers';

describe('GET /api/quote', () => {
  it('returns the quote of the day', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/api/quote');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ quote: sampleQuote() });
  });

  it('maps an upstream failure to 502', async () => {
    const { app } = makeTestApp({
      favqsClient: stubFavqsClient({
        getQotd: async () => {
          throw new UpstreamError('http', 'FavQs responded with status 500', 500);
        },
      }),
    });

    const res = await request(app).get('/api/quote');

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('UPSTREAM_ERROR');
  });

  it('maps an upstream timeout to 504', async () => {
    const { app } = makeTestApp({
      favqsClient: stubFavqsClient({
        getQotd: async () => {
          throw new UpstreamError('timeout', 'FavQs did not respond within 5000ms');
        },
      }),
    });

    const res = await request(app).get('/api/quote');

    expect(res.status).toBe(504);
    expect(res.body.error.code).toBe('UPSTREAM_TIMEOUT');
  });
});

describe('app basics', () => {
  it('serves /health without touching FavQs', async () => {
    const { app } = makeTestApp({
      favqsClient: stubFavqsClient({
        getQotd: async () => {
          throw new Error('health must not call FavQs');
        },
      }),
    });

    const res = await request(app).get('/health');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  it('returns a JSON 404 for unknown routes', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/nope');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NOT_FOUND');
  });
});
