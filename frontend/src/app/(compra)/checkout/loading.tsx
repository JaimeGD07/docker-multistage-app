import { CheckoutSkeleton } from "./skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8 h-10 w-72 animate-pulse rounded bg-panel-2" />
      <CheckoutSkeleton />
    </main>
  );
}
