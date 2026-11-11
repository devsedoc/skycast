import { useEffect } from 'react';
import { nextHours } from './api/openMeteo';
import { CurrentWeather } from './components/CurrentWeather';
import { DailyForecast } from './components/DailyForecast';
import { ErrorState, WeatherSkeleton } from './components/Feedback';
import { HourlyForecast } from './components/HourlyForecast';
import { PlaceList } from './components/PlaceList';
import { SearchBar } from './components/SearchBar';
import { SunTimes } from './components/SunTimes';
import { UnitToggle } from './components/UnitToggle';
import { useGeolocation } from './hooks/useGeolocation';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useWeather } from './hooks/useWeather';
import type { Place, Unit } from './types';
import {
  addRecent,
  isPlaceList,
  isPlaceOrNull,
  isUnit,
  samePlace,
  toggleInList,
} from './utils/places';
import { describeWeather, getWeatherInfo } from './utils/weatherCodes';
import { formatTemp } from './utils/units';

export default function App() {
  const [unit, setUnit] = useLocalStorage<Unit>('skycast:unit', 'c', isUnit);
  const [recents, setRecents] = useLocalStorage<Place[]>('skycast:recents', [], isPlaceList);
  const [favorites, setFavorites] = useLocalStorage<Place[]>('skycast:favorites', [], isPlaceList);
  const [place, setPlace] = useLocalStorage<Place | null>(
    'skycast:last-place',
    null,
    isPlaceOrNull,
  );

  const weather = useWeather(place);
  const geo = useGeolocation();

  const current = weather.data?.current;
  const condition = current ? getWeatherInfo(current.weatherCode).condition : 'clear';
  const timeOfDay = current && !current.isDay ? 'night' : 'day';
  const isFavorite = place ? favorites.some((f) => samePlace(f, place)) : false;

  useEffect(() => {
    document.title =
      place && current
        ? `${formatTemp(current.temperature, unit)} ${describeWeather(current.weatherCode, current.isDay)} · ${place.name} | Skycast`
        : 'Skycast Weather';
  }, [place, current, unit]);

  function selectPlace(p: Place) {
    setPlace(p);
    if (!p.id.startsWith('geo:')) setRecents((r) => addRecent(r, p));
  }

  async function locateMe() {
    const coords = await geo.locate();
    if (!coords) return;
    setPlace({
      id: `geo:${coords.latitude.toFixed(2)},${coords.longitude.toFixed(2)}`,
      name: 'Your location',
      latitude: coords.latitude,
      longitude: coords.longitude,
    });
  }

  return (
    <div className="app" data-condition={condition} data-time={timeOfDay}>
      <a className="skip-link" href="#main">
        Skip to forecast
      </a>
      <header className="app__header">
        <p className="brand">
          <svg viewBox="0 0 64 64" aria-hidden="true" focusable="false">
            <circle cx="26" cy="26" r="12" fill="#f5b83d" />
            <path d="M22 48a10 10 0 0 1 1-20 13 13 0 0 1 25 4 8 8 0 0 1 0 16z" fill="#e8f1fc" />
          </svg>
          Skycast
        </p>
        <UnitToggle unit={unit} onChange={setUnit} />
      </header>

      <div className="toolbar">
        <SearchBar onSelect={selectPlace} />
        <button
          type="button"
          className="btn locate-btn"
          onClick={locateMe}
          disabled={geo.status === 'locating'}
          aria-busy={geo.status === 'locating'}
        >
          <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <circle cx="12" cy="12" r="4" fill="currentColor" />
            <path
              d="M12 2v3M12 19v3M2 12h3M19 12h3"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <circle cx="12" cy="12" r="7.5" fill="none" stroke="currentColor" strokeWidth="2" />
          </svg>
          <span>{geo.status === 'locating' ? 'Locating…' : 'Use my location'}</span>
        </button>
      </div>

      <div className="saved">
        <PlaceList
          title="Favorites"
          places={favorites}
          currentId={place?.id}
          onSelect={setPlace}
          onRemove={(p) => setFavorites((list) => list.filter((f) => !samePlace(f, p)))}
        />
        <PlaceList
          title="Recent searches"
          places={recents}
          currentId={place?.id}
          onSelect={selectPlace}
          onClear={() => setRecents([])}
        />
      </div>

      <main id="main" className="app__main" tabIndex={-1}>
        {geo.status === 'error' && geo.error && (
          <ErrorState title="Couldn’t use your location" onDismiss={geo.dismiss}>
            {geo.error}
          </ErrorState>
        )}

        {!place && geo.status !== 'error' && (
          <div className="card empty-state">
            <h1 className="empty-state__title">Check the weather anywhere</h1>
            <p>Search for a city above, or use your current location to get started.</p>
          </div>
        )}

        {place && weather.status === 'loading' && <WeatherSkeleton />}

        {place && weather.status === 'error' && (
          <ErrorState
            title="Couldn’t load the forecast"
            action={{ label: 'Try again', onClick: weather.retry }}
          >
            {weather.error}
          </ErrorState>
        )}

        {place && weather.data && (
          <div className="grid">
            <h1 className="visually-hidden">Weather for {place.name}</h1>
            <CurrentWeather
              place={place}
              current={weather.data.current}
              today={weather.data.daily[0]}
              unit={unit}
              isFavorite={isFavorite}
              onToggleFavorite={() => setFavorites((list) => toggleInList(list, place))}
            />
            <HourlyForecast
              hours={nextHours(weather.data.hourly, weather.data.current.time, 24)}
              unit={unit}
            />
            <div className="stack">
              <DailyForecast days={weather.data.daily} unit={unit} />
              {weather.data.daily[0] && <SunTimes today={weather.data.daily[0]} unit={unit} />}
            </div>
          </div>
        )}
      </main>

      <footer className="app__footer">
        Weather data by{' '}
        <a href="https://open-meteo.com/" target="_blank" rel="noreferrer">
          Open-Meteo.com
        </a>
      </footer>
    </div>
  );
}
