import "server-only";
import { apiFetch } from "./client";
import type {
  ConfirmResponse,
  CreateOrderInput,
  Order,
  PayResponse,
} from "./types";

/** Todas requieren el JWT del usuario (se lee de la cookie httpOnly en la Fase 3). */

export function apiCreateOrder(
  token: string,
  input: CreateOrderInput,
): Promise<Order> {
  return apiFetch<Order>("/orders", { method: "POST", body: input, token });
}

export function apiListOrders(token: string): Promise<Order[]> {
  return apiFetch<Order[]>("/orders", { token });
}

export function apiGetOrder(token: string, id: number | string): Promise<Order> {
  return apiFetch<Order>(`/orders/${id}`, { token });
}

export function apiPayOrder(
  token: string,
  id: number | string,
): Promise<PayResponse> {
  return apiFetch<PayResponse>(`/orders/${id}/pay`, { method: "POST", token });
}

export function apiConfirmOrder(
  token: string,
  id: number | string,
): Promise<ConfirmResponse> {
  return apiFetch<ConfirmResponse>(`/orders/${id}/confirm`, {
    method: "POST",
    token,
  });
}
