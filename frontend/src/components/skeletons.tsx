/** Esqueletos de carga. Mismas medidas que el contenido real para evitar saltos de layout (CLS). */

const bar = "animate-pulse rounded bg-panel-2";

export function ProductGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Cargando productos">
      {/* Reserva el espacio de la linea "N productos" para que no haya salto al cargar */}
      <div className={`${bar} mb-4 h-5 w-24`} />
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-5">
        {Array.from({ length: count }, (_, i) => (
          <li
            key={i}
            className="overflow-hidden rounded-md border border-line bg-panel"
          >
            <div className="aspect-[4/3] animate-pulse border-b border-line bg-panel-2" />
            <div className="space-y-3 p-4">
              <div className={`${bar} h-5 w-4/5`} />
              <div className={`${bar} h-5 w-1/2`} />
              <div className="flex items-end justify-between pt-2">
                <div className={`${bar} h-7 w-24`} />
                <div className={`${bar} h-4 w-20`} />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function ProductDetailSkeleton() {
  return (
    <div
      aria-busy="true"
      aria-label="Cargando producto"
      className="grid gap-8 lg:grid-cols-2"
    >
      <div className="aspect-[4/3] animate-pulse rounded-md border border-line bg-panel-2" />
      <div className="space-y-5">
        <div className={`${bar} h-9 w-3/4`} />
        <div className={`${bar} h-10 w-40`} />
        <div className={`${bar} h-4 w-28`} />
        <div className="space-y-2 pt-4">
          <div className={`${bar} h-4 w-full`} />
          <div className={`${bar} h-4 w-5/6`} />
          <div className={`${bar} h-4 w-2/3`} />
        </div>
      </div>
    </div>
  );
}

export function OrderListSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div aria-busy="true" aria-label="Cargando pedidos" className="mt-6">
      <div className="h-5 w-56 animate-pulse rounded bg-panel-2" />
      <div className="mt-4 space-y-4">
        {Array.from({ length: count }, (_, i) => (
          <div key={i} className="h-36 animate-pulse rounded-md border border-line bg-panel-2" />
        ))}
      </div>
    </div>
  );
}
