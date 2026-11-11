/** Broad condition groups, used for icons and theming. */
export type Condition =
  'clear' | 'partly-cloudy' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunder';

export interface WeatherInfo {
  code: number;
  label: string;
  condition: Condition;
}

/** WMO weather interpretation codes, as used by Open-Meteo. */
const WMO_CODES: Record<number, { label: string; condition: Condition }> = {
  0: { label: 'Clear sky', condition: 'clear' },
  1: { label: 'Mainly clear', condition: 'clear' },
  2: { label: 'Partly cloudy', condition: 'partly-cloudy' },
  3: { label: 'Overcast', condition: 'cloudy' },
  45: { label: 'Fog', condition: 'fog' },
  48: { label: 'Depositing rime fog', condition: 'fog' },
  51: { label: 'Light drizzle', condition: 'drizzle' },
  53: { label: 'Drizzle', condition: 'drizzle' },
  55: { label: 'Dense drizzle', condition: 'drizzle' },
  56: { label: 'Light freezing drizzle', condition: 'drizzle' },
  57: { label: 'Freezing drizzle', condition: 'drizzle' },
  61: { label: 'Light rain', condition: 'rain' },
  63: { label: 'Rain', condition: 'rain' },
  65: { label: 'Heavy rain', condition: 'rain' },
  66: { label: 'Light freezing rain', condition: 'rain' },
  67: { label: 'Freezing rain', condition: 'rain' },
  71: { label: 'Light snow', condition: 'snow' },
  73: { label: 'Snow', condition: 'snow' },
  75: { label: 'Heavy snow', condition: 'snow' },
  77: { label: 'Snow grains', condition: 'snow' },
  80: { label: 'Light showers', condition: 'rain' },
  81: { label: 'Showers', condition: 'rain' },
  82: { label: 'Violent showers', condition: 'rain' },
  85: { label: 'Light snow showers', condition: 'snow' },
  86: { label: 'Heavy snow showers', condition: 'snow' },
  95: { label: 'Thunderstorm', condition: 'thunder' },
  96: { label: 'Thunderstorm with hail', condition: 'thunder' },
  99: { label: 'Thunderstorm with heavy hail', condition: 'thunder' },
};

export function getWeatherInfo(code: number): WeatherInfo {
  const entry = WMO_CODES[code];
  if (!entry) return { code, label: 'Unknown', condition: 'cloudy' };
  return { code, ...entry };
}

/** Description adjusted for night, e.g. "Clear sky" → "Clear night". */
export function describeWeather(code: number, isDay: boolean): string {
  const { label } = getWeatherInfo(code);
  if (!isDay && (code === 0 || code === 1)) return code === 0 ? 'Clear night' : 'Mainly clear';
  return label;
}
