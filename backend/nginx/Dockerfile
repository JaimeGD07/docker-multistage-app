# syntax=docker/dockerfile:1.7
# =============================================================================
# Nginx del backend: sirve archivos estáticos de public/ y pasa las peticiones
# PHP a PHP-FPM (servicio "app"). El contexto de build es ./backend.
# nginx-unprivileged corre como usuario no-root y escucha en el 8080.
# =============================================================================
FROM nginxinc/nginx-unprivileged:1.27-alpine

COPY nginx/default.conf /etc/nginx/conf.d/default.conf

# Solo public/ (index.php, robots.txt, favicon): ni código de la app ni vendor
COPY --chown=nginx:nginx public /var/www/html/public

EXPOSE 8080

HEALTHCHECK --interval=15s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -q --spider http://127.0.0.1:8080/nginx-health || exit 1
