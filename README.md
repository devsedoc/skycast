# Skycast Weather

A single-page weather app built with **Vite + React + TypeScript**, using the free
[Open-Meteo](https://open-meteo.com/) Geocoding and Forecast APIs (no API key required).



## Features

- **City search** with debounced autocomplete (ARIA combobox, keyboard navigable)
- **Use my location** via the browser Geolocation API, with clear messages when denied or unavailable
- **Current conditions**: temperature, feels like, humidity, wind speed and direction, pressure,
  UV index, and a weather icon plus description mapped from the WMO weather code
- **Hourly forecast** for the next 24 hours (horizontally scrollable)
- **7-day forecast** with high/low temperatures and precipitation chance
- **Sunrise, sunset and daylight** times
- **°C / °F toggle**, persisted in `localStorage`
- **Recent searches and favorites**, persisted in `localStorage`
- **Adaptive theme**: background and accent colors change with the condition and day/night;
  light and dark mode follow the system preference
- Loading skeletons and error states (city not found, network failure, location denied)
- Accessible: semantic HTML, labelled controls, live regions, visible focus, reduced-motion support

## Requirements

- Node.js 20 or newer (developed on Node 24)
- npm 9 or newer

## Setup

```bash
npm install
npm run dev
```

Then open the URL Vite prints (default: <http://localhost:5173>).

## Scripts

| Script                 | Description                                          |
| ---------------------- | ---------------------------------------------------- |
| `npm run dev`          | Start the Vite dev server with hot reload            |
| `npm run build`        | Typecheck, then produce a production build in `dist` |
| `npm run preview`      | Serve the production build locally                   |
| `npm run typecheck`    | Run the TypeScript compiler in build mode            |
| `npm run lint`         | Run ESLint over the project                          |
| `npm run format`       | Format all files with Prettier                       |
| `npm run format:check` | Check formatting without writing changes             |
| `npm test`             | Run the Vitest suite once                            |
| `npm run test:watch`   | Run Vitest in watch mode                             |

## Project structure

```
src/
  api/
    openMeteo.ts        Typed Open-Meteo client (geocoding + forecast) and response mapping
    cache.ts            Small TTL cache; caches in-flight promises to de-duplicate requests
  components/           SearchBar, CurrentWeather, HourlyForecast, DailyForecast, UnitToggle,
                        SunTimes, PlaceList, WeatherIcon, Feedback (skeleton + error state)
  hooks/                useWeather, useCitySearch, useGeolocation, useLocalStorage, useDebounce
  utils/
    weatherCodes.ts     WMO code → label, condition group, day/night wording
    units.ts            °C/°F and km/h/mph conversion, formatting, compass and UV helpers
    format.ts           Date and time formatting for Open-Meteo's local-time strings
    places.ts           Recent/favorite list helpers and localStorage guards
  App.tsx               Layout and wiring
  index.css             Design tokens, weather themes, responsive layout
```

## Design notes

- **Caching.** Geocoding results are cached for 24 hours and forecasts for 10 minutes, both
  in memory. Forecast coordinates are rounded to 0.01° so nearby lookups share an entry.
- **Units.** The API is requested in metric (°C, km/h, hPa). Conversion happens at render time,
  so toggling units never refetches.
- **Times.** Open-Meteo returns local times without an offset, so they are formatted in UTC to
  avoid shifting them into the viewer's time zone.

## Testing

Vitest with React Testing Library (jsdom). The suite covers:

- `weatherCodes.test.ts`: WMO code mapping and night-time wording
- `units.test.ts`: temperature and wind conversion, formatting, compass and UV levels
- `components/SearchBar.test.tsx`: debounced search, mouse and keyboard selection, empty and error states

```bash
npm test
```

## Tooling

- ESLint 9 flat config with typescript-eslint, React Hooks, React Refresh and jsx-a11y rules
- Prettier (see `.prettierrc`)
- TypeScript in strict mode, including `noUncheckedIndexedAccess`

## Data source

Weather data by [Open-Meteo.com](https://open-meteo.com/), available under CC BY 4.0.
