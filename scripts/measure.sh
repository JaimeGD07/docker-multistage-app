#!/usr/bin/env bash
# =============================================================================
# Mide las imágenes del proyecto: tamaños, usuario de ejecución, contenido
# que NO debe estar en producción y efectividad del caché de capas.
#
# Uso (desde la raíz del repo, con el stack ya construido):
#   ./scripts/measure.sh              # medición rápida
#   ./scripts/measure.sh --baseline   # además construye el frontend "ingenuo" (tarda varios minutos)
#   ./scripts/measure.sh | tee medicion.txt
# =============================================================================
set -uo pipefail
cd "$(dirname "$0")/.."

BASELINE=false
[ "${1:-}" = "--baseline" ] && BASELINE=true

TMP_FILES=("backend/.cache-test" "frontend/.cache-test")
cleanup() { rm -f "${TMP_FILES[@]}"; }
trap cleanup EXIT

h() { printf '\n==================== %s ====================\n' "$1"; }

h "1. TAMAÑO DE IMÁGENES"
docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" \
  | grep -E "REPOSITORY|^ecommerce-(api|nginx|frontend)" || true

if $BASELINE; then
  h "1b. REFERENCIA: frontend de una sola etapa (node:22 completo)"
  docker build -q -f scripts/baseline/Dockerfile.frontend-naive -t ecommerce-frontend:naive ./frontend >/dev/null \
    && docker images --format "table {{.Repository}}\t{{.Tag}}\t{{.Size}}" ecommerce-frontend
fi

h "2. USUARIO CON EL QUE CORRE CADA CONTENEDOR (no debe ser root)"
for s in app nginx frontend; do
  printf '%-10s -> ' "$s"; docker compose exec -T "$s" id -un 2>&1
done

h "3. LO QUE NO DEBE ESTAR EN LAS IMÁGENES FINALES"
echo "[app] composer / git / phpunit / compiladores:"
docker run --rm --entrypoint sh ecommerce-api:latest -c \
  'for b in composer git gcc make; do printf "  %-9s " $b; command -v $b || echo "no está (OK)"; done; printf "  phpunit   "; ls vendor/phpunit >/dev/null 2>&1 && echo "PRESENTE (mal)" || echo "no está (OK)"; printf "  .env      "; ls .env >/dev/null 2>&1 && echo "PRESENTE (mal)" || echo "no está (OK)"'
echo "[frontend] pnpm / código fuente / TypeScript:"
docker run --rm --entrypoint sh ecommerce-frontend:latest -c \
  'for b in pnpm npm; do printf "  %-9s " $b; command -v $b || echo "no está (OK)"; done; printf "  src/      "; ls src >/dev/null 2>&1 && echo "PRESENTE (mal)" || echo "no está (OK)"; printf "  .env      "; ls .env >/dev/null 2>&1 && echo "PRESENTE (mal)" || echo "no está (OK)"'

h "4. CAPAS MÁS GRANDES (app y frontend)"
for img in ecommerce-api:latest ecommerce-frontend:latest; do
  echo "[$img]"
  docker history --no-trunc --format "{{.Size}}\t{{.CreatedBy}}" "$img" \
    | grep -v '^0B' | cut -c1-110 | head -5
done

h "5. CACHÉ DE CAPAS: reconstrucción tras un cambio de código"
echo "(se crea un archivo temporal que invalida solo la capa del código; se borra al terminar)"
for svc in app frontend; do
  dir=backend; [ "$svc" = frontend ] && dir=frontend
  echo "x$(date +%s%N)" > "$dir/.cache-test"
  start=$SECONDS
  docker compose build "$svc" >/dev/null 2>&1
  echo "  $svc: reconstrucción con caché = $((SECONDS - start)) s"
done
cleanup
echo "  (resultado de referencia: la primera construcción desde cero tardó ~15 min, casi todo descarga de imágenes base)"

h "6. ESTADO FINAL"
docker compose ps --format "table {{.Service}}\t{{.Status}}"
git status --short | grep -q . && echo "AVISO: hay cambios sin commitear" || echo "Árbol de trabajo limpio"
