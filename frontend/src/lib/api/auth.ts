import "server-only";
import { apiFetch } from "./client";
import type { AuthResponse, LoginInput, RegisterInput, User } from "./types";

export function apiLogin(input: LoginInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/login", { method: "POST", body: input });
}

export function apiRegister(input: RegisterInput): Promise<AuthResponse> {
  return apiFetch<AuthResponse>("/auth/register", {
    method: "POST",
    body: input,
  });
}

export function apiMe(token: string): Promise<User> {
  return apiFetch<User>("/auth/me", { token });
}

export function apiLogout(token: string): Promise<{ message: string }> {
  return apiFetch<{ message: string }>("/auth/logout", {
    method: "POST",
    token,
  });
}
