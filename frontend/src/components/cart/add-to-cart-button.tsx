"use client";

import Link from "next/link";
import { buttonPrimary } from "@/components/state-panel";
import type { Product } from "@/lib/api/types";
import { useCart } from "./cart-provider";

export function AddToCartButton({ product }: { product: Product }) {
  const { items, add, ready } = useCart();
  const inCart = items.find((i) => i.productId === product.id)?.quantity ?? 0;
  const soldOut = product.stock <= 0;
  const atLimit = !soldOut && inCart >= product.stock;

  return (
    <div className="mt-8">
      <button
        type="button"
        disabled={soldOut || atLimit}
        onClick={() =>
          add({
            productId: product.id,
            name: product.name,
            price: product.price,
            imageUrl: product.image_url,
            stock: product.stock,
          })
        }
        className={`${buttonPrimary} w-full py-3 text-base disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto sm:px-8`}
      >
        {soldOut ? "Agotado" : "Agregar al carrito"}
      </button>

      {/* aria-live: los lectores de pantalla anuncian el cambio de cantidad */}
      <p aria-live="polite" className="mt-3 min-h-6 text-sm text-muted">
        {ready && inCart > 0 ? (
          <>
            {inCart === 1 ? "Tienes 1 unidad" : `Tienes ${inCart} unidades`} en
            el carrito.{" "}
            {atLimit ? "Ya agregaste todo el stock disponible. " : null}
            <Link
              href="/carrito"
              className="text-amber underline underline-offset-4 hover:no-underline"
            >
              Ver carrito
            </Link>
          </>
        ) : null}
      </p>
    </div>
  );
}
