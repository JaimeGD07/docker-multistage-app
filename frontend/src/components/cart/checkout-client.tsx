"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ProductImage } from "@/components/product-image";
import { StatePanel, buttonPrimary } from "@/components/state-panel";
import { SubmitButton } from "@/components/auth/submit-button";
import { createOrderAction } from "@/lib/actions/orders";
import { MAX_PER_LINE } from "@/lib/cart/cart-store";
import { formatPrice, toNumber } from "@/lib/money";
import { useCart } from "./cart-provider";

/** Datos frescos del catalogo (servidor) contra los que se concilia el carrito local */
export type CatalogEntry = {
  id: number;
  name: string;
  price: string;
  stock: number;
  image_url: string | null;
};

type Line = {
  productId: number;
  name: string;
  price: string;
  imageUrl: string | null;
  quantity: number;
};

export function CheckoutClient({ catalog }: { catalog: CatalogEntry[] }) {
  const router = useRouter();
  const { items, ready, clear } = useCart();
  const [error, setError] = useState<string | undefined>();
  const [orderId, setOrderId] = useState<number | undefined>();

  // Next 16 conserva el estado de las paginas ya visitadas (Activity): sin este reset, volver a
  // /checkout reutilizaba el pedido anterior y redirigia siempre a el.
  useEffect(
    () => () => {
      setOrderId(undefined);
      setError(undefined);
    },
    [],
  );

  async function action(formData: FormData) {
    setError(undefined);
    const res = await createOrderAction(undefined, formData);
    if (res?.orderId !== undefined) {
      // La orden ya existe en la API: ahora si se vacia el carrito local
      setOrderId(res.orderId);
      clear();
      router.replace(`/pedidos/${res.orderId}`);
    } else {
      setError(res?.error ?? "No se pudo crear el pedido. Intenta de nuevo.");
    }
  }

  // Concilia el carrito con el catalogo actual: precio real, stock real, productos retirados
  const { lines, notices } = useMemo(() => {
    const byId = new Map(catalog.map((p) => [p.id, p]));
    const lines: Line[] = [];
    const notices: string[] = [];
    for (const item of items) {
      const fresh = byId.get(item.productId);
      if (!fresh || fresh.stock <= 0) {
        notices.push(`${item.name} ya no está disponible y se quitó del pedido.`);
        continue;
      }
      const max = Math.min(fresh.stock, MAX_PER_LINE);
      const quantity = Math.min(item.quantity, max);
      if (quantity < item.quantity) {
        notices.push(`${fresh.name}: solo quedan ${max} unidades, ajustamos la cantidad.`);
      }
      if (fresh.price !== item.price) {
        notices.push(`${fresh.name}: el precio cambió a ${formatPrice(fresh.price)}.`);
      }
      lines.push({
        productId: fresh.id,
        name: fresh.name,
        price: fresh.price,
        imageUrl: fresh.image_url,
        quantity,
      });
    }
    return { lines, notices };
  }, [items, catalog]);

  if (orderId !== undefined) {
    return (
      <p role="status" className="text-muted">
        Pedido creado. Te estamos llevando al detalle…
      </p>
    );
  }

  if (!ready) {
    return (
      <div
        aria-busy="true"
        aria-label="Cargando pedido"
        className="h-48 animate-pulse rounded-md border border-line bg-panel-2"
      />
    );
  }

  if (lines.length === 0) {
    return (
      <StatePanel
        title="No hay productos para pedir"
        actions={
          <Link href="/" className={buttonPrimary}>
            Ver el catálogo
          </Link>
        }
      >
        {notices.length
          ? notices.join(" ")
          : "Agrega productos al carrito antes de crear un pedido."}
      </StatePanel>
    );
  }

  const totalCents = lines.reduce(
    (sum, l) => sum + Math.round(toNumber(l.price) * 100) * l.quantity,
    0,
  );

  return (
    <form action={action} className="grid items-start gap-8 lg:grid-cols-[1fr_20rem]">
      <input
        type="hidden"
        name="items"
        value={JSON.stringify(
          lines.map((l) => ({ productId: l.productId, quantity: l.quantity })),
        )}
      />

      <div className="space-y-4">
        {error ? (
          <p
            role="alert"
            className="rounded border border-out/50 bg-out/10 px-3 py-2 text-sm text-out"
          >
            {error}
          </p>
        ) : null}
        {notices.length ? (
          <ul
            role="status"
            className="space-y-1 rounded border border-amber/50 bg-amber/10 px-3 py-2 text-sm text-amber"
          >
            {notices.map((n) => (
              <li key={n}>{n}</li>
            ))}
          </ul>
        ) : null}

        <ul className="divide-y divide-line rounded-md border border-line bg-panel">
          {lines.map((l) => (
            <li key={l.productId} className="flex items-center gap-4 p-4">
              <div className="w-20 shrink-0">
                <ProductImage
                  src={l.imageUrl}
                  alt={l.name}
                  sizes="80px"
                  className="rounded border border-line"
                />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-display font-semibold leading-snug">{l.name}</p>
                <p className="mt-0.5 text-sm text-muted">
                  {l.quantity} × {formatPrice(l.price)}
                </p>
              </div>
              <p className="font-display text-lg font-bold text-amber">
                {formatPrice((Math.round(toNumber(l.price) * 100) * l.quantity) / 100)}
              </p>
            </li>
          ))}
        </ul>
        <Link
          href="/carrito"
          className="inline-block text-sm text-muted underline-offset-4 hover:text-text hover:underline"
        >
          Editar carrito
        </Link>
      </div>

      <aside
        aria-label="Resumen del pedido"
        className="rounded-md border border-line bg-panel p-5 lg:sticky lg:top-6"
      >
        <h2 className="font-display text-xl font-bold">Total</h2>
        <p className="mt-2 font-display text-3xl font-bold text-amber">
          {formatPrice(totalCents / 100)}
        </p>
        <p className="mb-5 mt-2 text-sm text-muted">
          Al confirmar se reserva el stock y se crea el pedido. El pago es el
          siguiente paso.
        </p>
        <SubmitButton pendingLabel="Creando pedido…">Confirmar pedido</SubmitButton>
      </aside>
    </form>
  );
}
