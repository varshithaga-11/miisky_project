/**
 * utils/hooks/useApiData.ts
 * Custom hook for fetching data from API with loading/error handling
 */

import { useState, useEffect } from 'react';

interface UseApiDataOptions<T> {
  fallbackData: T;
  shouldFetch?: boolean;
}

interface UseApiDataReturn<T> {
  data: T;
  loading: boolean;
  error: string | null;
}

export function useApiData<T>(
  fetchFn: () => Promise<any>,
  options: UseApiDataOptions<T>
): UseApiDataReturn<T> {
  const [data, setData] = useState<T>(options.fallbackData);
  const [loading, setLoading] = useState(options.shouldFetch !== false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (options.shouldFetch === false) {
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        const response = await fetchFn();
        const apiData = response.data;

        // Handle both array and paginated responses
        const items = Array.isArray(apiData) ? apiData : apiData.results || apiData;
        setData(items.length > 0 ? items : options.fallbackData);
        setError(null);
      } catch (err) {
        console.warn('API fetch failed:', err);
        setData(options.fallbackData);
        setError(null); // Don't show error to user, use fallback
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [fetchFn, options.shouldFetch]);

  return { data, loading, error };
}
