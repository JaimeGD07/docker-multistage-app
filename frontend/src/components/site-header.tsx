import Link from "next/link";
import { Suspense } from "react";
import { CartLink } from "./cart/cart-link";
import { UserMenu } from "./user-menu";

export function SiteHeader() {
  return (
    <header className="border-b border-line bg-bg/90">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-4 sm:px-6">
        <Link
          href="/"
          className="flex shrink-0 items-center gap-2.5 font-display text-lg font-bold tracking-tight"
        >
          <span
            aria-hidden="true"
            className="size-2.5 rounded-[2px] bg-amber shadow-[0_0_10px_var(--color-amber)]"
          />
          Kodigo Tech
        </Link>
        <nav aria-label="Principal" className="min-w-0">
          <ul className="flex items-center gap-4 text-sm sm:gap-6">
            <li className="hidden sm:block">
              <Link
                href="/"
                className="text-muted transition-colors hover:text-text"
              >
                Catálogo
              </Link>
            </li>
            <li>
              <CartLink />
            </li>
            {/* El menu depende de la cookie: va en Suspense para no bloquear el resto de la pagina */}
            <Suspense
              fallback={
                <li
                  aria-hidden="true"
                  className="h-5 w-36 animate-pulse rounded bg-panel-2"
                />
              }
            >
              <UserMenu />
            </Suspense>
          </ul>
        </nav>
      </div>
    </header>
  );
}
