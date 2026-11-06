import "server-only";
import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { apiMe } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import type { User } from "@/lib/api/types";
import { SESSION_COOKIE } from "./constants";

/**
 * Capa de acceso a la sesion (Data Access Layer).
 * El JWT vive SOLO en una cookie httpOnly: JavaScript del navegador nunca lo ve,
 * y solo el servidor de Next lo adjunta como `Authorization: Bearer` hacia la API.
 */

export async function setSession(token: string, maxAgeSeconds: number) {
  (await cookies()).set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: maxAgeSeconds,
  });
}

export async function clearSession() {
  (await cookies()).delete(SESSION_COOKIE);
}

export async function getToken(): Promise<string | null> {
  return (await cookies()).get(SESSION_COOKIE)?.value ?? null;
}

/**
 * Usuario de la sesion actual o `null`. Pregunta a la API (GET /auth/me), asi que un
 * token revocado o vencido tambien devuelve null. `cache()` evita repetir la llamada
 * dentro de una misma peticion (header + pagina). Lee cookies: usar detras de <Suspense>.
 */
export const getCurrentUser = cache(async (): Promise<User | null> => {
  const token = await getToken();
  if (!token) return null;
  try {
    return await apiMe(token);
  } catch (e) {
    if (e instanceof ApiError && e.isUnauthorized) return null;
    throw e;
  }
});

/** Para paginas y acciones protegidas: devuelve usuario + token o redirige al login. */
export async function requireSession(
  returnTo: string,
): Promise<{ user: User; token: string }> {
  const token = await getToken();
  const user = token ? await getCurrentUser() : null;
  if (!token || !user) {
    redirect(`/login?next=${encodeURIComponent(returnTo)}`);
  }
  return { user, token };
}
