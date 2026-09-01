import type { Quote } from '../quotes/quote.model';
import type { AddResult, Favorite } from './favorite.model';
import type { FavoritesStore } from './favorites.store';

export interface FavoritesService {
  save(quote: Quote): AddResult;
  list(): Favorite[];
  remove(id: number): boolean;
}

export function createFavoritesService(store: FavoritesStore): FavoritesService {
  return {
    save: (quote) => store.add(quote),
    list: () => store.list(),
    remove: (id) => store.remove(id),
  };
}
