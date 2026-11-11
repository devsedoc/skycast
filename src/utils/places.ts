import type { Place, Unit } from '../types';

export const MAX_RECENTS = 6;

export function samePlace(a: Place, b: Place): boolean {
  return a.id === b.id;
}

/** Put `place` at the front of the list, de-duplicated and capped. */
export function addRecent(list: Place[], place: Place, max = MAX_RECENTS): Place[] {
  return [place, ...list.filter((p) => !samePlace(p, place))].slice(0, max);
}

export function toggleInList(list: Place[], place: Place): Place[] {
  return list.some((p) => samePlace(p, place))
    ? list.filter((p) => !samePlace(p, place))
    : [...list, place];
}

/* ---------- Guards for data read back from localStorage ---------- */

export function isPlace(value: unknown): value is Place {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    typeof v.id === 'string' &&
    typeof v.name === 'string' &&
    typeof v.latitude === 'number' &&
    typeof v.longitude === 'number'
  );
}

export const isPlaceList = (value: unknown): value is Place[] =>
  Array.isArray(value) && value.every(isPlace);

export const isPlaceOrNull = (value: unknown): value is Place | null =>
  value === null || isPlace(value);

export const isUnit = (value: unknown): value is Unit => value === 'c' || value === 'f';
