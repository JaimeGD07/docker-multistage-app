import Link from "next/link";
import { logoutAction } from "@/lib/actions/auth";
import { getCurrentUser } from "@/lib/auth/session";
import { buttonPrimary } from "./state-panel";

/** Lee la cookie de sesion: debe renderizarse dentro de <Suspense> (ver SiteHeader). */
export async function UserMenu() {
  // Si la API no responde, el encabezado no debe tumbar toda la pagina: mostramos un aviso
  // y cada pagina decide como mostrar su propio error.
  const user = await getCurrentUser().catch(() => "offline" as const);

  if (user === "offline") {
    return (
      <li className="text-muted" title="No se pudo verificar tu sesión">
        Sin conexión
      </li>
    );
  }

  if (!user) {
    return (
      <>
        <li>
          <Link href="/login" className="text-muted transition-colors hover:text-text">
            Ingresar
          </Link>
        </li>
        <li>
          <Link href="/registro" className={`${buttonPrimary} !hidden !py-1.5 sm:!inline-flex`}>
            Crear cuenta
          </Link>
        </li>
      </>
    );
  }

  return (
    <>
      <li>
        <Link href="/pedidos" className="text-muted transition-colors hover:text-text">
          Pedidos
        </Link>
      </li>
      <li className="min-w-0">
        <Link
          href="/cuenta"
          className="block max-w-[9rem] truncate text-text transition-colors hover:text-amber"
        >
          {user.name}
        </Link>
      </li>
      <li>
        <form action={logoutAction}>
          <button
            type="submit"
            className="text-muted transition-colors hover:text-text"
          >
            Salir
          </button>
        </form>
      </li>
    </>
  );
}
