#!/bin/sh
# Entrypoint del backend. La configuración llega por variables de entorno
# (no hay .env dentro de la imagen), por eso las cachés se generan AL ARRANCAR
# y no durante el build.
set -e

# Solo se prepara la app cuando el contenedor va a servir (php-fpm); así
# `docker compose run app php artisan ...` no dispara migraciones ni cachés.
if [ "$1" = "php-fpm" ]; then
    : "${APP_KEY:?APP_KEY no esta definida (ver .env.example)}"
    : "${JWT_SECRET:?JWT_SECRET no esta definida (ver .env.example)}"

    php artisan config:cache
    php artisan route:cache
    php artisan event:cache

    if [ "${RUN_MIGRATIONS:-false}" = "true" ]; then
        echo "[entrypoint] Ejecutando migraciones..."
        php artisan migrate --force
    fi
fi

exec "$@"
