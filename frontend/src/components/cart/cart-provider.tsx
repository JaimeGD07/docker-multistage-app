"use client";

import {
  createContext,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import {
  addItem,
  clearCart,
  getServerSnapshot,
  getSnapshot,
  removeItem,
  setQuantity,
  subscribe,
  type CartItem,
} from "@/lib/cart/cart-store";
import { toNumber } from "@/lib/money";

type CartContextValue = {
  items: CartItem[];
  /** unidades totales (suma de cantidades) */
  count: number;
  /** subtotal en centavos para evitar errores de coma flotante */
  subtotalCents: number;
  /** false en el servidor y durante la hidratacion: evita mostrar "carrito vacio" por error */
  ready: boolean;
  add: typeof addItem;
  setQuantity: typeof setQuantity;
  remove: typeof removeItem;
  clear: typeof clearCart;
};

const CartContext = createContext<CartContextValue | null>(null);

const subscribeNoop = () => () => {};

export function CartProvider({ children }: { children: ReactNode }) {
  const items = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const ready = useSyncExternalStore(
    subscribeNoop,
    () => true,
    () => false,
  );

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      count: items.reduce((n, i) => n + i.quantity, 0),
      subtotalCents: items.reduce(
        (sum, i) => sum + Math.round(toNumber(i.price) * 100) * i.quantity,
        0,
      ),
      ready,
      add: addItem,
      setQuantity,
      remove: removeItem,
      clear: clearCart,
    }),
    [items, ready],
  );

  return <CartContext value={value}>{children}</CartContext>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart debe usarse dentro de <CartProvider>");
  return ctx;
}
