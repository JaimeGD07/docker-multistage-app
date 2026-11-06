import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { AddToCartButton } from "@/components/cart/add-to-cart-button";
import { ProductImage } from "@/components/product-image";
import { ProductDetailSkeleton } from "@/components/skeletons";
import { StockIndicator } from "@/components/stock-indicator";
import { getProduct } from "@/lib/data/products";
import { formatPrice } from "@/lib/money";

export default function ProductPage({ params }: PageProps<"/productos/[id]">) {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <Link
        href="/"
        className="mb-6 inline-block text-sm text-muted transition-colors hover:text-text"
      >
        Volver al catálogo
      </Link>
      {/* `params` es dato de la peticion: se lee detras de Suspense (Cache Components) */}
      <Suspense fallback={<ProductDetailSkeleton />}>
        <ProductDetail params={params} />
      </Suspense>
    </main>
  );
}

async function ProductDetail({
  params,
}: {
  params: PageProps<"/productos/[id]">["params"];
}) {
  const { id } = await params;
  if (!/^\d+$/.test(id)) notFound();

  const product = await getProduct(Number(id));
  if (!product) notFound();

  return (
    <article className="grid gap-8 lg:grid-cols-2 lg:gap-12">
      <ProductImage
        src={product.image_url}
        alt={product.name}
        sizes="(min-width: 1024px) 560px, 100vw"
        eager
        className="rounded-md border border-line"
      />

      <div>
        <h1 className="font-display text-3xl font-bold leading-tight tracking-tight sm:text-4xl">
          {product.name}
        </h1>
        <p className="mt-4 font-display text-4xl font-bold text-amber">
          {formatPrice(product.price)}
        </p>
        <div className="mt-3">
          <StockIndicator stock={product.stock} />
        </div>

        <AddToCartButton product={product} />

        {product.description ? (
          <p className="mt-8 max-w-prose text-muted">{product.description}</p>
        ) : null}


        <dl className="mt-8 divide-y divide-line rounded-md border border-line bg-panel text-sm">
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Referencia</dt>
            <dd className="font-mono">#{product.id}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Unidades en stock</dt>
            <dd className="font-mono">{product.stock}</dd>
          </div>
          <div className="flex justify-between gap-4 px-4 py-3">
            <dt className="text-muted">Moneda</dt>
            <dd className="font-mono">USD</dd>
          </div>
        </dl>
      </div>
    </article>
  );
}
