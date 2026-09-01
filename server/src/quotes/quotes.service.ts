import type { FavqsClient } from './favqs.client';
import type { Quote } from './quote.model';

export interface QuotesService {
  getQuoteOfTheDay(): Promise<Quote>;
  search(query: string): Promise<Quote[]>;
}

export function createQuotesService(favqsClient: FavqsClient): QuotesService {
  return {
    getQuoteOfTheDay: () => favqsClient.getQotd(),
    search: (query) => favqsClient.searchQuotes(query),
  };
}
