import { useCallback, useEffect, useState } from 'react';
import { getForecast } from '../api/openMeteo';
import type { Forecast, Place } from '../types';

export type WeatherStatus = 'idle' | 'loading' | 'success' | 'error';

interface Result {
  key: string;
  data: Forecast | null;
  error: string | null;
}

/** Fetches the forecast for `place`, with a `retry` for failed requests. */
export function useWeather(place: Place | null) {
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState<Result | null>(null);
  const key = place ? `${place.latitude},${place.longitude}#${attempt}` : null;

  useEffect(() => {
    if (!place || !key) return;
    let cancelled = false;
    getForecast(place.latitude, place.longitude).then(
      (data) => {
        if (!cancelled) setResult({ key, data, error: null });
      },
      (err: unknown) => {
        if (!cancelled)
          setResult({
            key,
            data: null,
            error: err instanceof Error ? err.message : 'Could not load the forecast.',
          });
      },
    );
    return () => {
      cancelled = true;
    };
    // `key` captures the coordinates and retry attempt.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);

  const retry = useCallback(() => setAttempt((n) => n + 1), []);

  let status: WeatherStatus;
  if (!key) status = 'idle';
  else if (result?.key !== key) status = 'loading';
  else status = result.error ? 'error' : 'success';

  return {
    status,
    data: status === 'success' ? (result?.data ?? null) : null,
    error: status === 'error' ? (result?.error ?? null) : null,
    retry,
  };
}
