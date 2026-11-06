import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { StatusBadge } from "@/components/orders/status-badge";
import { ProductImage } from "@/components/product-image";
import { buttonPrimary, buttonSecondary } from "@/components/state-panel";
import { ApiError } from "@/lib/api/errors";
import { apiGetOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import { formatPrice, toNumber } from "@/lib/money";

export const metadata = { title: "Detalle del pedido" };

const PAYMENT_STATUS: Record<string, string> = {
  pending: "Pendiente",
  succeeded: "Pagado",
  failed: "Fallido",
};

export default function OrderPage({
  params,
  searchParams,
}: PageProps<"/pedidos/[id]">) {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <Suspense
        fallback={
          <div
            aria-busy="true"
            aria-label="Cargando pedido"
            className="h-64 animate-pulse rounded-md border border-line bg-panel-2"
          />
        }
      >
        <OrderDetail params={params} searchParams={searchParams} />
      </Suspense>
    </main>
  );
}

async function OrderDetail({
  params,
  searchParams,
}: {
  params: PageProps<"/pedidos/[id]">["params"];
  searchParams: PageProps<"/pedidos/[id]">["searchParams"];
}) {
  const { id } = await params;
  const sp = await searchParams;
  if (!/^\d+$/.test(id)) notFound();

  const { token } = await requireSession(`/pedidos/${id}`);

  let order: Order | null = null;
  try {
    order = await apiGetOrder(token, id);
  } catch (e) {
    // 403 (orden de otra persona) y 404 se muestran igual: no revelamos que existe
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) notFound();
    throw e;
  }

  const justPaid = order.status === "paid" && sp.pago === "ok";

  return (
    <article>
      <div className="flex flex-wrap items-center gap-3">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Pedido #{order.id}
        </h1>
        <StatusBadge status={order.status} />
      </div>

      {justPaid ? (
        <p
          role="status"
          className="mt-6 rounded border border-ok/50 bg-ok/10 px-3 py-2 text-sm text-ok"
        >
          Pago recibido. ¡Gracias por tu compra!
        </p>
      ) : null}
      {order.status === "failed" ? (
        <p
          role="status"
          className="mt-6 rounded border border-out/50 bg-out/10 px-3 py-2 text-sm text-out"
        >
          El pago no se completó y este pedido ya no admite nuevos intentos. Crea un
          pedido nuevo desde el catálogo.
        </p>
      ) : null}

      <ul className="mt-8 divide-y divide-line rounded-md border border-line bg-panel">
        {(order.items ?? []).map((item) => (
          <li key={item.id} className="flex items-center gap-4 p-4">
            <div className="w-20 shrink-0">
              <ProductImage
                src={item.product?.image_url ?? null}
                alt={item.product?.name ?? "Producto"}
                sizes="80px"
                className="rounded border border-line"
              />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold leading-snug">
                {item.product?.name ?? `Producto #${item.product_id}`}
              </p>
              <p className="mt-0.5 text-sm text-muted">
                {item.quantity} × {formatPrice(item.unit_price)}
              </p>
            </div>
            <p className="font-display text-lg font-bold">
              {formatPrice(toNumber(item.unit_price) * item.quantity)}
            </p>
          </li>
        ))}
      </ul>

      <div className="mt-6 flex items-baseline justify-between rounded-md border border-line bg-panel px-4 py-4">
        <span>Total</span>
        <span className="font-display text-3xl font-bold text-amber">
          {formatPrice(order.total)}
        </span>
      </div>

      {order.payment ? (
        <dl className="mt-6 divide-y divide-line rounded-md border border-line bg-panel text-sm">
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Estado del pago</dt>
            <dd>{PAYMENT_STATUS[order.payment.status] ?? order.payment.status}</dd>
          </div>
          {order.payment.stripe_payment_intent_id ? (
            <div className="flex justify-between gap-4 px-4 py-3">
              <dt className="text-muted">Referencia de Stripe</dt>
              <dd className="truncate font-mono text-xs sm:text-sm">
                {order.payment.stripe_payment_intent_id}
              </dd>
            </div>
          ) : null}
        </dl>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {order.status === "pending" ? (
          <Link href={`/pedidos/${order.id}/pago`} className={buttonPrimary}>
            Pagar pedido
          </Link>
        ) : null}
        <Link href="/" className={buttonSecondary}>
          Seguir comprando
        </Link>
      </div>
    </article>
  );
}
