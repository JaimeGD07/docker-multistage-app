/**
 * Lectura OPTIMISTA del JWT (sin verificar la firma: eso solo lo puede hacer la API).
 * Sirve unicamente para saber si el token ya vencio y evitar viajes inutiles a la API.
 * La autorizacion real siempre la decide la API (ver lib/auth/session.ts).
 */
export function getJwtExp(token: string): number | null {
  try {
    const payload = token.split(".")[1];
    if (!payload) return null;
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    const exp = (JSON.parse(json) as { exp?: unknown }).exp;
    return typeof exp === "number" ? exp : null;
  } catch {
    return null;
  }
}

export function isJwtExpired(token: string): boolean {
  const exp = getJwtExp(token);
  return exp !== null && exp * 1000 <= Date.now();
}
