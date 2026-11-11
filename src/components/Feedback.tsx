import type { ReactNode } from 'react';

/** Placeholder layout shown while the forecast loads. */
export function WeatherSkeleton() {
  return (
    <div className="grid" aria-busy="true">
      <p className="visually-hidden" role="status">
        Loading weather…
      </p>
      <div className="card skeleton-card" aria-hidden="true">
        <div className="skeleton" style={{ width: '45%', height: 28 }} />
        <div className="skeleton" style={{ width: '30%', height: 16 }} />
        <div className="skeleton-row">
          <div className="skeleton skeleton--circle" />
          <div className="skeleton" style={{ width: 120, height: 64 }} />
        </div>
        <div className="skeleton-grid">
          {Array.from({ length: 5 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: 52 }} />
          ))}
        </div>
      </div>
      <div className="card skeleton-card" aria-hidden="true">
        <div className="skeleton" style={{ width: '35%', height: 20 }} />
        <div className="skeleton-row">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="skeleton" style={{ width: 64, height: 110 }} />
          ))}
        </div>
      </div>
      <div className="card skeleton-card" aria-hidden="true">
        <div className="skeleton" style={{ width: '35%', height: 20 }} />
        {Array.from({ length: 7 }, (_, i) => (
          <div key={i} className="skeleton" style={{ height: 32 }} />
        ))}
      </div>
    </div>
  );
}

interface ErrorProps {
  title: string;
  children: ReactNode;
  action?: { label: string; onClick: () => void };
  onDismiss?: () => void;
}

export function ErrorState({ title, children, action, onDismiss }: ErrorProps) {
  return (
    <div className="card error-state" role="alert">
      <svg className="error-state__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
        <circle cx="12" cy="12" r="10" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M12 7v6M12 16.5v.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      </svg>
      <div className="error-state__body">
        <h2 className="error-state__title">{title}</h2>
        <p>{children}</p>
        {(action || onDismiss) && (
          <div className="error-state__actions">
            {action && (
              <button type="button" className="btn" onClick={action.onClick}>
                {action.label}
              </button>
            )}
            {onDismiss && (
              <button type="button" className="btn btn--ghost" onClick={onDismiss}>
                Dismiss
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
