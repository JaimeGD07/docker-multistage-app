type Props = {
  label: string;
  name: string;
  type?: "text" | "email" | "password";
  autoComplete?: string;
  defaultValue?: string;
  errors?: string[];
  minLength?: number;
  hint?: string;
};

/** Campo con etiqueta visible y mensaje de error enlazado (aria-describedby). */
export function Field({
  label,
  name,
  type = "text",
  autoComplete,
  defaultValue,
  errors,
  minLength,
  hint,
}: Props) {
  const id = `campo-${name}`;
  const hasError = Boolean(errors?.length);
  const describedBy =
    [hasError ? `${id}-error` : null, hint ? `${id}-hint` : null]
      .filter(Boolean)
      .join(" ") || undefined;

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium">
        {label}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        autoComplete={autoComplete}
        defaultValue={defaultValue}
        minLength={minLength}
        required
        aria-invalid={hasError || undefined}
        aria-describedby={describedBy}
        className="w-full rounded border border-line-strong bg-panel-2 px-3 py-2.5 text-text transition-colors placeholder:text-muted/70 focus:border-amber aria-[invalid=true]:border-out"
      />
      {hint && !hasError ? (
        <p id={`${id}-hint`} className="mt-1.5 text-sm text-muted">
          {hint}
        </p>
      ) : null}
      {hasError ? (
        <p id={`${id}-error`} className="mt-1.5 text-sm text-out">
          {errors!.join(" ")}
        </p>
      ) : null}
    </div>
  );
}
