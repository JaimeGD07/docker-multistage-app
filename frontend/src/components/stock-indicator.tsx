type Props = { stock: number };

/** LED de disponibilidad: el color nunca es el unico indicador, siempre va con texto. */
export function StockIndicator({ stock }: Props) {
  const state =
    stock <= 0
      ? { label: "Agotado", dot: "bg-out", text: "text-out" }
      : stock <= 5
        ? { label: `Quedan ${stock}`, dot: "bg-amber", text: "text-amber" }
        : { label: "Disponible", dot: "bg-ok", text: "text-ok" };

  return (
    <span className={`inline-flex items-center gap-2 text-sm ${state.text}`}>
      <span
        aria-hidden="true"
        className={`size-2 rounded-full ${state.dot}`}
      />
      {state.label}
    </span>
  );
}
