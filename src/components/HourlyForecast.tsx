import type { HourlyPoint, Unit } from '../types';
import { formatHour } from '../utils/format';
import { formatTemp } from '../utils/units';
import { describeWeather, getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  hours: HourlyPoint[];
  unit: Unit;
}

export function HourlyForecast({ hours, unit }: Props) {
  const hour12 = unit === 'f' ? true : undefined;
  return (
    <section className="card" aria-labelledby="hourly-heading">
      <h2 id="hourly-heading" className="card__title">
        Next 24 hours
      </h2>
      {/* Focusable so keyboard users can scroll it with arrow keys. */}
      {/* eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex */}
      <div className="hourly" tabIndex={0} role="region" aria-label="Hourly forecast, scrollable">
        <ol className="hourly__list">
          {hours.map((h, i) => {
            const desc = describeWeather(h.weatherCode, h.isDay);
            const label = i === 0 ? 'Now' : formatHour(h.time, hour12);
            return (
              <li key={h.time} className="hourly__item">
                <span className="hourly__time">{label}</span>
                <WeatherIcon
                  condition={getWeatherInfo(h.weatherCode).condition}
                  isDay={h.isDay}
                  size={36}
                  label={desc}
                />
                <span className="hourly__temp">{formatTemp(h.temperature, unit)}</span>
                <span className="hourly__pop">
                  <span className="visually-hidden">Chance of precipitation </span>
                  {h.precipitationProbability === null ? '—' : `${h.precipitationProbability}%`}
                </span>
              </li>
            );
          })}
        </ol>
      </div>
    </section>
  );
}
