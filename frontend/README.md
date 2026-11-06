# Kodigo Tech — Frontend e-commerce (Tarea 17)

Tienda de hardware y periféricos construida con **Next.js 16 (App Router, TypeScript, Tailwind CSS v4)**. Consume la API REST de la [Tarea 12](https://github.com/JaimeGD07/tarea12-ecommerce-api) (Laravel 12, JWT, Stripe, Swagger).

## Qué incluye

- Catálogo y detalle de producto públicos.
- Registro, login y logout con el token JWT guardado en una **cookie `httpOnly`** (el JavaScript del navegador nunca lo ve).
- Carrito en el navegador (Context + `localStorage`) y creación de pedidos con **Server Actions**.
- Pago con tarjeta mediante **Stripe** (Payment Element).
- Historial de compras protegido.
- `loading.tsx`, `error.tsx`, `not-found.tsx` y `Suspense` en las rutas con datos.

## Requisitos

- Node.js 20 o superior y [pnpm](https://pnpm.io).
- La API de la Tarea 12 en marcha (por defecto en `http://localhost:8030/api`, con Docker según su README).
- Una cuenta de Stripe en **modo test** (claves `pk_test_…` y `sk_test_…`).

## Instalación

```bash
pnpm install
cp .env.example .env.local   # y completa los valores
pnpm dev                     # http://localhost:3000
```

Para producción: `pnpm build && pnpm start`.

> Con pnpm 10+ puede pedir aprobar scripts de compilación: ejecuta `pnpm approve-builds`.

## Variables de entorno

| Variable | Dónde se usa | Descripción |
| --- | --- | --- |
| `API_BASE_URL` | Solo servidor | URL base de la API **con** el prefijo `/api` y sin `/` final. Ej.: `http://localhost:8030/api` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Navegador | Clave **pública** de Stripe (`pk_test_…`). |

La clave secreta de Stripe (`STRIPE_SECRET=sk_test_…`) va **solo** en el `.env` de la API Laravel; este frontend nunca la usa. Ambas claves deben ser de la misma cuenta de Stripe. Tras cambiar `.env.local` hay que reiniciar `pnpm dev`.

## Rutas

| Ruta | Acceso | Descripción |
| --- | --- | --- |
| `/` | Pública | Catálogo de productos |
| `/productos/[id]` | Pública | Detalle de producto y botón de agregar al carrito |
| `/carrito` | Pública | Carrito de compras |
| `/login`, `/registro` | Pública | Autenticación |
| `/cuenta` | **Protegida** | Datos de la cuenta |
| `/checkout` | **Protegida** | Revisión y confirmación del pedido |
| `/pedidos` | **Protegida** | Historial de compras |
| `/pedidos/[id]` | **Protegida** | Detalle y estado de un pedido |
| `/pedidos/[id]/pago` | **Protegida** | Pago con Stripe |

Las rutas protegidas se filtran en `src/proxy.ts` (comprobación rápida de la cookie) y se verifican de verdad contra la API en la capa de acceso a datos (`src/lib/auth/session.ts`). Sin sesión redirigen a `/login?next=…` y vuelven a la página pedida tras entrar.

## Cómo funciona

- **Lecturas** (catálogo, pedidos): Server Components. El catálogo usa `use cache` con `cacheTag("products")`; al crear un pedido (descuenta stock) la Server Action llama a `updateTag("products")`.
- **Mutaciones** (login, registro, crear pedido, iniciar/confirmar pago): Server Actions en `src/lib/actions/`, con `revalidatePath` para refrescar el historial.
- **Pago:** el servidor pide a la API el `client_secret` (`POST /orders/{id}/pay`); Stripe.js cobra en el navegador; solo si Stripe confirma, otra Server Action llama a `POST /orders/{id}/confirm`.
- **Cache Components** activado (`cacheComponents: true`): todo lo que lee cookies o parámetros va dentro de `<Suspense>`.

## Estructura

```
src/
  app/            rutas (grupos: (tienda), (cuenta), (compra))
  components/     UI (cart/, auth/, payment/, orders/)
  lib/
    api/          cliente de la API Laravel y tipos
    auth/         cookie httpOnly, JWT, sesión (DAL)
    actions/      Server Actions
    cart/         estado del carrito
    data/         lecturas cacheadas
  proxy.ts        protección optimista de rutas
scripts/
  mock-api.mjs    API simulada solo para desarrollo sin Docker
```

## Probar el pago

Con Stripe en modo test: `4242 4242 4242 4242` (aprobada) o `4000 0000 0000 0002` (rechazada), cualquier fecha futura y cualquier CVC.

## Limitaciones conocidas de la API (Tarea 12)

- `POST /orders/{id}/pay` crea un intento nuevo en cada llamada y `confirm` revisa solo el primero; por eso el frontend la llama una vez por pedido y guarda el `client_secret` en `localStorage`.
- `confirm` marca el pedido como `failed` si el pago aún no está `succeeded`; el frontend solo lo llama después de que Stripe confirme.
- El stock se descuenta al crear el pedido y no se devuelve si el pedido no se paga.
- Los mensajes de validación de Laravel están en inglés.

## Evidencias

### API (Swagger)
![Swagger de la API](docs/swagger-api.png)
### Flujo de compra
| Catálogo | Carrito | Checkout |
| --- | --- | --- |
| ![Catálogo](docs/flujo-01-catalogo.png) | ![Carrito](docs/flujo-02-carrito.png) | ![Checkout](docs/flujo-03-checkout.png) |

| Pago | Pedido pagado | Historial |
| --- | --- | --- |
| ![Pago](docs/flujo-04-pago.png) | ![Pagado](docs/flujo-05-pagado.png) | ![Historial](docs/flujo-06-historial.png) |

### Lighthouse
![Lighthouse - inicio](docs/lighthouse-home.png)
![Lighthouse - producto](docs/lighthouse-producto.png)

## Scripts

| Comando | Acción |
| --- | --- |
| `pnpm dev` | Servidor de desarrollo |
| `pnpm build` / `pnpm start` | Build y servidor de producción |
| `pnpm lint` | ESLint |
| `node scripts/mock-api.mjs` | API simulada en `:8030` (opcional) |
