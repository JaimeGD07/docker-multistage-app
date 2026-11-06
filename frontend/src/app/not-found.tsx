import Link from "next/link";
import { StatePanel, buttonPrimary } from "@/components/state-panel";

export default function NotFound() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <StatePanel
        title="Página no encontrada"
        actions={
          <Link href="/" className={buttonPrimary}>
            Ir al catálogo
          </Link>
        }
      >
        La dirección no existe. Revisa que esté bien escrita.
      </StatePanel>
    </main>
  );
}
