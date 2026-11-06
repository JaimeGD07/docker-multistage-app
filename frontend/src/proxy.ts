import { NextResponse, type NextRequest } from "next/server";
import { SESSION_COOKIE } from "@/lib/auth/constants";
import { isJwtExpired } from "@/lib/auth/jwt";

/**
 * Chequeo OPTIMISTA de sesion (solo mira la cookie, no llama a la API):
 *  - rutas privadas sin sesion valida -> /login?next=...
 *  - cookie con JWT vencido -> se elimina
 * La verificacion real se hace en el servidor con requireSession().
 */
const PROTECTED = ["/cuenta", "/pedidos", "/checkout"];

export function proxy(request: NextRequest) {
  const { pathname, search } = request.nextUrl;
  const token = request.cookies.get(SESSION_COOKIE)?.value;
  const expired = token ? isJwtExpired(token) : false;
  const hasSession = Boolean(token) && !expired;

  const isProtected = PROTECTED.some(
    (p) => pathname === p || pathname.startsWith(`${p}/`),
  );

  if (isProtected && !hasSession) {
    const url = new URL("/login", request.url);
    url.searchParams.set("next", `${pathname}${search}`);
    if (expired) url.searchParams.set("expirada", "1");
    const response = NextResponse.redirect(url);
    if (expired) response.cookies.delete(SESSION_COOKIE);
    return response;
  }

  const response = NextResponse.next();
  if (expired) response.cookies.delete(SESSION_COOKIE);
  return response;
}

export const config = {
  // Solo paginas: se omiten archivos estaticos y de imagen
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)",
  ],
};
