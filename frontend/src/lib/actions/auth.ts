"use server";

import { redirect } from "next/navigation";
import { apiLogin, apiLogout, apiRegister } from "@/lib/api/auth";
import { ApiError } from "@/lib/api/errors";
import type { AuthResponse, ValidationErrors } from "@/lib/api/types";
import { safeNext } from "@/lib/auth/redirect";
import { clearSession, getToken, setSession } from "@/lib/auth/session";

/** Estado que devuelven las acciones de formulario a useActionState */
export type FormState =
  | {
      error?: string;
      fieldErrors?: ValidationErrors;
      /** Valores a conservar al re-renderizar (nunca la contrasena) */
      values?: Record<string, string>;
    }
  | undefined;

function text(formData: FormData, key: string): string {
  const v = formData.get(key);
  return typeof v === "string" ? v : "";
}

function toErrorState(e: unknown, values: Record<string, string>): FormState {
  if (e instanceof ApiError) {
    if (e.isValidation && e.fieldErrors) return { fieldErrors: e.fieldErrors, values };
    return { error: e.message, values };
  }
  return { error: "Ocurrió un error inesperado. Intenta de nuevo.", values };
}

export async function loginAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const next = safeNext(text(formData, "next"));
  const values = { email };

  const fieldErrors: ValidationErrors = {};
  if (!email) fieldErrors.email = ["Ingresa tu correo."];
  if (!password) fieldErrors.password = ["Ingresa tu contraseña."];
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  let auth: AuthResponse;
  try {
    auth = await apiLogin({ email, password });
  } catch (e) {
    return toErrorState(e, values);
  }

  await setSession(auth.access_token, auth.expires_in);
  redirect(next); // redirect lanza una excepcion: debe ir fuera del try/catch
}

export async function registerAction(
  _prev: FormState,
  formData: FormData,
): Promise<FormState> {
  const name = text(formData, "name").trim();
  const email = text(formData, "email").trim();
  const password = text(formData, "password");
  const password_confirmation = text(formData, "password_confirmation");
  const next = safeNext(text(formData, "next"));
  const values = { name, email };

  const fieldErrors: ValidationErrors = {};
  if (!name) fieldErrors.name = ["Ingresa tu nombre."];
  if (!email) fieldErrors.email = ["Ingresa tu correo."];
  if (password.length < 8)
    fieldErrors.password = ["La contraseña debe tener al menos 8 caracteres."];
  else if (password !== password_confirmation)
    fieldErrors.password_confirmation = ["Las contraseñas no coinciden."];
  if (Object.keys(fieldErrors).length) return { fieldErrors, values };

  let auth: AuthResponse;
  try {
    auth = await apiRegister({ name, email, password, password_confirmation });
  } catch (e) {
    return toErrorState(e, values);
  }

  await setSession(auth.access_token, auth.expires_in);
  redirect(next);
}

export async function logoutAction() {
  const token = await getToken();
  if (token) {
    try {
      await apiLogout(token); // invalida el JWT en la API
    } catch {
      // Aunque la API falle (token ya vencido, caida), cerramos la sesion local igual
    }
  }
  await clearSession();
  redirect("/");
}
