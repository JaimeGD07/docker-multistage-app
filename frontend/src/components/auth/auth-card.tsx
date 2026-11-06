import type { ReactNode } from "react";

/** Contenedor centrado de las pantallas de acceso. El titulo va fuera de Suspense (forma parte del shell). */
export function AuthShell({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <main className="mx-auto w-full max-w-md px-4 py-12 sm:py-16">
      <h1 className="mb-6 font-display text-3xl font-bold tracking-tight">
        {title}
      </h1>
      <div className="rounded-md border border-line bg-panel p-6">
        {children}
      </div>
    </main>
  );
}

export function AuthFormSkeleton({ fields }: { fields: number }) {
  return (
    <div aria-busy="true" aria-label="Cargando formulario" className="space-y-4">
      {Array.from({ length: fields }, (_, i) => (
        <div key={i} className="space-y-2">
          <div className="h-4 w-32 animate-pulse rounded bg-panel-2" />
          <div className="h-11 animate-pulse rounded bg-panel-2" />
        </div>
      ))}
      <div className="h-11 animate-pulse rounded bg-panel-2" />
    </div>
  );
}
