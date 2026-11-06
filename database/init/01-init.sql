-- Script de inicialización OPCIONAL.
-- MySQL ejecuta los archivos .sql/.sh de este directorio en orden alfabético,
-- UNA sola vez: cuando el volumen de datos está vacío (primer arranque).
--
-- La base de datos y el usuario ya los crean las variables MYSQL_DATABASE,
-- MYSQL_USER y MYSQL_PASSWORD, y las tablas las crea Laravel con
-- `php artisan migrate`. Aquí solo se deja una verificación de que corrió.
SELECT 'Script de inicializacion ejecutado' AS info;
