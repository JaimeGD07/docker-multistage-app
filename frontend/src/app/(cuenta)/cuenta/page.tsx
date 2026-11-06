import Link from "next/link";
import { Suspense } from "react";
import { logoutAction } from "@/lib/actions/auth";
import { requireSession } from "@/lib/auth/session";
import { buttonPrimary, buttonSecondary } from "@/components/state-panel";

export const metadata = { title: "Mi cuenta" };

export default function AccountPage() {
  return (
    <main className="mx-auto max-w-2xl px-4 py-10 sm:px-6">
      <h1 className="font-display text-4xl font-bold tracking-tight">
        Mi cuenta
      </h1>
      <Suspense
        fallback={
          <div
            aria-busy="true"
            aria-label="Cargando cuenta"
            className="mt-8 h-40 animate-pulse rounded-md border border-line bg-panel-2"
          />
        }
      >
        <AccountDetails />
      </Suspense>
    </main>
  );
}

async function AccountDetails() {
  // Verifica la sesion contra la API; sin sesion valida redirige a /login?next=/cuenta
  const { user } = await requireSession("/cuenta");

  return (
    <>
      <dl className="mt-8 divide-y divide-line rounded-md border border-line bg-panel text-sm">
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-muted">Nombre</dt>
          <dd>{user.name}</dd>
        </div>
        <div className="flex justify-between gap-4 px-4 py-3">
          <dt className="text-muted">Correo</dt>
          <dd className="font-mono">{user.email}</dd>
        </div>
      </dl>
      <div className="mt-6 flex flex-wrap items-center gap-3">
        <Link href="/pedidos" className={buttonPrimary}>
          Ver mis pedidos
        </Link>
        <form action={logoutAction}>
          <button type="submit" className={buttonSecondary}>
            Cerrar sesión
          </button>
        </form>
      </div>
    </>
  );
}
