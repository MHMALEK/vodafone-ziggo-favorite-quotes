import type { Quote } from '../quotes/quote.model';
import type { AddResult, Favorite } from './favorite.model';

export interface FavoritesStore {
  add(quote: Quote): AddResult;
  list(): Favorite[];
  remove(id: number): boolean;
}

export class InMemoryFavoritesStore implements FavoritesStore {
  private readonly favorites = new Map<number, Favorite>();

  constructor(private readonly now: () => Date = () => new Date()) {}

  add(quote: Quote): AddResult {
    const existing = this.favorites.get(quote.id);
    if (existing) {
      return { favorite: existing, created: false };
    }

    const favorite: Favorite = { ...quote, savedAt: this.now().toISOString() };
    this.favorites.set(quote.id, favorite);
    return { favorite, created: true };
  }

  list(): Favorite[] {
    // Map preserves insertion order; newest saved first.
    return [...this.favorites.values()].reverse();
  }

  remove(id: number): boolean {
    return this.favorites.delete(id);
  }
}
