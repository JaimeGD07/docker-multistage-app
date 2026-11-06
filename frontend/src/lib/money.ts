/** Laravel devuelve los decimales como string ("1299.99"). */
export function toNumber(value: string | number): number {
  const n = typeof value === "number" ? value : Number.parseFloat(value);
  return Number.isFinite(n) ? n : 0;
}

/** Centavos enteros: evita errores de coma flotante al sumar (0.1 + 0.2). */
export function toCents(value: string | number): number {
  return Math.round(toNumber(value) * 100);
}

const usd = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
});

export function formatPrice(value: string | number): string {
  return usd.format(toNumber(value));
}

export function formatCents(cents: number): string {
  return usd.format(cents / 100);
}
