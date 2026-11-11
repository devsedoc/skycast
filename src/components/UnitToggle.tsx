import type { Unit } from '../types';

interface Props {
  unit: Unit;
  onChange: (unit: Unit) => void;
}

const OPTIONS: { value: Unit; label: string; name: string }[] = [
  { value: 'c', label: '°C', name: 'Celsius' },
  { value: 'f', label: '°F', name: 'Fahrenheit' },
];

export function UnitToggle({ unit, onChange }: Props) {
  return (
    <div className="unit-toggle" role="group" aria-label="Temperature unit">
      {OPTIONS.map((o) => (
        <button
          key={o.value}
          type="button"
          className="unit-toggle__btn"
          aria-pressed={unit === o.value}
          aria-label={o.name}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
