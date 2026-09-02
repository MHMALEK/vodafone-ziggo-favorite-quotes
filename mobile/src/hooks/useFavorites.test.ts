import { act, renderHook } from '@testing-library/react-native';

import { api } from '../api/client';
import { useFavorites } from './useFavorites';

jest.mock('../api/client', () => ({
  api: { listFavorites: jest.fn(), removeFavorite: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const favorite = { id: 1, body: 'b', author: 'a', tags: [], savedAt: '2026-09-01T12:00:00.000Z' };

describe('useFavorites', () => {
  it('does not load until refresh, then exposes favorites', async () => {
    mockedApi.listFavorites.mockResolvedValue([favorite]);
    const { result } = renderHook(() => useFavorites());

    expect(mockedApi.listFavorites).not.toHaveBeenCalled();
    await act(async () => {
      await result.current.refresh();
    });

    expect(result.current.favorites).toEqual([favorite]);
  });

  it('remove deletes via the API and reloads the list', async () => {
    mockedApi.listFavorites.mockResolvedValueOnce([favorite]).mockResolvedValueOnce([]);
    mockedApi.removeFavorite.mockResolvedValue(undefined);
    const { result } = renderHook(() => useFavorites());
    await act(async () => {
      await result.current.refresh();
    });

    await act(async () => {
      await result.current.remove(1);
    });

    expect(mockedApi.removeFavorite).toHaveBeenCalledWith(1);
    expect(result.current.favorites).toEqual([]);
  });
});
