export type Unit = 'c' | 'f';

/** A location the user can view weather for. */
export interface Place {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  country?: string;
  admin1?: string;
  timezone?: string;
}

export interface CurrentConditions {
  time: string;
  temperature: number;
  apparentTemperature: number;
  humidity: number;
  isDay: boolean;
  weatherCode: number;
  /** km/h */
  windSpeed: number;
  /** degrees, meteorological (direction wind comes FROM) */
  windDirection: number;
  /** hPa, mean sea level */
  pressure: number;
  uvIndex: number | null;
}

export interface HourlyPoint {
  /** Local ISO time without offset, e.g. 2026-11-11T14:00 */
  time: string;
  temperature: number;
  weatherCode: number;
  precipitationProbability: number | null;
  isDay: boolean;
}

export interface DailyPoint {
  /** Local date, e.g. 2026-11-11 */
  date: string;
  weatherCode: number;
  max: number;
  min: number;
  precipitationProbability: number | null;
  sunrise: string;
  sunset: string;
  uvIndexMax: number | null;
}

/** Forecast data, always in metric units (°C, km/h, hPa). Conversion happens at render time. */
export interface Forecast {
  timezone: string;
  current: CurrentConditions;
  hourly: HourlyPoint[];
  daily: DailyPoint[];
}
