import { ProductGridSkeleton } from "@/components/skeletons";

export default function Loading() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <div className="mb-8">
        <div className="h-10 w-48 animate-pulse rounded bg-panel-2" />
        <div className="mt-3 h-5 w-72 max-w-full animate-pulse rounded bg-panel-2" />
      </div>
      <ProductGridSkeleton />
    </main>
  );
}
