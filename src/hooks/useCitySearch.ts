import { useEffect, useState } from 'react';
import { MIN_QUERY_LENGTH, searchCities } from '../api/openMeteo';
import type { Place } from '../types';
import { useDebounce } from './useDebounce';

export type SearchStatus = 'idle' | 'loading' | 'success' | 'error';

export type SearchFn = (query: string) => Promise<Place[]>;

interface Result {
  query: string;
  results: Place[];
  error: string | null;
}

/** Debounced city autocomplete. Stale responses are ignored. */
export function useCitySearch(query: string, searchFn: SearchFn = searchCities, delayMs = 300) {
  const trimmed = query.trim();
  const debounced = useDebounce(trimmed, delayMs);
  const [result, setResult] = useState<Result | null>(null);

  useEffect(() => {
    if (debounced.length < MIN_QUERY_LENGTH) return;
    let cancelled = false;
    searchFn(debounced).then(
      (results) => {
        if (!cancelled) setResult({ query: debounced, results, error: null });
      },
      (err: unknown) => {
        if (!cancelled)
          setResult({
            query: debounced,
            results: [],
            error: err instanceof Error ? err.message : 'Search failed.',
          });
      },
    );
    return () => {
      cancelled = true;
    };
  }, [debounced, searchFn]);

  // Status is derived, so no state needs resetting when the query changes.
  let status: SearchStatus;
  if (trimmed.length < MIN_QUERY_LENGTH) status = 'idle';
  else if (trimmed !== debounced || result?.query !== debounced) status = 'loading';
  else status = result.error ? 'error' : 'success';

  return {
    status,
    results: status === 'success' && result ? result.results : [],
    error: status === 'error' && result ? result.error : null,
  };
}
