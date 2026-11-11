import type { Place } from '../types';

/**
 * Open-Meteo returns local times without an offset ("2026-11-11T06:42").
 * We parse the parts and format them as UTC so the browser's own time zone never shifts them.
 */
function partsToUtcDate(local: string): Date | null {
  const m = /^(\d{4})-(\d{2})-(\d{2})(?:T(\d{2}):(\d{2}))?/.exec(local);
  if (!m) return null;
  const [, y, mo, d, h = '0', mi = '0'] = m;
  return new Date(Date.UTC(Number(y), Number(mo) - 1, Number(d), Number(h), Number(mi)));
}

export function formatClock(local: string, hour12?: boolean): string {
  const date = partsToUtcDate(local);
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, {
    hour: 'numeric',
    minute: '2-digit',
    hour12,
    timeZone: 'UTC',
  }).format(date);
}

export function formatHour(local: string, hour12?: boolean): string {
  const date = partsToUtcDate(local);
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, { hour: 'numeric', hour12, timeZone: 'UTC' }).format(
    date,
  );
}

export function formatWeekday(localDate: string, style: 'short' | 'long' = 'short'): string {
  const date = partsToUtcDate(localDate);
  if (!date) return '—';
  return new Intl.DateTimeFormat(undefined, { weekday: style, timeZone: 'UTC' }).format(date);
}

export function formatLongDate(local: string): string {
  const date = partsToUtcDate(local);
  if (!date) return '';
  return new Intl.DateTimeFormat(undefined, {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    timeZone: 'UTC',
  }).format(date);
}

/** Minutes between two local ISO times. */
export function minutesBetween(fromLocal: string, toLocal: string): number {
  const a = partsToUtcDate(fromLocal);
  const b = partsToUtcDate(toLocal);
  if (!a || !b) return NaN;
  return Math.round((b.getTime() - a.getTime()) / 60000);
}

export function formatDuration(minutes: number): string {
  if (!Number.isFinite(minutes) || minutes < 0) return '—';
  return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
}

export function formatCoords(lat: number, lon: number): string {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(2)}°${ns}, ${Math.abs(lon).toFixed(2)}°${ew}`;
}

/** Secondary line for a place: "Bavaria, Germany". */
export function placeSubtitle(place: Place): string {
  if (place.id.startsWith('geo:')) return formatCoords(place.latitude, place.longitude);
  return [place.admin1, place.country].filter(Boolean).join(', ');
}
