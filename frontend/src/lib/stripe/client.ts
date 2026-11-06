import { loadStripe, type Stripe } from "@stripe/stripe-js";

const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? "";

/** La clave publica (pk_test_...) es la unica variable de Stripe expuesta al navegador. */
export const stripeConfigured =
  key.startsWith("pk_") && !/x{6,}|placeholder/i.test(key);

let promise: Promise<Stripe | null> | null = null;

/** Carga Stripe.js una sola vez, solo cuando se necesita (pagina de pago). */
export function getStripe(): Promise<Stripe | null> {
  if (!stripeConfigured) return Promise.resolve(null);
  promise ??= loadStripe(key);
  return promise;
}
