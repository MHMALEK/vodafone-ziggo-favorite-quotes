import type { Quote } from '../quotes/quote.model';

export interface Favorite extends Quote {
  savedAt: string;
}

export interface AddResult {
  favorite: Favorite;
  created: boolean;
}
