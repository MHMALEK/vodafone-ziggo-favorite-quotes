import { act, renderHook, waitFor } from '@testing-library/react-native';

import { useAsync } from './useAsync';

describe('useAsync', () => {
  it('loads immediately and exposes the data', async () => {
    const fn = jest.fn().mockResolvedValue('payload');
    const { result } = renderHook(() => useAsync(fn));

    expect(result.current.loading).toBe(true);
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.data).toBe('payload');
    expect(result.current.error).toBeNull();
  });

  it('captures a failure as an error message and keeps previous data', async () => {
    const fn = jest
      .fn()
      .mockResolvedValueOnce('first')
      .mockRejectedValueOnce(new Error('server down'));
    const { result } = renderHook(() => useAsync(fn));
    await waitFor(() => expect(result.current.data).toBe('first'));

    await act(async () => {
      await result.current.reload();
    });

    expect(result.current.error).toBe('server down');
    expect(result.current.data).toBe('first');
    expect(result.current.loading).toBe(false);
  });

  it('does not run until reload when immediate is false', async () => {
    const fn = jest.fn().mockResolvedValue('later');
    const { result } = renderHook(() => useAsync(fn, { immediate: false }));

    expect(fn).not.toHaveBeenCalled();
    expect(result.current.loading).toBe(false);

    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.data).toBe('later');
  });

  it('reload replaces the data', async () => {
    const fn = jest.fn().mockResolvedValueOnce('a').mockResolvedValueOnce('b');
    const { result } = renderHook(() => useAsync(fn));
    await waitFor(() => expect(result.current.data).toBe('a'));

    await act(async () => {
      await result.current.reload();
    });
    expect(result.current.data).toBe('b');
  });
});
