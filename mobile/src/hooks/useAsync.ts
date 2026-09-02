import { useCallback, useEffect, useRef, useState } from 'react';

interface AsyncState<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useAsync<T>(fn: () => Promise<T>, { immediate = true } = {}) {
  const fnRef = useRef(fn);
  fnRef.current = fn;

  const [state, setState] = useState<AsyncState<T>>({
    data: null,
    loading: immediate,
    error: null,
  });
  const runId = useRef(0);

  const reload = useCallback(async () => {
    const id = ++runId.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));
    try {
      const data = await fnRef.current();
      if (id === runId.current) {
        setState({ data, loading: false, error: null });
      }
    } catch (err) {
      if (id === runId.current) {
        setState((prev) => ({
          data: prev.data,
          loading: false,
          error: err instanceof Error ? err.message : 'Something went wrong',
        }));
      }
    }
  }, []);

  useEffect(() => {
    if (immediate) {
      void reload();
    }
  }, [immediate, reload]);

  return { ...state, reload };
}
