-- =============================================================================
-- Migración 2026-10-18 (2): ajustes de la tienda editables y precio de oferta
-- =============================================================================
-- Crea la tabla ajustes_tienda (vacía: el backend la completa al arrancar con los
-- valores de application.yml) y agrega la columna precio_oferta a productos.
--
-- Se corre UNA sola vez por base de datos, ANTES de publicar el código nuevo.
-- Si se corre de nuevo, falla en el CREATE TABLE sin tocar ningún dato.
--
-- Local:  mysql -u root -p golden_point -e "source backend/migraciones/2026-10-18_ajustes_y_ofertas.sql"
-- Aiven:  mysql -h HOST -P PUERTO -u avnadmin -p --ssl-mode=REQUIRED defaultdb -e "source ..."
-- =============================================================================

SET NAMES utf8mb4;

CREATE TABLE `ajustes_tienda` (
  `id` bigint NOT NULL,
  `costo_envio` decimal(12,2) NOT NULL,
  `envio_gratis_desde` decimal(12,2) NOT NULL,
  `fecha_actualizacion` datetime(6) NOT NULL,
  `recargo_personalizacion` decimal(12,2) NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- Sin valor = el producto no está en oferta
ALTER TABLE `productos` ADD COLUMN `precio_oferta` decimal(12,2) NULL AFTER `precio`;
