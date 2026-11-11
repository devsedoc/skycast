import type { DailyPoint, Forecast, HourlyPoint, Place } from '../types';
import { TtlCache, cachedPromise } from './cache';

const GEOCODING_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const FORECAST_URL = 'https://api.open-meteo.com/v1/forecast';

export type ApiErrorKind = 'network' | 'http' | 'parse';

export class WeatherApiError extends Error {
  readonly kind: ApiErrorKind;

  constructor(kind: ApiErrorKind, message: string) {
    super(message);
    this.name = 'WeatherApiError';
    this.kind = kind;
  }
}

/* ---------- Raw response shapes (only the fields we request) ---------- */

interface RawGeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

interface RawGeocodingResponse {
  results?: RawGeocodingResult[];
}

type Num = number | null;

interface RawForecastResponse {
  timezone: string;
  current: {
    time: string;
    temperature_2m: number;
    apparent_temperature: number;
    relative_humidity_2m: number;
    is_day: number;
    weather_code: number;
    wind_speed_10m: number;
    wind_direction_10m: number;
    pressure_msl: number;
    uv_index?: Num;
  };
  hourly: {
    time: string[];
    temperature_2m: Num[];
    weather_code: Num[];
    precipitation_probability: Num[];
    is_day: Num[];
  };
  daily: {
    time: string[];
    weather_code: Num[];
    temperature_2m_max: Num[];
    temperature_2m_min: Num[];
    precipitation_probability_max: Num[];
    sunrise: string[];
    sunset: string[];
    uv_index_max: Num[];
  };
}

/* ---------- HTTP ---------- */

async function getJson<T>(url: string): Promise<T> {
  let res: Response;
  try {
    res = await fetch(url);
  } catch {
    throw new WeatherApiError(
      'network',
      'Could not reach the weather service. Check your connection and try again.',
    );
  }
  if (!res.ok) {
    let reason = `The weather service returned an error (${res.status}).`;
    try {
      const body = (await res.json()) as { reason?: string };
      if (body.reason) reason = body.reason;
    } catch {
      /* keep default message */
    }
    throw new WeatherApiError('http', reason);
  }
  try {
    return (await res.json()) as T;
  } catch {
    throw new WeatherApiError('parse', 'Received an invalid response from the weather service.');
  }
}

/* ---------- Caches ---------- */

const geocodingCache = new TtlCache<Promise<Place[]>>(24 * 60 * 60 * 1000, 200);
const forecastCache = new TtlCache<Promise<Forecast>>(10 * 60 * 1000, 50);

/** Exposed for tests. */
export function clearApiCache(): void {
  geocodingCache.clear();
  forecastCache.clear();
}

/* ---------- Geocoding ---------- */

export const MIN_QUERY_LENGTH = 2;

export function searchCities(query: string, count = 6): Promise<Place[]> {
  const q = query.trim();
  if (q.length < MIN_QUERY_LENGTH) return Promise.resolve([]);
  const key = `${q.toLowerCase()}|${count}`;
  return cachedPromise(geocodingCache, key, async () => {
    const params = new URLSearchParams({
      name: q,
      count: String(count),
      language: 'en',
      format: 'json',
    });
    const data = await getJson<RawGeocodingResponse>(`${GEOCODING_URL}?${params}`);
    return (data.results ?? []).map((r): Place => ({
      id: String(r.id),
      name: r.name,
      latitude: r.latitude,
      longitude: r.longitude,
      country: r.country,
      admin1: r.admin1,
      timezone: r.timezone,
    }));
  });
}

/* ---------- Forecast ---------- */

const CURRENT_VARS = [
  'temperature_2m',
  'apparent_temperature',
  'relative_humidity_2m',
  'is_day',
  'weather_code',
  'wind_speed_10m',
  'wind_direction_10m',
  'pressure_msl',
  'uv_index',
];
const HOURLY_VARS = ['temperature_2m', 'weather_code', 'precipitation_probability', 'is_day'];
const DAILY_VARS = [
  'weather_code',
  'temperature_2m_max',
  'temperature_2m_min',
  'precipitation_probability_max',
  'sunrise',
  'sunset',
  'uv_index_max',
];

/** Round coordinates so nearby lookups (~1 km) share a cache entry. */
const roundCoord = (n: number) => Math.round(n * 100) / 100;

export function getForecast(latitude: number, longitude: number): Promise<Forecast> {
  const lat = roundCoord(latitude);
  const lon = roundCoord(longitude);
  return cachedPromise(forecastCache, `${lat},${lon}`, async () => {
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      current: CURRENT_VARS.join(','),
      hourly: HOURLY_VARS.join(','),
      daily: DAILY_VARS.join(','),
      timezone: 'auto',
      forecast_days: '7',
      wind_speed_unit: 'kmh',
    });
    const raw = await getJson<RawForecastResponse>(`${FORECAST_URL}?${params}`);
    return mapForecast(raw);
  });
}

export function mapForecast(raw: RawForecastResponse): Forecast {
  const c = raw.current;
  const hourly: HourlyPoint[] = raw.hourly.time.map((time, i) => ({
    time,
    temperature: raw.hourly.temperature_2m[i] ?? NaN,
    weatherCode: raw.hourly.weather_code[i] ?? -1,
    precipitationProbability: raw.hourly.precipitation_probability[i] ?? null,
    isDay: raw.hourly.is_day[i] === 1,
  }));
  const daily: DailyPoint[] = raw.daily.time.map((date, i) => ({
    date,
    weatherCode: raw.daily.weather_code[i] ?? -1,
    max: raw.daily.temperature_2m_max[i] ?? NaN,
    min: raw.daily.temperature_2m_min[i] ?? NaN,
    precipitationProbability: raw.daily.precipitation_probability_max[i] ?? null,
    sunrise: raw.daily.sunrise[i] ?? '',
    sunset: raw.daily.sunset[i] ?? '',
    uvIndexMax: raw.daily.uv_index_max[i] ?? null,
  }));
  return {
    timezone: raw.timezone,
    current: {
      time: c.time,
      temperature: c.temperature_2m,
      apparentTemperature: c.apparent_temperature,
      humidity: c.relative_humidity_2m,
      isDay: c.is_day === 1,
      weatherCode: c.weather_code,
      windSpeed: c.wind_speed_10m,
      windDirection: c.wind_direction_10m,
      pressure: c.pressure_msl,
      uvIndex: c.uv_index ?? daily[0]?.uvIndexMax ?? null,
    },
    hourly,
    daily,
  };
}

/** The `count` hourly points starting at the hour containing `fromTime` (local ISO strings). */
export function nextHours(hourly: HourlyPoint[], fromTime: string, count = 24): HourlyPoint[] {
  const hourStart = fromTime.slice(0, 13); // "YYYY-MM-DDTHH"
  let start = hourly.findIndex((h) => h.time.slice(0, 13) >= hourStart);
  if (start === -1) start = 0;
  return hourly.slice(start, start + count);
}
