import { describe, expect, it } from 'vitest';

import type { Quote } from '../quotes/quote.model';
import { InMemoryFavoritesStore } from './favorites.store';

const quote = (id: number): Quote => ({
  id,
  body: `quote ${id}`,
  author: `author ${id}`,
  tags: [],
});

describe('InMemoryFavoritesStore', () => {
  it('adds a quote and stamps savedAt', () => {
    const fixed = new Date('2026-09-01T12:00:00.000Z');
    const store = new InMemoryFavoritesStore(() => fixed);

    const result = store.add(quote(1));

    expect(result.created).toBe(false);
    expect(result.favorite).toEqual({ ...quote(1), savedAt: fixed.toISOString() });
  });

  it('is idempotent: a duplicate add returns the original favorite', () => {
    let calls = 0;
    const store = new InMemoryFavoritesStore(
      () => new Date(Date.UTC(2026, 8, 1, 12, 0, calls++)),
    );

    const first = store.add(quote(1));
    const second = store.add(quote(1));

    expect(second.created).toBe(false);
    expect(second.favorite).toEqual(first.favorite);
    expect(store.list()).toHaveLength(1);
  });

  it('lists favorites newest-saved first', () => {
    const store = new InMemoryFavoritesStore();
    store.add(quote(1));
    store.add(quote(2));
    store.add(quote(3));

    expect(store.list().map((favorite) => favorite.id)).toEqual([3, 2, 1]);
  });

  it('removes an existing favorite', () => {
    const store = new InMemoryFavoritesStore();
    store.add(quote(1));

    expect(store.remove(1)).toBe(true);
    expect(store.list()).toEqual([]);
  });

  it('returns false when removing an unknown id', () => {
    const store = new InMemoryFavoritesStore();

    expect(store.remove(999)).toBe(false);
  });
});
