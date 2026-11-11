import { useId, useState, type KeyboardEvent } from 'react';
import { MIN_QUERY_LENGTH } from '../api/openMeteo';
import { useCitySearch, type SearchFn } from '../hooks/useCitySearch';
import type { Place } from '../types';
import { placeSubtitle } from '../utils/format';

interface Props {
  onSelect: (place: Place) => void;
  /** Injected for tests; defaults to the Open-Meteo geocoding API. */
  searchFn?: SearchFn;
  debounceMs?: number;
}

/** City search with debounced autocomplete, following the ARIA combobox pattern. */
export function SearchBar({ onSelect, searchFn, debounceMs = 300 }: Props) {
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState(false);
  const [rawActive, setActive] = useState(-1);
  const { status, results, error } = useCitySearch(query, searchFn, debounceMs);
  const inputId = useId();
  const listId = useId();

  const active = rawActive < results.length ? rawActive : -1;
  const showPopup = open && query.trim().length >= MIN_QUERY_LENGTH;
  const showOptions = showPopup && results.length > 0;

  function choose(place: Place) {
    onSelect(place);
    setQuery('');
    setOpen(false);
    setActive(-1);
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setOpen(true);
        if (results.length) setActive((active + 1) % results.length);
        break;
      case 'ArrowUp':
        e.preventDefault();
        setOpen(true);
        if (results.length) setActive(active <= 0 ? results.length - 1 : active - 1);
        break;
      case 'Enter': {
        e.preventDefault();
        const place = results[active] ?? results[0];
        if (place) choose(place);
        break;
      }
      case 'Escape':
        if (showPopup) {
          e.preventDefault();
          setOpen(false);
          setActive(-1);
        } else if (query) {
          e.preventDefault();
          setQuery('');
        }
        break;
    }
  }

  const optionId = (i: number) => `${listId}-option-${i}`;

  return (
    <form className="search" role="search" onSubmit={(e) => e.preventDefault()}>
      <label htmlFor={inputId} className="visually-hidden">
        Search for a city
      </label>
      <div className="search__field">
        <svg className="search__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
          <circle cx="11" cy="11" r="7" fill="none" stroke="currentColor" strokeWidth="2" />
          <path d="M20 20l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input
          id={inputId}
          className="search__input"
          type="text"
          role="combobox"
          aria-expanded={showOptions}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={showOptions && active >= 0 ? optionId(active) : undefined}
          autoComplete="off"
          spellCheck={false}
          placeholder="Search for a city…"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setOpen(true);
            setActive(-1);
          }}
          onKeyDown={onKeyDown}
          onFocus={() => setOpen(true)}
          onBlur={() => setOpen(false)}
        />
      </div>

      <div className="search__popup" hidden={!showPopup}>
        <ul id={listId} role="listbox" aria-label="City suggestions" hidden={!showOptions}>
          {results.map((place, i) => (
            <li
              key={place.id}
              id={optionId(i)}
              role="option"
              tabIndex={-1}
              aria-selected={i === active}
              className="search__option"
              // mousedown (not click) so the input doesn't blur and close the list first
              onMouseDown={(e) => {
                e.preventDefault();
                choose(place);
              }}
              onMouseEnter={() => setActive(i)}
            >
              <span className="search__option-name">{place.name}</span>
              <span className="search__option-sub">{placeSubtitle(place)}</span>
            </li>
          ))}
        </ul>
        <div className="search__status" role="status" aria-live="polite">
          {showPopup && status === 'loading' && 'Searching…'}
          {showPopup &&
            status === 'success' &&
            results.length === 0 &&
            `No cities found for “${query.trim()}”. Check the spelling or try a nearby city.`}
          {showPopup &&
            status === 'success' &&
            results.length > 0 &&
            `${results.length} result${results.length === 1 ? '' : 's'}. Use the up and down arrows to browse.`}
        </div>
        {showPopup && status === 'error' && (
          <p className="search__error" role="alert">
            {error}
          </p>
        )}
      </div>
    </form>
  );
}
