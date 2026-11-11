import type { Unit } from '../types';

export const celsiusToFahrenheit = (c: number): number => (c * 9) / 5 + 32;
export const fahrenheitToCelsius = (f: number): number => ((f - 32) * 5) / 9;
export const kmhToMph = (kmh: number): number => kmh / 1.609344;
export const hPaToInHg = (hPa: number): number => hPa * 0.0295299830714;

/** Convert a °C value to the display unit. */
export function convertTemp(celsius: number, unit: Unit): number {
  return unit === 'f' ? celsiusToFahrenheit(celsius) : celsius;
}

/** Rounded temperature with a degree sign, e.g. "21°". Returns "—" for missing data. */
export function formatTemp(celsius: number, unit: Unit, withUnit = false): string {
  if (!Number.isFinite(celsius)) return '—';
  // Math.round(-0.4) is -0; normalise so we never print "-0°".
  const value = Math.round(convertTemp(celsius, unit)) || 0;
  return `${value}°${withUnit ? unit.toUpperCase() : ''}`;
}

/** Wind speed in km/h (metric) or mph (imperial). */
export function formatWindSpeed(kmh: number, unit: Unit): string {
  if (!Number.isFinite(kmh)) return '—';
  return unit === 'f' ? `${Math.round(kmhToMph(kmh))} mph` : `${Math.round(kmh)} km/h`;
}

/** Pressure in hPa (metric) or inHg (imperial). */
export function formatPressure(hPa: number, unit: Unit): string {
  if (!Number.isFinite(hPa)) return '—';
  return unit === 'f' ? `${hPaToInHg(hPa).toFixed(2)} inHg` : `${Math.round(hPa)} hPa`;
}

const COMPASS = [
  'N',
  'NNE',
  'NE',
  'ENE',
  'E',
  'ESE',
  'SE',
  'SSE',
  'S',
  'SSW',
  'SW',
  'WSW',
  'W',
  'WNW',
  'NW',
  'NNW',
] as const;

/** 16-point compass direction for a bearing in degrees. */
export function degreesToCompass(deg: number): string {
  const normalised = ((deg % 360) + 360) % 360;
  return COMPASS[Math.round(normalised / 22.5) % 16] ?? 'N';
}

export function uvLevel(uv: number): string {
  if (uv < 3) return 'Low';
  if (uv < 6) return 'Moderate';
  if (uv < 8) return 'High';
  if (uv < 11) return 'Very high';
  return 'Extreme';
}
