"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { ApiError } from "@/lib/api/errors";
import { apiConfirmOrder, apiPayOrder } from "@/lib/api/orders";
import type { OrderStatus } from "@/lib/api/types";
import { getToken } from "@/lib/auth/session";

function parseOrderId(value: unknown): number | null {
  const id = Number(value);
  return Number.isInteger(id) && id > 0 ? id : null;
}

function loginUrl(orderId: number) {
  return `/login?next=${encodeURIComponent(`/pedidos/${orderId}/pago`)}&expirada=1`;
}

export type StartPaymentResult = { clientSecret?: string; error?: string };

/**
 * Pide a la API que cree el PaymentIntent de Stripe (POST /orders/{id}/pay).
 * La clave secreta de Stripe NUNCA llega al frontend: solo el `client_secret` del intento,
 * que esta pensado para usarse en el navegador.
 *
 * IMPORTANTE: cada llamada crea un intento nuevo en la API, asi que el cliente la invoca
 * una sola vez por pedido y reutiliza el secreto (ver payment-client.tsx).
 */
export async function startPaymentAction(
  orderIdInput: number,
): Promise<StartPaymentResult> {
  const orderId = parseOrderId(orderIdInput);
  if (!orderId) return { error: "Pedido no válido." };

  const token = await getToken();
  if (!token) redirect(loginUrl(orderId));

  let unauthorized = false;
  try {
    const res = await apiPayOrder(token, orderId);
    return { clientSecret: res.client_secret };
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.isUnauthorized) unauthorized = true;
      else if (e.status === 403 || e.status === 404)
        return { error: "No encontramos este pedido en tu cuenta." };
      else return { error: e.message };
    } else {
      return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
    }
  }

  if (unauthorized) redirect(loginUrl(orderId));
  return { error: "No se pudo iniciar el pago." };
}

export type ConfirmPaymentResult = { status?: OrderStatus; error?: string };

/**
 * Pide a la API que consulte a Stripe y marque la orden como pagada (POST /orders/{id}/confirm).
 *
 * CUIDADO: si el intento aun no esta `succeeded`, la API marca la orden como `failed` y ya no
 * admite nuevos pagos. Por eso el cliente solo llama a esta accion DESPUES de que Stripe.js
 * confirme el pago, nunca antes.
 */
export async function confirmPaymentAction(
  orderIdInput: number,
): Promise<ConfirmPaymentResult> {
  const orderId = parseOrderId(orderIdInput);
  if (!orderId) return { error: "Pedido no válido." };

  const token = await getToken();
  if (!token) redirect(loginUrl(orderId));

  let status: OrderStatus | null = null;
  let unauthorized = false;
  try {
    const res = await apiConfirmOrder(token, orderId);
    status = res.order.status;
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.isUnauthorized) unauthorized = true;
      else return { error: e.message };
    } else {
      return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
    }
  }

  if (unauthorized) redirect(loginUrl(orderId));

  // El estado del pedido cambio: refresca el detalle y el historial
  revalidatePath(`/pedidos/${orderId}`);
  revalidatePath("/pedidos");

  return { status: status ?? undefined };
}
