import { ProductDetailSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-6 h-5 w-36 animate-pulse rounded bg-panel-2" />
      <ProductDetailSkeleton />
    </main>
  );
}
