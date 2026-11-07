# syntax=docker/dockerfile:1.7
# =============================================================================
# Backend Laravel 12 - imagen de producción multi-stage
#   Etapa 1 (vendor):  instala dependencias de Composer sin dev.
#   Etapa 2 (runtime): PHP-FPM sobre Alpine; solo código + vendor, sin Composer
#                      ni toolchain de compilación, ejecutando como no-root.
# PHP 8.4: el composer.lock incluye Symfony 8.x, que exige PHP >= 8.4.1.
# =============================================================================
ARG PHP_VERSION=8.4

# -----------------------------------------------------------------------------
# Etapa 1: dependencias de Composer
# -----------------------------------------------------------------------------
FROM php:${PHP_VERSION}-cli-alpine AS vendor

COPY --from=composer:2.8 /usr/bin/composer /usr/bin/composer
RUN apk add --no-cache unzip

ENV COMPOSER_ALLOW_SUPERUSER=1 \
    COMPOSER_NO_INTERACTION=1 \
    COMPOSER_CACHE_DIR=/tmp/composer-cache

WORKDIR /app

# Solo los manifiestos: esta capa (y la instalación) se reutiliza del caché
# mientras composer.json / composer.lock no cambien.
COPY composer.json composer.lock ./
RUN --mount=type=cache,target=/tmp/composer-cache \
    composer install --no-dev --no-scripts --no-autoloader --prefer-dist

# Con el código ya presente se genera el autoload optimizado y se ejecuta
# package:discover (post-autoload-dump).
COPY . .
RUN composer dump-autoload --no-dev --optimize --classmap-authoritative

# -----------------------------------------------------------------------------
# Etapa 2: runtime
# -----------------------------------------------------------------------------
FROM php:${PHP_VERSION}-fpm-alpine AS runtime

# pdo_mysql: conexión a MySQL. opcache: rendimiento en producción.
# Las herramientas de compilación se instalan y se eliminan en la MISMA capa.
# (mbstring, openssl, tokenizer, ctype, dom, curl, sodium... ya vienen en la imagen base)
RUN apk add --no-cache --virtual .build-deps $PHPIZE_DEPS \
    && docker-php-ext-install -j"$(nproc)" pdo_mysql opcache \
    && apk del .build-deps \
    && mv "$PHP_INI_DIR/php.ini-production" "$PHP_INI_DIR/php.ini"

COPY docker/php-custom.ini "$PHP_INI_DIR/conf.d/zz-app.ini"
COPY --chmod=755 docker/entrypoint.sh /usr/local/bin/entrypoint.sh

WORKDIR /var/www/html

# Orden de capas de menos a más cambiante:
# 1) vendor (cambia solo si cambia composer.lock)
COPY --from=vendor --chown=www-data:www-data /app/vendor ./vendor
# 2) código de la aplicación (cambia en cada commit)
COPY --chown=www-data:www-data . .
# 3) caché de paquetes generado por package:discover en la etapa vendor
COPY --from=vendor --chown=www-data:www-data /app/bootstrap/cache ./bootstrap/cache

# Directorios que Laravel necesita escribir en tiempo de ejecución
RUN mkdir -p storage/framework/cache/data storage/framework/sessions \
             storage/framework/views storage/logs bootstrap/cache \
    && chown -R www-data:www-data storage bootstrap/cache

# Ejecución sin privilegios de root
USER www-data

EXPOSE 9000

ENTRYPOINT ["entrypoint.sh"]
CMD ["php-fpm"]
