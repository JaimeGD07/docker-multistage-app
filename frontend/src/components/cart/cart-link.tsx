"use client";

import Link from "next/link";
import { useCart } from "./cart-provider";

export function CartLink() {
  const { count, ready } = useCart();
  const shown = ready ? count : 0;

  return (
    <Link
      href="/carrito"
      aria-label={
        shown > 0
          ? `Carrito, ${shown} ${shown === 1 ? "unidad" : "unidades"}`
          : "Carrito"
      }
      className="relative flex items-center gap-1.5 text-muted transition-colors hover:text-text"
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="size-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.75"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M3 4h2l2.2 10.2a1 1 0 0 0 1 .8h8.6a1 1 0 0 0 1-.76L19.5 8H6.2" />
        <circle cx="9" cy="19" r="1.25" />
        <circle cx="17" cy="19" r="1.25" />
      </svg>
      <span className="hidden sm:inline">Carrito</span>
      {shown > 0 ? (
        <span
          aria-hidden="true"
          className="min-w-5 rounded-full bg-amber px-1.5 text-center text-xs font-semibold leading-5 text-amber-ink"
        >
          {shown}
        </span>
      ) : null}
    </Link>
  );
}
