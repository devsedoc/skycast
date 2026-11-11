import type { DailyPoint, Unit } from '../types';
import { formatClock, formatDuration, minutesBetween } from '../utils/format';

interface Props {
  today: DailyPoint;
  unit: Unit;
}

export function SunTimes({ today, unit }: Props) {
  const hour12 = unit === 'f' ? true : undefined;
  const daylight = formatDuration(minutesBetween(today.sunrise, today.sunset));
  return (
    <section className="card" aria-labelledby="sun-heading">
      <h2 id="sun-heading" className="card__title">
        Sun
      </h2>
      <dl className="sun">
        <div className="sun__item">
          <dt>Sunrise</dt>
          <dd>{formatClock(today.sunrise, hour12)}</dd>
        </div>
        <div className="sun__item">
          <dt>Sunset</dt>
          <dd>{formatClock(today.sunset, hour12)}</dd>
        </div>
        <div className="sun__item">
          <dt>Daylight</dt>
          <dd>{daylight}</dd>
        </div>
      </dl>
    </section>
  );
}
