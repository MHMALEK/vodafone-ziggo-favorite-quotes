import type { DislikesStore } from '../dislikes/dislikes.store';
import type { FavqsClient } from './favqs.client';
import type { Quote } from './quote.model';

const QOTD_ATTEMPTS = 3;

export interface QuotesService {
  /** Returns null when every attempted quote is on the dislike list. */
  getQuoteOfTheDay(): Promise<Quote | null>;
  search(query: string): Promise<Quote[]>;
}

export function createQuotesService(
  favqsClient: FavqsClient,
  dislikesStore: DislikesStore,
): QuotesService {
  return {
    async getQuoteOfTheDay(): Promise<Quote | null> {
      for (let attempt = 0; attempt < QOTD_ATTEMPTS; attempt++) {
        const quote = await favqsClient.getQotd();
        if (!dislikesStore.has(quote.id)) {
          return quote;
        }
      }
      return null;
    },

    async search(query: string): Promise<Quote[]> {
      const quotes = await favqsClient.searchQuotes(query);
      return quotes.filter((quote) => !dislikesStore.has(quote.id));
    },
  };
}
