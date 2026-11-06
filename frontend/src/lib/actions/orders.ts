"use server";

import { revalidatePath, updateTag } from "next/cache";
import { redirect } from "next/navigation";
import { apiCreateOrder } from "@/lib/api/orders";
import { ApiError } from "@/lib/api/errors";
import type { Order } from "@/lib/api/types";
import { getToken } from "@/lib/auth/session";

export type OrderState =
  | { error?: string; orderId?: number }
  | undefined;

type RawLine = { productId?: unknown; quantity?: unknown };

/**
 * Crea la orden en la API. Los datos del navegador no son de fiar: se validan y se
 * fusionan duplicados; el precio y el total los calcula la API (aqui NO se envian).
 */
export async function createOrderAction(
  _prev: OrderState,
  formData: FormData,
): Promise<OrderState> {
  const token = await getToken();
  if (!token) redirect("/login?next=%2Fcheckout");

  let lines: RawLine[] = [];
  try {
    const parsed: unknown = JSON.parse(String(formData.get("items") ?? "[]"));
    if (Array.isArray(parsed)) lines = parsed as RawLine[];
  } catch {
    return { error: "No pudimos leer tu carrito. Vuelve al carrito e inténtalo de nuevo." };
  }

  const merged = new Map<number, number>();
  for (const l of lines) {
    const id = Number(l.productId);
    const qty = Number(l.quantity);
    if (!Number.isInteger(id) || id < 1 || !Number.isInteger(qty) || qty < 1 || qty > 99) {
      return { error: "Hay un producto con datos no válidos. Revisa tu carrito." };
    }
    merged.set(id, Math.min((merged.get(id) ?? 0) + qty, 99));
  }
  if (merged.size === 0) return { error: "Tu carrito está vacío." };

  const items = [...merged].map(([product_id, quantity]) => ({ product_id, quantity }));

  let order: Order | null = null;
  let unauthorized = false;
  try {
    order = await apiCreateOrder(token, { items });
  } catch (e) {
    if (e instanceof ApiError) {
      if (e.isUnauthorized) unauthorized = true;
      else return { error: e.message };
    } else {
      return { error: "Ocurrió un error inesperado. Intenta de nuevo." };
    }
  }

  // redirect lanza una excepcion: va fuera del try/catch
  if (unauthorized || !order) redirect("/login?next=%2Fcheckout&expirada=1");

  // La orden descuenta stock: el catalogo cacheado ya no es valido (lectura de lo escrito)
  updateTag("products");
  // El historial de pedidos del usuario cambio
  revalidatePath("/pedidos");

  return { orderId: order.id };
}
