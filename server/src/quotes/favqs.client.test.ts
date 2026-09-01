import { describe, expect, it, vi } from 'vitest';

import { createFavqsClient, UpstreamError } from './favqs.client';

const API_KEY = 'test-secret-key';

const favqsQuote = {
  id: 42,
  dialogue: false,
  private: false,
  tags: ['wisdom'],
  url: 'https://favqs.com/quotes/42',
  favorites_count: 3,
  upvotes_count: 1,
  downvotes_count: 0,
  author: 'Ada Lovelace',
  author_permalink: 'ada-lovelace',
  body: 'That brain of mine is something more than merely mortal.',
};

function jsonResponse(payload: unknown, status = 200): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { 'content-type': 'application/json' },
  });
}

function clientWith(fetchFn: typeof fetch, timeoutMs = 5000) {
  return createFavqsClient({ apiKey: API_KEY, fetchFn, timeoutMs });
}

async function captureError(promise: Promise<unknown>): Promise<UpstreamError> {
  try {
    await promise;
  } catch (err) {
    expect(err).toBeInstanceOf(UpstreamError);
    return err as UpstreamError;
  }
  throw new Error('expected the promise to reject');
}

describe('getQotd', () => {
  it('maps the FavQs payload to the internal quote shape', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ qotd_date: '2026-09-01', quote: favqsQuote }));
    const quote = await clientWith(fetchFn).getQotd();

    expect(quote).toEqual({
      id: 42,
      body: 'That brain of mine is something more than merely mortal.',
      author: 'Ada Lovelace',
      tags: ['wisdom'],
    });
    expect(fetchFn).toHaveBeenCalledWith(
      'https://favqs.com/api/qotd',
      expect.objectContaining({
        headers: { Authorization: `Token token="${API_KEY}"` },
      }),
    );
  });

  it('maps an upstream error status to an http UpstreamError without leaking the key', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ message: 'boom' }, 500));
    const err = await captureError(clientWith(fetchFn).getQotd());

    expect(err.kind).toBe('http');
    expect(err.status).toBe(500);
    expect(err.message).not.toContain(API_KEY);
  });

  it('maps a timeout to a timeout UpstreamError', async () => {
    const fetchFn = vi.fn(
      (_url: unknown, init?: RequestInit) =>
        new Promise<Response>((_resolve, reject) => {
          init?.signal?.addEventListener('abort', () =>
            reject(new DOMException('aborted', 'AbortError')),
          );
        }),
    );
    const err = await captureError(clientWith(fetchFn as typeof fetch, 10).getQotd());

    expect(err.kind).toBe('timeout');
    expect(err.message).not.toContain(API_KEY);
  });

  it('maps a network failure to a network UpstreamError', async () => {
    const fetchFn = vi.fn(async () => {
      throw new TypeError('fetch failed');
    });
    const err = await captureError(clientWith(fetchFn).getQotd());

    expect(err.kind).toBe('network');
  });

  it('maps invalid JSON to a malformed UpstreamError', async () => {
    const fetchFn = vi.fn(async () => new Response('<html>oops</html>', { status: 200 }));
    const err = await captureError(clientWith(fetchFn).getQotd());

    expect(err.kind).toBe('malformed');
  });

  it('maps an unexpected shape to a malformed UpstreamError', async () => {
    const fetchFn = vi.fn(async () => jsonResponse({ quote: { nope: true } }));
    const err = await captureError(clientWith(fetchFn).getQotd());

    expect(err.kind).toBe('malformed');
  });
});

describe('searchQuotes', () => {
  it('returns mapped quotes and URL-encodes the query', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ page: 1, last_page: true, quotes: [favqsQuote] }),
    );
    const quotes = await clientWith(fetchFn).searchQuotes('ada lovelace');

    expect(quotes).toHaveLength(1);
    expect(quotes[0]?.id).toBe(42);
    expect(fetchFn).toHaveBeenCalledWith(
      'https://favqs.com/api/quotes?filter=ada%20lovelace',
      expect.anything(),
    );
  });

  it('maps the "no quotes found" placeholder row to an empty array', async () => {
    const placeholder = { ...favqsQuote, id: 0, body: 'No quotes found', tags: [] };
    const fetchFn = vi.fn(async () =>
      jsonResponse({ page: 1, last_page: true, quotes: [placeholder] }),
    );

    await expect(clientWith(fetchFn).searchQuotes('zzzz')).resolves.toEqual([]);
  });

  it('defaults a missing author to Unknown', async () => {
    const fetchFn = vi.fn(async () =>
      jsonResponse({ page: 1, last_page: true, quotes: [{ ...favqsQuote, author: null }] }),
    );
    const quotes = await clientWith(fetchFn).searchQuotes('anon');

    expect(quotes[0]?.author).toBe('Unknown');
  });
});
