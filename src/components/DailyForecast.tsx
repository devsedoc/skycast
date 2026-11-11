import type { DailyPoint, Unit } from '../types';
import { formatWeekday } from '../utils/format';
import { formatTemp } from '../utils/units';
import { getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  days: DailyPoint[];
  unit: Unit;
}

export function DailyForecast({ days, unit }: Props) {
  const lows = days.map((d) => d.min).filter(Number.isFinite);
  const highs = days.map((d) => d.max).filter(Number.isFinite);
  const weekMin = Math.min(...lows);
  const weekMax = Math.max(...highs);
  const span = weekMax - weekMin || 1;

  return (
    <section className="card" aria-labelledby="daily-heading">
      <h2 id="daily-heading" className="card__title">
        7-day forecast
      </h2>
      <ol className="daily">
        {days.map((d, i) => {
          const info = getWeatherInfo(d.weatherCode);
          const left = ((d.min - weekMin) / span) * 100;
          const width = ((d.max - d.min) / span) * 100;
          return (
            <li key={d.date} className="daily__row">
              <span className="daily__day">
                {i === 0 ? 'Today' : formatWeekday(d.date)}
                <span className="visually-hidden">, {formatWeekday(d.date, 'long')}</span>
              </span>
              <WeatherIcon condition={info.condition} isDay size={32} label={info.label} />
              <span className="daily__pop">
                <span className="visually-hidden">Chance of precipitation </span>
                {d.precipitationProbability === null ? '—' : `${d.precipitationProbability}%`}
              </span>
              <span className="daily__low">
                <span className="visually-hidden">Low </span>
                {formatTemp(d.min, unit)}
              </span>
              <span className="daily__bar" aria-hidden="true">
                <span
                  className="daily__range"
                  style={{ left: `${left}%`, width: `${Math.max(width, 4)}%` }}
                />
              </span>
              <span className="daily__high">
                <span className="visually-hidden">High </span>
                {formatTemp(d.max, unit)}
              </span>
            </li>
          );
        })}
      </ol>
    </section>
  );
}
