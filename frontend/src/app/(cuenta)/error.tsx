"use client";

import { useEffect } from "react";
import { StatePanel, buttonPrimary } from "@/components/state-panel";

export default function CuentaError({
  error,
  retry,
}: {
  error: unknown;
  retry: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="mx-auto max-w-6xl px-4 py-16 sm:px-6">
      <StatePanel
        title="No pudimos completar la solicitud"
        actions={
          <button type="button" onClick={() => retry()} className={buttonPrimary}>
            Reintentar
          </button>
        }
      >
        No hubo respuesta de la API. Revisa que esté encendida e intenta de
        nuevo.
      </StatePanel>
    </main>
  );
}
