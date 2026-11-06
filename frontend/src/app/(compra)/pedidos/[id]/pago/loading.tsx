import { PaymentSkeleton } from "./skeleton";

export default function Loading() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <PaymentSkeleton />
    </main>
  );
}
