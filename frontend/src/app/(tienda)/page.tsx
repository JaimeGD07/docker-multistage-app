import { connection } from "next/server";
import { Suspense } from "react";
import { ProductCard } from "@/components/product-card";
import { ProductGridSkeleton } from "@/components/skeletons";
import { StatePanel } from "@/components/state-panel";
import { getProducts } from "@/lib/data/products";

export default function CatalogPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <header className="mb-8">
        <h1 className="font-display text-4xl font-bold tracking-tight">
          Catálogo
        </h1>
        <p className="mt-2 max-w-prose text-muted">
          Hardware y periféricos para armar tu setup.
        </p>
      </header>

      {/* La lista llega por streaming: el resto de la pagina se pinta de inmediato */}
      <Suspense fallback={<ProductGridSkeleton />}>
        <ProductList />
      </Suspense>
    </main>
  );
}

async function ProductList() {
  // Marca la lista como dato de la peticion: no se prerenderiza en `next build`,
  // asi el build no depende de que la API este encendida.
  await connection();
  const products = await getProducts();

  if (products.length === 0) {
    return (
      <StatePanel title="Aún no hay productos">
        Cuando se agreguen productos en la API, aparecerán aquí.
      </StatePanel>
    );
  }

  return (
    <>
      <p className="mb-4 text-sm text-muted">
        {products.length} {products.length === 1 ? "producto" : "productos"}
      </p>
      <ul className="grid grid-cols-[repeat(auto-fill,minmax(17rem,1fr))] gap-5">
        {products.map((product, i) => (
          <ProductCard key={product.id} product={product} eager={i < 3} />
        ))}
      </ul>
    </>
  );
}
