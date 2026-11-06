import { CartView } from "@/components/cart/cart-view";

export const metadata = { title: "Carrito" };

export default function CartPage() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <h1 className="mb-8 font-display text-4xl font-bold tracking-tight">
        Carrito
      </h1>
      <CartView />
    </main>
  );
}
