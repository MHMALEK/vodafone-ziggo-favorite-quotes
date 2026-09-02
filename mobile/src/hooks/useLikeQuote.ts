import { useCallback, useState } from 'react';

import { api } from '../api/client';
import type { Quote } from '../models/quote';

export function useLikeQuote() {
  const [likedIds, setLikedIds] = useState<ReadonlySet<number>>(new Set());
  const [likingId, setLikingId] = useState<number | null>(null);

  const like = useCallback(async (quote: Quote): Promise<void> => {
    setLikingId(quote.id);
    try {
      await api.saveFavorite(quote);
      setLikedIds((prev) => new Set(prev).add(quote.id));
    } finally {
      setLikingId(null);
    }
  }, []);

  const isLiked = useCallback((id: number) => likedIds.has(id), [likedIds]);

  return { like, likingId, isLiked };
}
