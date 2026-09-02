import type { Favorite, Quote } from '../models/quote';

export class ApiError extends Error {
  constructor(
    message: string,
    readonly code: string,
    readonly status?: number,
  ) {
    super(message);
  }
}

const BASE_URL = process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:4000';

interface ErrorBody {
  error?: { code?: string; message?: string };
}

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      ...init,
      headers: { 'content-type': 'application/json', ...init?.headers },
    });
  } catch {
    throw new ApiError('Cannot reach the server. Is the API running?', 'NETWORK');
  }

  if (response.status === 204) {
    return undefined as T;
  }

  const body = (await response.json().catch(() => null)) as (T & ErrorBody) | null;
  if (!response.ok || body === null) {
    throw new ApiError(
      body?.error?.message ?? 'Something went wrong',
      body?.error?.code ?? 'UNKNOWN',
      response.status,
    );
  }
  return body;
}

export const api = {
  getQuote: (): Promise<Quote> =>
    requestJson<{ quote: Quote }>('/api/quote').then((r) => r.quote),

  searchQuotes: (q: string): Promise<Quote[]> =>
    requestJson<{ quotes: Quote[] }>(`/api/quotes/search?q=${encodeURIComponent(q)}`).then(
      (r) => r.quotes,
    ),

  listFavorites: (): Promise<Favorite[]> =>
    requestJson<{ favorites: Favorite[] }>('/api/favorites').then((r) => r.favorites),

  saveFavorite: (quote: Quote): Promise<Favorite> =>
    requestJson<{ favorite: Favorite }>('/api/favorites', {
      method: 'POST',
      body: JSON.stringify(quote),
    }).then((r) => r.favorite),

  removeFavorite: (id: number): Promise<void> =>
    requestJson<void>(`/api/favorites/${id}`, { method: 'DELETE' }),

  dislikeQuote: (id: number): Promise<void> =>
    requestJson<{ dislike: { id: number } }>('/api/dislikes', {
      method: 'POST',
      body: JSON.stringify({ id }),
    }).then(() => undefined),
};

export type Api = typeof api;
