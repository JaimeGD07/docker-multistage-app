export function CheckoutSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando pedido"
      className="grid gap-8 lg:grid-cols-[1fr_20rem]"
    >
      <div className="h-56 animate-pulse rounded-md border border-line bg-panel-2" />
      <div className="h-48 animate-pulse rounded-md border border-line bg-panel-2" />
    </div>
  );
}
