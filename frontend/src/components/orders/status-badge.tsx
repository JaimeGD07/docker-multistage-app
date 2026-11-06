import type { OrderStatus } from "@/lib/api/types";

export const ORDER_STATUS: Record<OrderStatus, { label: string; className: string }> = {
  pending: { label: "Pendiente de pago", className: "border-amber/60 text-amber" },
  paid: { label: "Pagado", className: "border-ok/60 text-ok" },
  failed: { label: "Pago fallido", className: "border-out/60 text-out" },
  cancelled: { label: "Cancelado", className: "border-line-strong text-muted" },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const s = ORDER_STATUS[status] ?? ORDER_STATUS.pending;
  return (
    <span className={`whitespace-nowrap rounded-full border px-3 py-0.5 text-sm ${s.className}`}>
      {s.label}
    </span>
  );
}
