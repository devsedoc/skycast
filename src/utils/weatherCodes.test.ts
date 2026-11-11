import { describe, expect, it } from 'vitest';
import { describeWeather, getWeatherInfo } from './weatherCodes';

describe('getWeatherInfo', () => {
  it.each([
    [0, 'Clear sky', 'clear'],
    [1, 'Mainly clear', 'clear'],
    [2, 'Partly cloudy', 'partly-cloudy'],
    [3, 'Overcast', 'cloudy'],
    [45, 'Fog', 'fog'],
    [53, 'Drizzle', 'drizzle'],
    [63, 'Rain', 'rain'],
    [75, 'Heavy snow', 'snow'],
    [82, 'Violent showers', 'rain'],
    [95, 'Thunderstorm', 'thunder'],
    [99, 'Thunderstorm with heavy hail', 'thunder'],
  ])('maps WMO code %i to "%s" (%s)', (code, label, condition) => {
    expect(getWeatherInfo(code)).toEqual({ code, label, condition });
  });

  it('falls back to Unknown for codes outside the WMO table', () => {
    expect(getWeatherInfo(7)).toEqual({ code: 7, label: 'Unknown', condition: 'cloudy' });
    expect(getWeatherInfo(-1).label).toBe('Unknown');
  });
});

describe('describeWeather', () => {
  it('says "Clear night" for clear skies after dark', () => {
    expect(describeWeather(0, false)).toBe('Clear night');
    expect(describeWeather(0, true)).toBe('Clear sky');
  });

  it('keeps the normal label for other codes at night', () => {
    expect(describeWeather(1, false)).toBe('Mainly clear');
    expect(describeWeather(63, false)).toBe('Rain');
  });
});
