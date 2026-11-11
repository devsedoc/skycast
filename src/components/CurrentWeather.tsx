import type { CurrentConditions, DailyPoint, Place, Unit } from '../types';
import { formatClock, formatLongDate, placeSubtitle } from '../utils/format';
import {
  degreesToCompass,
  formatPressure,
  formatTemp,
  formatWindSpeed,
  uvLevel,
} from '../utils/units';
import { describeWeather, getWeatherInfo } from '../utils/weatherCodes';
import { WeatherIcon } from './WeatherIcon';

interface Props {
  place: Place;
  current: CurrentConditions;
  today?: DailyPoint;
  unit: Unit;
  isFavorite: boolean;
  onToggleFavorite: () => void;
}

export function CurrentWeather({
  place,
  current,
  today,
  unit,
  isFavorite,
  onToggleFavorite,
}: Props) {
  const { condition } = getWeatherInfo(current.weatherCode);
  const description = describeWeather(current.weatherCode, current.isDay);
  const hour12 = unit === 'f' ? true : undefined;
  const subtitle = placeSubtitle(place);

  const details = [
    { label: 'Feels like', value: formatTemp(current.apparentTemperature, unit) },
    { label: 'Humidity', value: `${Math.round(current.humidity)}%` },
    {
      label: 'Wind',
      value: (
        <span className="wind">
          <svg
            className="wind__arrow"
            viewBox="0 0 24 24"
            aria-hidden="true"
            focusable="false"
            // Meteorological direction is where wind comes FROM; arrow points where it blows TO.
            style={{ transform: `rotate(${current.windDirection + 180}deg)` }}
          >
            <path d="M12 3l6 16-6-4-6 4z" fill="currentColor" />
          </svg>
          {formatWindSpeed(current.windSpeed, unit)} {degreesToCompass(current.windDirection)}
        </span>
      ),
    },
    { label: 'Pressure', value: formatPressure(current.pressure, unit) },
    {
      label: 'UV index',
      value:
        current.uvIndex === null
          ? '—'
          : `${Math.round(current.uvIndex)} · ${uvLevel(current.uvIndex)}`,
    },
  ];

  return (
    <section className="card current" aria-labelledby="current-heading">
      <header className="current__header">
        <div>
          <h2 id="current-heading" className="current__place">
            {place.name}
          </h2>
          {subtitle && <p className="current__sub">{subtitle}</p>}
          <p className="current__time">
            {formatLongDate(current.time)} · {formatClock(current.time, hour12)} local
          </p>
        </div>
        <button
          type="button"
          className="icon-btn favorite-btn"
          aria-pressed={isFavorite}
          aria-label={
            isFavorite ? `Remove ${place.name} from favorites` : `Add ${place.name} to favorites`
          }
          onClick={onToggleFavorite}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M12 3.5l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.9l-5.2 2.7 1-5.8-4.3-4.1 5.9-.9z" />
          </svg>
        </button>
      </header>

      <div className="current__main">
        <WeatherIcon condition={condition} isDay={current.isDay} size={96} />
        <div>
          <p className="current__temp">
            <span className="visually-hidden">Temperature </span>
            {formatTemp(current.temperature, unit)}
            <span className="current__unit" aria-hidden="true">
              {unit.toUpperCase()}
            </span>
            <span className="visually-hidden">{unit === 'c' ? 'Celsius' : 'Fahrenheit'}</span>
          </p>
          <p className="current__desc">{description}</p>
          {today && (
            <p className="current__hilo">
              <span>H: {formatTemp(today.max, unit)}</span>
              <span>L: {formatTemp(today.min, unit)}</span>
            </p>
          )}
        </div>
      </div>

      <dl className="details">
        {details.map((d) => (
          <div key={d.label} className="details__item">
            <dt>{d.label}</dt>
            <dd>{d.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
