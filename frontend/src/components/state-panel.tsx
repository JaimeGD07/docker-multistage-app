import type { ReactNode } from "react";

type Props = {
  title: string;
  children: ReactNode;
  /** Botones o enlaces de accion */
  actions?: ReactNode;
};

/** Panel para estados vacios, de error y "no encontrado". Dice que paso y que hacer. */
export function StatePanel({ title, children, actions }: Props) {
  return (
    <div
      role="status"
      className="mx-auto max-w-lg rounded-md border border-line bg-panel p-8 text-center"
    >
      <h2 className="font-display text-2xl font-bold">{title}</h2>
      <p className="mt-2 text-muted">{children}</p>
      {actions ? (
        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
          {actions}
        </div>
      ) : null}
    </div>
  );
}

export const buttonPrimary =
  "inline-flex items-center justify-center rounded bg-amber px-4 py-2 text-sm font-semibold text-amber-ink transition-colors hover:bg-amber/90";

export const buttonSecondary =
  "inline-flex items-center justify-center rounded border border-line-strong px-4 py-2 text-sm font-medium text-text transition-colors hover:border-amber/60";
