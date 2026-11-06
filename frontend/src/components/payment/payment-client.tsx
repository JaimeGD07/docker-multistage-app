"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useSyncExternalStore, useTransition } from "react";
import { Elements, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { StatePanel, buttonPrimary, buttonSecondary } from "@/components/state-panel";
import { confirmPaymentAction, startPaymentAction } from "@/lib/actions/payments";
import { formatPrice } from "@/lib/money";
import { getStripe, stripeConfigured } from "@/lib/stripe/client";
import { readSecret, subscribeSecret, writeSecret } from "./secret-store";

type Props = {
  orderId: number;
  total: string;
  /** La API ya creo un intento de pago para este pedido (GET /orders/{id} trae `payment`) */
  hasExistingPayment: boolean;
};

const appearance = {
  theme: "night" as const,
  variables: {
    colorPrimary: "#ffb224",
    colorBackground: "#1d2338",
    colorText: "#e8ebf5",
    colorTextSecondary: "#96a0bd",
    colorDanger: "#ff7a7a",
    fontFamily: '"IBM Plex Sans", system-ui, sans-serif',
    borderRadius: "4px",
  },
};

export function PaymentClient({ orderId, total, hasExistingPayment }: Props) {
  const secret = useSyncExternalStore(
    subscribeSecret,
    () => readSecret(orderId),
    () => null,
  );
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  if (!stripeConfigured) {
    return (
      <StatePanel title="Falta configurar Stripe">
        Define <code className="font-mono">NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY</code> con
        tu clave pública (<code className="font-mono">pk_test_…</code>) en{" "}
        <code className="font-mono">.env.local</code> y reinicia el servidor.
      </StatePanel>
    );
  }

  function start() {
    setError(null);
    startTransition(async () => {
      const res = await startPaymentAction(orderId);
      if (res.clientSecret) writeSecret(orderId, res.clientSecret);
      else setError(res.error ?? "No se pudo iniciar el pago.");
    });
  }

  // Paso 2: ya hay intento de pago -> formulario de tarjeta
  if (secret) {
    return (
      <Elements
        key={secret}
        stripe={getStripe()}
        options={{ clientSecret: secret, appearance, locale: "es" }}
      >
        <PayForm key={orderId} orderId={orderId} total={total} />
      </Elements>
    );
  }

  // Ya existe un intento en la API pero este navegador no tiene su secreto:
  // crear otro generaria un segundo intento y la confirmacion revisaria el equivocado.
  if (hasExistingPayment) {
    return (
      <StatePanel
        title="Este pedido ya tiene un pago iniciado"
        actions={
          <Link href={`/pedidos/${orderId}`} className={buttonSecondary}>
            Volver al pedido
          </Link>
        }
      >
        El pago se empezó desde otro navegador o se borraron los datos de este. Para
        evitar un cobro duplicado no creamos otro intento. Termínalo desde el
        navegador donde lo iniciaste o crea un pedido nuevo.
      </StatePanel>
    );
  }

  // Paso 1: boton explicito (no se llama a la API al renderizar la pagina)
  return (
    <div className="rounded-md border border-line bg-panel p-6">
      <p className="text-muted">
        Vas a pagar <strong className="text-text">{formatPrice(total)}</strong> con
        tarjeta. Los datos de la tarjeta los procesa Stripe: esta tienda nunca los ve.
      </p>
      {error ? (
        <p
          role="alert"
          className="mt-4 rounded border border-out/50 bg-out/10 px-3 py-2 text-sm text-out"
        >
          {error}
        </p>
      ) : null}
      <button
        type="button"
        onClick={start}
        disabled={pending}
        className={`${buttonPrimary} mt-5 w-full py-2.5 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-8`}
      >
        {pending ? "Preparando el pago…" : "Continuar al pago"}
      </button>
    </div>
  );
}

function PayForm({ orderId, total }: { orderId: number; total: string }) {
  const stripe = useStripe();
  const elements = useElements();
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [needsVerify, setNeedsVerify] = useState(false);

  async function finish() {
    let res: Awaited<ReturnType<typeof confirmPaymentAction>>;
    try {
      res = await confirmPaymentAction(orderId);
    } catch {
      // Se cayo la conexion entre el navegador y la tienda (no la API): mismo tratamiento
      res = { error: "sin conexión con la tienda" };
    }
    if (res.error) {
      // El cobro YA se hizo en Stripe: solo falta confirmarlo con la API. No se vuelve a cobrar.
      setMessage(
        `Tu pago se realizó, pero no pudimos confirmarlo con la tienda (${res.error}). Pulsa «Verificar pago» para reintentar; no se cobrará de nuevo.`,
      );
      return false;
    }
    if (res.status === "paid") {
      writeSecret(orderId, null);
      router.replace(`/pedidos/${orderId}?pago=ok`);
      return true;
    }
    // La API respondio, pero la orden no quedo pagada
    writeSecret(orderId, null);
    router.replace(`/pedidos/${orderId}`);
    return true;
  }

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!stripe || !elements || busy) return;
    setBusy(true);
    setMessage(null);

    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: "if_required",
      confirmParams: { return_url: `${window.location.origin}/pedidos/${orderId}` },
    });

    if (error) {
      // Tarjeta rechazada, datos incompletos, etc. La orden sigue pendiente: se puede reintentar.
      setMessage(error.message ?? "No se pudo procesar el pago.");
      setBusy(false);
      return;
    }

    if (paymentIntent?.status === "succeeded") {
      const done = await finish();
      if (!done) {
        // Stripe ya cobro: reintentar el cobro daria error. Se ofrece solo reintentar la confirmacion.
        setNeedsVerify(true);
        setBusy(false);
      }
      return;
    }

    // processing / otros: no confirmamos aun (la API marcaria la orden como fallida)
    setNeedsVerify(true);
    setMessage("Tu pago se está procesando. Espera unos segundos y pulsa «Verificar pago».");
    setBusy(false);
  }

  async function onVerify() {
    setBusy(true);
    setMessage(null);
    const done = await finish();
    if (!done) setBusy(false);
  }

  return (
    <form onSubmit={onSubmit} className="rounded-md border border-line bg-panel p-6">
      <PaymentElement />

      {message ? (
        <p
          role="alert"
          className="mt-4 rounded border border-out/50 bg-out/10 px-3 py-2 text-sm text-out"
        >
          {message}
        </p>
      ) : null}

      <div className="mt-6 flex flex-wrap items-center gap-3">
        {needsVerify ? (
          <button
            type="button"
            onClick={onVerify}
            disabled={busy}
            className={`${buttonPrimary} py-2.5 disabled:cursor-wait disabled:opacity-70`}
          >
            {busy ? "Verificando…" : "Verificar pago"}
          </button>
        ) : (
          <button
            type="submit"
            disabled={!stripe || !elements || busy}
            className={`${buttonPrimary} w-full py-2.5 disabled:cursor-wait disabled:opacity-70 sm:w-auto sm:px-8`}
          >
            {busy ? "Procesando…" : `Pagar ${formatPrice(total)}`}
          </button>
        )}
        <Link href={`/pedidos/${orderId}`} className="text-sm text-muted underline-offset-4 hover:text-text hover:underline">
          Cancelar
        </Link>
      </div>
    </form>
  );
}
