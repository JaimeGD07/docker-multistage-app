"use client";

import Link from "next/link";
import { ProductImage } from "@/components/product-image";
import { StatePanel, buttonPrimary } from "@/components/state-panel";
import { formatPrice, toNumber } from "@/lib/money";
import { MAX_PER_LINE } from "@/lib/cart/cart-store";
import { useCart } from "./cart-provider";
import { QuantityStepper } from "./quantity-stepper";

export function CartView() {
  const { items, ready, setQuantity, remove, subtotalCents, count } = useCart();

  // El carrito vive en el navegador: hasta hidratar no sabemos si esta vacio
  if (!ready) {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando carrito"
        className="grid gap-8 lg:grid-cols-[1fr_20rem]"
      >
        <div className="h-48 animate-pulse rounded-md border border-line bg-panel-2" />
        <div className="h-48 animate-pulse rounded-md border border-line bg-panel-2" />
      </div>
    );
  }

  if (items.length === 0) {
    return (
      <StatePanel
        title="Tu carrito está vacío"
        actions={
          <Link href="/" className={buttonPrimary}>
            Ver el catálogo
          </Link>
        }
      >
        Agrega productos desde el catálogo para armar tu pedido.
      </StatePanel>
    );
  }

  return (
    <div className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <ul className="divide-y divide-line rounded-md border border-line bg-panel">
        {items.map((item) => {
          const lineCents = Math.round(toNumber(item.price) * 100) * item.quantity;
          return (
            <li
              key={item.productId}
              className="flex items-start gap-4 p-4 sm:items-center"
            >
              <div className="w-24 shrink-0 sm:w-28">
                <ProductImage
                  src={item.imageUrl}
                  alt={item.name}
                  sizes="112px"
                  className="rounded border border-line"
                />
              </div>
              <div className="min-w-0 flex-1">
                <Link
                  href={`/productos/${item.productId}`}
                  className="font-display text-lg font-semibold leading-snug transition-colors hover:text-amber"
                >
                  {item.name}
                </Link>
                <p className="mt-1 text-sm text-muted">
                  {formatPrice(item.price)} c/u
                </p>
                <div className="mt-3 flex flex-wrap items-center gap-4">
                  <QuantityStepper
                    name={item.name}
                    value={item.quantity}
                    max={Math.min(item.stock, MAX_PER_LINE)}
                    onChange={(q) => setQuantity(item.productId, q)}
                  />
                  <button
                    type="button"
                    onClick={() => remove(item.productId)}
                    className="text-sm text-muted underline-offset-4 transition-colors hover:text-out hover:underline"
                  >
                    Quitar
                    <span className="sr-only"> {item.name} del carrito</span>
                  </button>
                </div>
                <p className="mt-3 font-display text-xl font-bold text-amber sm:hidden">
                  {formatPrice(lineCents / 100)}
                </p>
              </div>
              <p className="hidden font-display text-xl font-bold text-amber sm:block">
                {formatPrice(lineCents / 100)}
              </p>
            </li>
          );
        })}
      </ul>

      <aside
        aria-label="Resumen del pedido"
        className="rounded-md border border-line bg-panel p-5 lg:sticky lg:top-6"
      >
        <h2 className="font-display text-xl font-bold">Resumen</h2>
        <dl className="mt-4 space-y-2 text-sm">
          <div className="flex justify-between">
            <dt className="text-muted">Unidades</dt>
            <dd className="font-mono">{count}</dd>
          </div>
          <div className="flex items-baseline justify-between border-t border-line pt-3">
            <dt>Total</dt>
            <dd className="font-display text-2xl font-bold text-amber">
              {formatPrice(subtotalCents / 100)}
            </dd>
          </div>
        </dl>
        <p className="mt-3 text-sm text-muted">
          El total definitivo lo calcula la tienda al crear el pedido.
        </p>
        <Link href="/checkout" className={`${buttonPrimary} mt-5 w-full py-2.5`}>
          Continuar con el pedido
        </Link>
      </aside>
    </div>
  );
}
