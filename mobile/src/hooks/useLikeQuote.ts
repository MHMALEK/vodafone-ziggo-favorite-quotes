import { useCallback, useState } from 'react';

import { api, ApiError } from '../api/client';
import type { Quote } from '../models/quote';

export function useLikeQuote() {
  const [likedIds, setLikedIds] = useState<ReadonlySet<number>>(new Set());
  const [likingId, setLikingId] = useState<number | null>(null);

  const toggleLike = useCallback(
    async (quote: Quote): Promise<void> => {
      setLikingId(quote.id);
      try {
        if (likedIds.has(quote.id)) {
          try {
            await api.removeFavorite(quote.id);
          } catch (err) {
            // Already removed elsewhere (e.g. on the Favorites tab): treat as unliked.
            if (!(err instanceof ApiError && err.status === 404)) {
              throw err;
            }
          }
          setLikedIds((prev) => {
            const next = new Set(prev);
            next.delete(quote.id);
            return next;
          });
        } else {
          await api.saveFavorite(quote);
          setLikedIds((prev) => new Set(prev).add(quote.id));
        }
      } finally {
        setLikingId(null);
      }
    },
    [likedIds],
  );

  const isLiked = useCallback((id: number) => likedIds.has(id), [likedIds]);

  return { toggleLike, likingId, isLiked };
}
