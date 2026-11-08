# syntax=docker/dockerfile:1.7
# =============================================================================
# Frontend Next.js 16 - imagen de producción multi-stage
#   base:    Node 22 LTS sobre Alpine (Node 20 ya llegó a fin de vida).
#   deps:    instala dependencias con pnpm (capa cacheada mientras no cambie el lockfile).
#   builder: compila con `next build` usando output "standalone".
#   runner:  imagen final SIN pnpm, SIN node_modules completo ni código fuente:
#            solo el servidor standalone, los estáticos y public/. Usuario no-root.
# =============================================================================
ARG NODE_VERSION=22
ARG PNPM_VERSION=11.28.9

# -----------------------------------------------------------------------------
FROM node:${NODE_VERSION}-alpine AS base
# libc6-compat: recomendado por Next.js en Alpine (musl) para binarios nativos
RUN apk add --no-cache libc6-compat
WORKDIR /app

# -----------------------------------------------------------------------------
# deps: solo los manifiestos, para aprovechar el caché de capas
# -----------------------------------------------------------------------------
FROM base AS deps
ARG PNPM_VERSION
RUN npm install -g pnpm@${PNPM_VERSION}

COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,target=/pnpm/store \
    pnpm install --frozen-lockfile --store-dir /pnpm/store

# -----------------------------------------------------------------------------
# builder: compila la aplicación
# -----------------------------------------------------------------------------
FROM deps AS builder

# La clave PÚBLICA de Stripe se incrusta en el JavaScript del navegador durante
# el build (NEXT_PUBLIC_*), por eso entra como ARG y no como variable de runtime.
# API_BASE_URL NO hace falta aquí: solo la lee el servidor, en cada petición.
ARG NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
ENV NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=${NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY} \
    NEXT_TELEMETRY_DISABLED=1

COPY . .
RUN pnpm build

# -----------------------------------------------------------------------------
# runner: imagen final
# -----------------------------------------------------------------------------
FROM base AS runner

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

# standalone no incluye public/ ni .next/static: se copian aparte.
# Usuario "node" (uid 1000) ya existe en la imagen oficial.
COPY --from=builder --chown=node:node /app/.next/standalone ./
COPY --from=builder --chown=node:node /app/.next/static ./.next/static
COPY --from=builder --chown=node:node /app/public ./public

USER node

EXPOSE 3000

# /login es estático (no depende de la API), así que el healthcheck no falla
# si el backend está caído.
HEALTHCHECK --interval=15s --timeout=5s --start-period=20s --retries=5 \
    CMD wget -q --spider http://127.0.0.1:3000/login || exit 1

CMD ["node", "server.js"]
