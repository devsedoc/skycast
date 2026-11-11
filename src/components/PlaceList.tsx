import type { Place } from '../types';

interface Props {
  title: string;
  places: Place[];
  currentId?: string;
  onSelect: (place: Place) => void;
  onRemove?: (place: Place) => void;
  onClear?: () => void;
}

/** A row of chips for favorites or recent searches. */
export function PlaceList({ title, places, currentId, onSelect, onRemove, onClear }: Props) {
  if (places.length === 0) return null;
  const headingId = `places-${title.toLowerCase().replace(/\s+/g, '-')}`;
  return (
    <nav className="places" aria-labelledby={headingId}>
      <div className="places__head">
        <h2 id={headingId} className="places__title">
          {title}
        </h2>
        {onClear && (
          <button type="button" className="link-btn" onClick={onClear}>
            Clear<span className="visually-hidden"> {title.toLowerCase()}</span>
          </button>
        )}
      </div>
      <ul className="places__list">
        {places.map((p) => (
          <li key={p.id} className="chip">
            <button
              type="button"
              className="chip__main"
              aria-current={p.id === currentId ? 'true' : undefined}
              onClick={() => onSelect(p)}
            >
              {p.name}
              {p.country && <span className="chip__sub">{p.country}</span>}
            </button>
            {onRemove && (
              <button
                type="button"
                className="chip__remove"
                aria-label={`Remove ${p.name} from ${title.toLowerCase()}`}
                onClick={() => onRemove(p)}
              >
                <svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path
                    d="M6 6l12 12M18 6L6 18"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            )}
          </li>
        ))}
      </ul>
    </nav>
  );
}
