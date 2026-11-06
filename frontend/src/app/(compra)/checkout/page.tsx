import { Suspense } from "react";
import {
  CheckoutClient,
  type CatalogEntry,
} from "@/components/cart/checkout-client";
import { requireSession } from "@/lib/auth/session";
import { getProducts } from "@/lib/data/products";
import { CheckoutSkeleton } from "./skeleton";

export const metadata = { title: "Confirmar pedido" };

export default function CheckoutPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tight">
        Confirmar pedido
      </h1>
      <Suspense fallback={<CheckoutSkeleton />}>
        <CheckoutContent />
      </Suspense>
    </main>
  );
}

async function CheckoutContent() {
  // Exige sesion valida (el proxy ya filtro; aqui se verifica contra la API)
  await requireSession("/checkout");
  // Catalogo actual para conciliar precios y stock del carrito local
  const products = await getProducts();
  const catalog: CatalogEntry[] = products.map((p) => ({
    id: p.id,
    name: p.name,
    price: p.price,
    stock: p.stock,
    image_url: p.image_url,
  }));
  return <CheckoutClient catalog={catalog} />;
}
