import { notFound, redirect } from "next/navigation";
import { Suspense } from "react";
import { PaymentClient } from "@/components/payment/payment-client";
import { ApiError } from "@/lib/api/errors";
import { apiGetOrder } from "@/lib/api/orders";
import type { Order } from "@/lib/api/types";
import { requireSession } from "@/lib/auth/session";
import { formatPrice } from "@/lib/money";
import { PaymentSkeleton } from "./skeleton";

export const metadata = { title: "Pagar pedido" };

export default function PaymentPage({ params }: PageProps<"/pedidos/[id]/pago">) {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <Suspense fallback={<PaymentSkeleton />}>
        <PaymentContent params={params} />
      </Suspense>
    </main>
  );
}

async function PaymentContent({
  params,
}: {
  params: PageProps<"/pedidos/[id]/pago">["params"];
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const { token } = await requireSession(`/pedidos/${id}/pago`);

  let order: Order | null = null;
  try {
    order = await apiGetOrder(token, id);
  } catch (e) {
    if (e instanceof ApiError && (e.status === 404 || e.status === 403)) notFound();
    throw e;
  }

  // Solo se paga lo que esta pendiente
  if (order.status !== "pending") redirect(`/pedidos/${order.id}`);

  return (
    <>
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Pagar pedido #{order.id}
      </h1>
      <p className="mb-8 mt-2 text-muted">
        Total a pagar:{" "}
        <span className="font-display text-xl font-bold text-amber">
          {formatPrice(order.total)}
        </span>
      </p>
      <PaymentClient
        key={order.id}
        orderId={order.id}
        total={order.total}
        hasExistingPayment={Boolean(order.payment)}
      />
    </>
  );
}
