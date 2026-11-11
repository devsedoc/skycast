import { useEffect, useState, type Dispatch, type SetStateAction } from 'react';

function read<T>(key: string, fallback: T, validate?: (value: unknown) => value is T): T {
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    const parsed: unknown = JSON.parse(raw);
    if (validate && !validate(parsed)) return fallback;
    return parsed as T;
  } catch {
    // Storage blocked (private mode) or corrupt JSON: fall back silently.
    return fallback;
  }
}

/**
 * useState that is persisted to localStorage as JSON.
 * `validate` guards against stale or tampered data from older versions.
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  validate?: (value: unknown) => value is T,
): [T, Dispatch<SetStateAction<T>>] {
  const [value, setValue] = useState<T>(() => read(key, initialValue, validate));

  useEffect(() => {
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch {
      /* quota exceeded or storage unavailable: keep in-memory state */
    }
  }, [key, value]);

  return [value, setValue];
}
