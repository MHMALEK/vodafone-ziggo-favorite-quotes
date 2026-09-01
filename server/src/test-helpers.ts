import type { AppDependencies } from './app';
import { createApp } from './app';
import { InMemoryFavoritesStore } from './favorites/store';
import type { FavqsClient, Quote } from './favqs/client';

export const sampleQuote = (id = 1): Quote => ({
  id,
  body: `body ${id}`,
  author: `author ${id}`,
  tags: ['tag'],
});

export function stubFavqsClient(overrides: Partial<FavqsClient> = {}): FavqsClient {
  return {
    getQotd: async () => sampleQuote(),
    searchQuotes: async () => [sampleQuote()],
    ...overrides,
  };
}

export function makeTestApp(overrides: Partial<AppDependencies> = {}) {
  const deps: AppDependencies = {
    favqsClient: stubFavqsClient(),
    favoritesStore: new InMemoryFavoritesStore(),
    ...overrides,
  };
  return { app: createApp(deps), deps };
}
