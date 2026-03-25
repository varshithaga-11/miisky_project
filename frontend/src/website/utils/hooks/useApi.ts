/**
 * utils/hooks/useApi.ts
 * ─────────────────────────────────────────────────────────────────────────────
 * A generic React hook for fetching data from the centralized API layer.
 * Returns { data, loading, error, refetch } so components stay clean.
 *
 * Usage:
 *   const { data: doctors, loading } = useApi(
 *     () => doctorsApi.list(),
 *     { fallback: MOCK_DOCTORS }
 *   );
 * ─────────────────────────────────────────────────────────────────────────────
 */

import { useState, useEffect, useCallback } from "react";

interface UseApiOptions<T> {
  /** Data to use immediately (mock) while the real fetch resolves */
  fallback?: T;
  /** If true, the fetch does NOT run automatically on mount */
  lazy?: boolean;
}

interface UseApiResult<T> {
  data: T | undefined;
  loading: boolean;
  error: string | null;
  /** Manually trigger a re-fetch */
  refetch: () => Promise<void>;
}

export function useApi<T>(
  fetcher: () => Promise<T>,
  options: UseApiOptions<T> = {}
): UseApiResult<T> {
  const { fallback, lazy = false } = options;

  const [data, setData] = useState<T | undefined>(fallback);
  const [loading, setLoading] = useState(!lazy);
  const [error, setError] = useState<string | null>(null);

  const run = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await fetcher();
      setData(result);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(message);
      // Keep the fallback data visible on error
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!lazy) {
      run();
    }
  }, [lazy, run]);

  return { data, loading, error, refetch: run };
}

// ─── Convenience wrappers ─────────────────────────────────────────────────────

/** Fetch a paginated list — returns the `results` array directly */
export function useList<T>(
  fetcher: () => Promise<{ results: T[]; count: number }>,
  fallback: T[] = []
): UseApiResult<T[]> & { count: number } {
  const [count, setCount] = useState(0);
  const { data, loading, error, refetch } = useApi(
    async () => {
      const res = await fetcher();
      setCount(res.count);
      return res.results;
    },
    { fallback }
  );

  return { data: data ?? fallback, loading, error, refetch, count };
}
