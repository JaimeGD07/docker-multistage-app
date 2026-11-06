"use client";

type Props = {
  name: string;
  value: number;
  max: number;
  onChange: (next: number) => void;
};

export function QuantityStepper({ name, value, max, onChange }: Props) {
  const btn =
    "flex size-9 items-center justify-center text-lg text-text transition-colors hover:bg-panel-2 disabled:cursor-not-allowed disabled:text-line-strong disabled:hover:bg-transparent";
  return (
    <div
      role="group"
      aria-label={`Cantidad de ${name}`}
      className="inline-flex items-center overflow-hidden rounded border border-line-strong"
    >
      <button
        type="button"
        aria-label={`Quitar una unidad de ${name}`}
        disabled={value <= 1}
        onClick={() => onChange(value - 1)}
        className={btn}
      >
        −
      </button>
      <span className="min-w-10 text-center font-mono text-sm" aria-live="polite">
        {value}
      </span>
      <button
        type="button"
        aria-label={`Agregar una unidad de ${name}`}
        disabled={value >= max}
        onClick={() => onChange(value + 1)}
        className={btn}
      >
        +
      </button>
    </div>
  );
}
