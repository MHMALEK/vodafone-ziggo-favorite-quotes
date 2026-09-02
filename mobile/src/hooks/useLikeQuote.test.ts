import { act, renderHook } from '@testing-library/react-native';

import { api } from '../api/client';
import { useLikeQuote } from './useLikeQuote';

jest.mock('../api/client', () => ({
  ...jest.requireActual('../api/client'),
  api: { saveFavorite: jest.fn(), removeFavorite: jest.fn() },
}));

const mockedApi = api as jest.Mocked<typeof api>;

const quote = { id: 1, body: 'b', author: 'a', tags: [] };

describe('useLikeQuote', () => {
  it('marks a quote liked after a successful save', async () => {
    mockedApi.saveFavorite.mockResolvedValue({ ...quote, savedAt: '2026-09-01T12:00:00.000Z' });
    const { result } = renderHook(() => useLikeQuote());

    expect(result.current.isLiked(1)).toBe(false);
    await act(async () => {
      await result.current.toggleLike(quote);
    });

    expect(mockedApi.saveFavorite).toHaveBeenCalledWith(quote);
    expect(result.current.isLiked(1)).toBe(true);
    expect(result.current.likingId).toBeNull();
  });

  it('unlikes on the second toggle', async () => {
    mockedApi.saveFavorite.mockResolvedValue({ ...quote, savedAt: '2026-09-01T12:00:00.000Z' });
    mockedApi.removeFavorite.mockResolvedValue(undefined);
    const { result } = renderHook(() => useLikeQuote());

    await act(async () => {
      await result.current.toggleLike(quote);
    });
    await act(async () => {
      await result.current.toggleLike(quote);
    });

    expect(mockedApi.removeFavorite).toHaveBeenCalledWith(1);
    expect(result.current.isLiked(1)).toBe(false);
  });

  it('propagates a save failure and does not mark the quote liked', async () => {
    mockedApi.saveFavorite.mockRejectedValue(new Error('server down'));
    const { result } = renderHook(() => useLikeQuote());

    let thrown: unknown;
    await act(async () => {
      thrown = await result.current.toggleLike(quote).catch((err: unknown) => err);
    });

    expect(thrown).toBeInstanceOf(Error);
    expect(result.current.isLiked(1)).toBe(false);
    expect(result.current.likingId).toBeNull();
  });
});
