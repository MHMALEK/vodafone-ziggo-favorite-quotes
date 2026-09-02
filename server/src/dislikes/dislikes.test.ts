import request from 'supertest';
import { describe, expect, it } from 'vitest';

import { createQuotesService } from '../quotes/quotes.service';
import { makeTestApp, sampleQuote, stubFavqsClient } from '../testing/helpers';
import { InMemoryDislikesStore } from './dislikes.store';

describe('InMemoryDislikesStore', () => {
  it('adds ids idempotently, lists, and removes them', () => {
    const store = new InMemoryDislikesStore();

    expect(store.add(1)).toBe(true);
    expect(store.add(1)).toBe(false);
    expect(store.has(1)).toBe(true);
    expect(store.list()).toEqual([1]);
    expect(store.remove(1)).toBe(true);
    expect(store.remove(1)).toBe(false);
    expect(store.has(1)).toBe(false);
  });
});

describe('dislikes endpoints', () => {
  it('hides a quote (201) and is idempotent (200)', async () => {
    const { app } = makeTestApp();

    const first = await request(app).post('/api/dislikes').send({ id: 7 });
    const second = await request(app).post('/api/dislikes').send({ id: 7 });

    expect(first.status).toBe(201);
    expect(second.status).toBe(200);
    expect((await request(app).get('/api/dislikes')).body).toEqual({ dislikes: [7] });
  });

  it('rejects an invalid body', async () => {
    const { app } = makeTestApp();

    const res = await request(app).post('/api/dislikes').send({ id: 0 });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
  });

  it('removes an existing favorite when its quote is disliked', async () => {
    const { app } = makeTestApp();
    await request(app).post('/api/favorites').send(sampleQuote(5));

    await request(app).post('/api/dislikes').send({ id: 5 });

    expect((await request(app).get('/api/favorites')).body.favorites).toEqual([]);
  });

  it('un-hides via DELETE and 404s for unknown ids', async () => {
    const { app } = makeTestApp();
    await request(app).post('/api/dislikes').send({ id: 7 });

    expect((await request(app).delete('/api/dislikes/7')).status).toBe(204);
    expect((await request(app).delete('/api/dislikes/7')).status).toBe(404);
    expect((await request(app).delete('/api/dislikes/abc')).status).toBe(400);
  });
});

describe('quotes service with dislikes', () => {
  it('filters disliked quotes out of search results', async () => {
    const dislikes = new InMemoryDislikesStore();
    dislikes.add(2);
    const service = createQuotesService(
      stubFavqsClient({ searchQuotes: async () => [sampleQuote(1), sampleQuote(2)] }),
      dislikes,
    );

    expect((await service.search('x')).map((quote) => quote.id)).toEqual([1]);
  });

  it('retries the quote of the day past disliked quotes', async () => {
    const dislikes = new InMemoryDislikesStore();
    dislikes.add(1);
    const quotes = [sampleQuote(1), sampleQuote(9)];
    const service = createQuotesService(
      stubFavqsClient({ getQotd: async () => quotes.shift() ?? sampleQuote(9) }),
      dislikes,
    );

    expect((await service.getQuoteOfTheDay())?.id).toBe(9);
  });

  it('gives up after three disliked quotes in a row', async () => {
    const dislikes = new InMemoryDislikesStore();
    dislikes.add(1);
    const service = createQuotesService(
      stubFavqsClient({ getQotd: async () => sampleQuote(1) }),
      dislikes,
    );

    expect(await service.getQuoteOfTheDay()).toBeNull();
  });

  it('maps an exhausted quote of the day to a 404 with a clear code', async () => {
    const { app, deps } = makeTestApp({
      favqsClient: stubFavqsClient({ getQotd: async () => sampleQuote(1) }),
    });
    deps.dislikesStore.add(1);

    const res = await request(app).get('/api/quote');

    expect(res.status).toBe(404);
    expect(res.body.error.code).toBe('NO_QUOTE_AVAILABLE');
  });
});
