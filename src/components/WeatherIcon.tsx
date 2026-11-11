import type { ReactNode } from 'react';
import type { Condition } from '../utils/weatherCodes';

interface Props {
  condition: Condition;
  isDay: boolean;
  size?: number;
  /** When set, the icon is announced; otherwise it is decorative. */
  label?: string;
  className?: string;
}

const SUN = (
  <g className="wi-sun">
    <circle cx="24" cy="24" r="8" />
    <g strokeWidth="3" strokeLinecap="round" fill="none" className="wi-rays">
      <path d="M24 6v4M24 38v4M6 24h4M38 24h4M11.3 11.3l2.8 2.8M33.9 33.9l2.8 2.8M11.3 36.7l2.8-2.8M33.9 14.1l2.8-2.8" />
    </g>
  </g>
);

const MOON = <path className="wi-moon" d="M30 8a14 14 0 1 0 10 22A12 12 0 0 1 30 8z" />;

const CLOUD = (
  <path className="wi-cloud" d="M15 40a9 9 0 0 1-1-18 12 12 0 0 1 23 3 7.5 7.5 0 0 1 0 15z" />
);

const SMALL_SUN = <g transform="translate(-6 -6) scale(0.8)">{SUN}</g>;
const SMALL_MOON = <g transform="translate(-4 -6) scale(0.8)">{MOON}</g>;

function drops(className: string, short = false) {
  const len = short ? 3 : 5;
  return (
    <g className={className} strokeWidth="2.5" strokeLinecap="round" fill="none">
      <path d={`M18 43l-1.5 ${len}M25 43l-1.5 ${len}M32 43l-1.5 ${len}`} />
    </g>
  );
}

export function WeatherIcon({ condition, isDay, size = 48, label, className }: Props) {
  let body: ReactNode;
  switch (condition) {
    case 'clear':
      body = isDay ? SUN : MOON;
      break;
    case 'partly-cloudy':
      body = (
        <>
          {isDay ? SMALL_SUN : SMALL_MOON}
          {CLOUD}
        </>
      );
      break;
    case 'cloudy':
      body = CLOUD;
      break;
    case 'fog':
      body = (
        <g className="wi-fog" strokeWidth="3" strokeLinecap="round" fill="none">
          <path d="M10 18h28M6 25h36M10 32h28M14 39h20" />
        </g>
      );
      break;
    case 'drizzle':
      body = (
        <g transform="translate(0 -4)">
          {CLOUD}
          {drops('wi-rain', true)}
        </g>
      );
      break;
    case 'rain':
      body = (
        <g transform="translate(0 -4)">
          {CLOUD}
          {drops('wi-rain')}
        </g>
      );
      break;
    case 'snow':
      body = (
        <g transform="translate(0 -4)">
          {CLOUD}
          <g className="wi-snow">
            <circle cx="18" cy="46" r="1.8" />
            <circle cx="25" cy="49" r="1.8" />
            <circle cx="32" cy="46" r="1.8" />
          </g>
        </g>
      );
      break;
    case 'thunder':
      body = (
        <g transform="translate(0 -4)">
          {CLOUD}
          <path className="wi-bolt" d="M26 36l-6 9h5l-3 7 9-11h-5l3-5z" />
        </g>
      );
      break;
  }

  return (
    <svg
      className={['weather-icon', className].filter(Boolean).join(' ')}
      viewBox="0 0 48 48"
      width={size}
      height={size}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
    >
      {body}
    </svg>
  );
}
