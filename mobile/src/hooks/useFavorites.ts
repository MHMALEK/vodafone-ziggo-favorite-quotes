import { useCallback } from 'react';

import { api } from '../api/client';
import { useAsync } from './useAsync';

export function useFavorites() {
  const { data, loading, error, reload } = useAsync(api.listFavorites, { immediate: false });

  const remove = useCallback(
    async (id: number): Promise<void> => {
      await api.removeFavorite(id);
      await reload();
    },
    [reload],
  );

  return { favorites: data, loading, error, refresh: reload, remove };
}
