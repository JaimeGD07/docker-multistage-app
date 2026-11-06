import "server-only";
import { ApiError } from "./errors";
import type { ValidationErrors } from "./types";

/**
 * Cliente HTTP unico hacia la API Laravel. Solo se ejecuta en el servidor
 * (`server-only` rompe el build si alguien lo importa desde un Client Component),
 * asi el token JWT y la URL interna nunca llegan al navegador.
 */

function getBaseUrl(): string {
  const url = process.env.API_BASE_URL;
  if (!url) {
    throw new Error(
      "Falta la variable de entorno API_BASE_URL. Copia .env.example a .env.local.",
    );
  }
  return url.replace(/\/+$/, "");
}

type RequestOptions = {
  method?: "GET" | "POST" | "PUT" | "DELETE";
  body?: unknown;
  /** JWT del usuario. Si se omite, la peticion es publica. */
  token?: string;
  /** Opciones extra de fetch/Next (ej. { next: { tags: [...] } }) */
  next?: NextFetchRequestConfig;
  signal?: AbortSignal;
};

type ErrorBody = {
  message?: string;
  /** Detalle tecnico que algunas respuestas de la API agregan (p. ej. el motivo de Stripe en 502) */
  error?: string;
  errors?: ValidationErrors;
};

export async function apiFetch<T>(
  path: string,
  { method = "GET", body, token, next, signal }: RequestOptions = {},
): Promise<T> {
  const headers: Record<string, string> = {
    // Sin esto Laravel responde con redirects HTML en vez de JSON en errores 401/422
    Accept: "application/json",
  };
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (token) headers.Authorization = `Bearer ${token}`;

  let res: Response;
  try {
    res = await fetch(`${getBaseUrl()}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
      next,
      signal,
    });
  } catch {
    throw new ApiError(
      "No se pudo conectar con el servidor. Intenta de nuevo en unos minutos.",
      0,
    );
  }

  const text = await res.text();
  let data: unknown = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = null;
    }
  }

  if (!res.ok) {
    const err = (data ?? {}) as ErrorBody;
    const base = err.message || res.statusText || "Error inesperado de la API";
    throw new ApiError(
      typeof err.error === "string" && err.error ? `${base}: ${err.error}` : base,
      res.status,
      err.errors,
    );
  }

  return data as T;
}
