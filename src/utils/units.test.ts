import { describe, expect, it } from 'vitest';
import {
  celsiusToFahrenheit,
  convertTemp,
  degreesToCompass,
  fahrenheitToCelsius,
  formatPressure,
  formatTemp,
  formatWindSpeed,
  kmhToMph,
  uvLevel,
} from './units';

describe('temperature conversion', () => {
  it.each([
    [0, 32],
    [100, 212],
    [-40, -40],
    [37, 98.6],
  ])('converts %d°C to %d°F', (c, f) => {
    expect(celsiusToFahrenheit(c)).toBeCloseTo(f, 5);
  });

  it('round-trips between Celsius and Fahrenheit', () => {
    expect(fahrenheitToCelsius(celsiusToFahrenheit(21.5))).toBeCloseTo(21.5, 10);
  });

  it('convertTemp only converts when the unit is Fahrenheit', () => {
    expect(convertTemp(10, 'c')).toBe(10);
    expect(convertTemp(10, 'f')).toBe(50);
  });
});

describe('formatTemp', () => {
  it('rounds and adds the degree sign', () => {
    expect(formatTemp(21.4, 'c')).toBe('21°');
    expect(formatTemp(21.6, 'c')).toBe('22°');
    expect(formatTemp(0, 'f')).toBe('32°');
  });

  it('appends the unit letter when requested', () => {
    expect(formatTemp(20, 'c', true)).toBe('20°C');
    expect(formatTemp(20, 'f', true)).toBe('68°F');
  });

  it('never prints a negative zero', () => {
    expect(formatTemp(-0.4, 'c')).toBe('0°');
  });

  it('shows a dash for missing values', () => {
    expect(formatTemp(Number.NaN, 'c')).toBe('—');
  });
});

describe('wind and pressure', () => {
  it('converts km/h to mph', () => {
    expect(kmhToMph(160.9344)).toBeCloseTo(100, 4);
  });

  it('formats wind speed in the chosen unit', () => {
    expect(formatWindSpeed(20, 'c')).toBe('20 km/h');
    expect(formatWindSpeed(100, 'f')).toBe('62 mph');
  });

  it('formats pressure in hPa or inHg', () => {
    expect(formatPressure(1013, 'c')).toBe('1013 hPa');
    expect(formatPressure(1013, 'f')).toBe('29.91 inHg');
  });
});

describe('degreesToCompass', () => {
  it.each([
    [0, 'N'],
    [90, 'E'],
    [180, 'S'],
    [225, 'SW'],
    [359, 'N'],
    [360, 'N'],
    [-90, 'W'],
  ])('maps %d° to %s', (deg, dir) => {
    expect(degreesToCompass(deg)).toBe(dir);
  });
});

describe('uvLevel', () => {
  it.each([
    [0, 'Low'],
    [2.9, 'Low'],
    [3, 'Moderate'],
    [6, 'High'],
    [8, 'Very high'],
    [11, 'Extreme'],
  ])('UV %d is %s', (uv, level) => {
    expect(uvLevel(uv)).toBe(level);
  });
});
