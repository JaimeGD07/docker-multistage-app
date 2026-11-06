export function PaymentSkeleton() {
  return (
    <div aria-busy="true" aria-label="Cargando pago">
      <div className="h-10 w-72 animate-pulse rounded bg-panel-2" />
      <div className="mb-8 mt-3 h-5 w-56 animate-pulse rounded bg-panel-2" />
      <div className="h-64 animate-pulse rounded-md border border-line bg-panel-2" />
    </div>
  );
}
