/**
 * Solo se permiten rutas internas en `?next=` para evitar "open redirects"
 * (ej. //sitio-malicioso.com o https://...).
 */
export function safeNext(value: unknown, fallback = "/"): string {
  if (typeof value !== "string") return fallback;
  if (!value.startsWith("/") || value.startsWith("//") || value.startsWith("/\\")) {
    return fallback;
  }
  return value;
}
