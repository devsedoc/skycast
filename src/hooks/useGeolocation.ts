import { useCallback, useState } from 'react';

export type GeoStatus = 'idle' | 'locating' | 'error';

export interface Coords {
  latitude: number;
  longitude: number;
}

function messageFor(error: GeolocationPositionError): string {
  switch (error.code) {
    case error.PERMISSION_DENIED:
      return 'Location access was denied. Allow location for this site in your browser settings, or search for a city instead.';
    case error.POSITION_UNAVAILABLE:
      return 'Your location is unavailable right now. Try again, or search for a city.';
    case error.TIMEOUT:
      return 'Finding your location took too long. Try again, or search for a city.';
    default:
      return 'Could not get your location.';
  }
}

/** Wraps the browser Geolocation API. `locate()` resolves to coordinates, or null on failure. */
export function useGeolocation() {
  const [status, setStatus] = useState<GeoStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const locate = useCallback((): Promise<Coords | null> => {
    if (!('geolocation' in navigator)) {
      setStatus('error');
      setError('Your browser does not support location access. Search for a city instead.');
      return Promise.resolve(null);
    }
    setStatus('locating');
    setError(null);
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setStatus('idle');
          resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude });
        },
        (err) => {
          setStatus('error');
          setError(messageFor(err));
          resolve(null);
        },
        { enableHighAccuracy: false, timeout: 10000, maximumAge: 5 * 60 * 1000 },
      );
    });
  }, []);

  const dismiss = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, locate, dismiss };
}
