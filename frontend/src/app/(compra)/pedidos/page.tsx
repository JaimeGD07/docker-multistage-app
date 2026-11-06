import Link from "next/link";
import { Suspense } from "react";
import { StatusBadge } from "@/components/orders/status-badge";
import { OrderListSkeleton } from "@/components/skeletons";
import { StatePanel, buttonPrimary, buttonSecondary } from "@/components/state-panel";
import { apiListOrders } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import { formatCents, formatPrice, toCents } from "@/lib/money";

export const metadata = { title: "Mis pedidos" };

const dateFormat = new Intl.DateTimeFormat("es", {
  dateStyle: "medium",
  timeStyle: "short",
  timeZone: "America/El_Salvador",
});

export default function OrdersPage() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">Mis pedidos</h1>
      <p className="mt-2 text-muted">Tu historial de compras, del más reciente al más antiguo.</p>
      {/* La lista depende de la cookie de sesion: va detras de Suspense (Cache Components) */}
      <Suspense fallback={<OrderListSkeleton />}>
        <OrderList />
      </Suspense>
    </main>
  );
}

async function OrderList() {
  const { token } = await requireSession("/pedidos");
  const orders = sortOrders(await apiListOrders(token));

  if (orders.length === 0) {
    return (
      <div className="mt-8">
        <StatePanel
          title="Aún no tienes pedidos"
          actions={
            <Link href="/" className={buttonPrimary}>
              Ver el catálogo
            </Link>
          }
        >
          Cuando hagas tu primera compra, aparecerá aquí.
        </StatePanel>
      </div>
    );
  }

  const paid = orders.filter((o) => o.status === "paid");
  const paidCents = paid.reduce((sum, o) => sum + toCents(o.total), 0);

  return (
    <>
      <p className="mt-6 text-sm text-muted" aria-live="polite">
        {orders.length} {orders.length === 1 ? "pedido" : "pedidos"} · {paid.length}{" "}
        {paid.length === 1 ? "pagado" : "pagados"} por{" "}
        <span className="font-mono text-text">{formatCents(paidCents)}</span>
      </p>
      <ul className="mt-4 space-y-4">
        {orders.map((order) => (
          <OrderCard key={order.id} order={order} />
        ))}
      </ul>
    </>
  );
}

function sortOrders(orders: Order[]): Order[] {
  return [...orders].sort((a, b) => b.id - a.id);
}

function summary(order: Order): string {
  const items = order.items ?? [];
  if (items.length === 0) return "Sin productos";
  const first = items[0].product?.name ?? `Producto #${items[0].product_id}`;
  const units = items.reduce((n, i) => n + i.quantity, 0);
  const rest = items.length - 1;
  return `${first}${rest > 0 ? ` y ${rest} más` : ""} · ${units} ${units === 1 ? "unidad" : "unidades"}`;
}

function OrderCard({ order }: { order: Order }) {
  const date = order.created_at ? new Date(order.created_at) : null;
  const valid = date && !Number.isNaN(date.getTime());
  return (
    <li className="rounded-md border border-line bg-panel p-4 sm:p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="font-display text-xl font-bold">
            <Link
              href={`/pedidos/${order.id}`}
              className="underline-offset-4 hover:text-amber hover:underline"
            >
              Pedido #{order.id}
            </Link>
          </h2>
          {valid ? (
            <p className="mt-0.5 text-sm text-muted">
              <time dateTime={date.toISOString()}>{dateFormat.format(date)}</time>
            </p>
          ) : null}
        </div>
        <StatusBadge status={order.status} />
      </div>
      <p className="mt-3 truncate text-sm text-muted">{summary(order)}</p>
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <p className="font-display text-2xl font-bold text-amber">{formatPrice(order.total)}</p>
        <div className="flex gap-3">
          {order.status === "pending" ? (
            <Link href={`/pedidos/${order.id}/pago`} className={buttonPrimary}>
              Pagar
            </Link>
          ) : null}
          <Link href={`/pedidos/${order.id}`} className={buttonSecondary}>
            Ver detalle
          </Link>
        </div>
      </div>
    </li>
  );
}
