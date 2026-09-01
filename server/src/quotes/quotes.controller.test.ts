import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { makeTestApp, sampleQuote, stubFavqsClient } from '../testing/helpers';
import { UpstreamError } from './favqs.client';

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

describe('GET /api/quotes/search', () => {
  it('returns matching quotes', async () => {
    const { app } = makeTestApp();

    const res = await request(app).get('/api/quotes/search?q=ada');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ quotes: [sampleQuote()] });
  });

  it('returns an empty array when nothing matches', async () => {
    const { app } = makeTestApp({
      favqsClient: stubFavqsClient({ searchQuotes: async () => [] }),
    });

    const res = await request(app).get('/api/quotes/search?q=zzzz');

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ quotes: [] });
  });

  it.each([
    ['missing q', '/api/quotes/search'],
    ['blank q', '/api/quotes/search?q=%20%20'],
    ['over-length q', `/api/quotes/search?q=${'a'.repeat(101)}`],
  ])('rejects %s with 400', async (_name, path) => {
    const { app } = makeTestApp();

    const res = await request(app).get(path);

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('maps an upstream failure to 502', async () => {
    const { app } = makeTestApp({
      favqsClient: stubFavqsClient({
        searchQuotes: async () => {
          throw new UpstreamError('http', 'FavQs responded with status 500', 500);
        },
      }),
    });

    const res = await request(app).get('/api/quotes/search?q=ada');

    expect(res.status).toBe(502);
    expect(res.body.error.code).toBe('UPSTREAM_ERROR');
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
