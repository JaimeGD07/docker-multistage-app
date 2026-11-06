/**
 * Guarda el client_secret del PaymentIntent de cada pedido en localStorage (de este navegador; sobrevive a recargas y a cerrar la pestana).
 * Asi, recargar la pagina de pago NO crea otro intento en la API.
 */
const listeners = new Set<() => void>();
const keyFor = (orderId: number) => `kt_pi_${orderId}`;

export function subscribeSecret(listener: () => void) {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

export function readSecret(orderId: number): string | null {
  try {
    return window.localStorage.getItem(keyFor(orderId));
  } catch {
    return null;
  }
}

export function writeSecret(orderId: number, secret: string | null) {
  try {
    if (secret) window.localStorage.setItem(keyFor(orderId), secret);
    else window.localStorage.removeItem(keyFor(orderId));
  } catch {
    // storage bloqueado: el pago sigue funcionando en esta sesion de la pagina
  }
  listeners.forEach((l) => l());
}
