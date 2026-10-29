-- =============================================================================
-- Migración 2026-10-18: nombres de tablas, columnas y valores en español
-- =============================================================================
-- Crea las tablas nuevas, copia TODOS los datos de las tablas viejas (traduciendo
-- los valores fijos: deportes, estados, roles y tipos de talle) y borra las viejas.
--
-- Se corre UNA sola vez por base de datos (la local de cada integrante y la de Aiven).
-- Si se corre de nuevo, falla en el primer CREATE TABLE sin tocar ningún dato.
--
-- Local:  mysql -u root -p golden_point -e "source backend/migraciones/2026-10-18_nombres_en_espanol.sql"
-- Aiven:  mysql -h HOST -P PUERTO -u avnadmin -p --ssl-mode=REQUIRED defaultdb -e "source ..."
-- =============================================================================

SET NAMES utf8mb4;
SET FOREIGN_KEY_CHECKS = 0;

-- ---------- 1. Tablas nuevas (estructura generada por Hibernate) ----------

CREATE TABLE `avisos_stock` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `email` varchar(120) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `notificado` bit(1) NOT NULL,
  `producto_id` bigint NOT NULL,
  `talle_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKd6wjphhedj6ifoh780u5akj0m` (`producto_id`),
  KEY `FKsx9tyer5bnksey9sb04calymb` (`talle_id`),
  CONSTRAINT `FKd6wjphhedj6ifoh780u5akj0m` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKsx9tyer5bnksey9sb04calymb` FOREIGN KEY (`talle_id`) REFERENCES `talles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `categorias` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  `tipo_talle` enum('CALZADO','PELOTA','ROPA','UNICO') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKqcog8b7hps1hioi9onqwjdt6y` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `items_pedido` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `nombre_personalizado` varchar(12) DEFAULT NULL,
  `numero_personalizado` int DEFAULT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `recargo_unitario` decimal(12,2) NOT NULL,
  `pedido_id` bigint NOT NULL,
  `producto_id` bigint NOT NULL,
  `talle_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FKhshdf36fo6kflmxhom10pbn39` (`pedido_id`),
  KEY `FK7jlim4dtym775y1be8l1l7w3h` (`producto_id`),
  KEY `FK6xupv7or6838sct5bp8c93ryd` (`talle_id`),
  CONSTRAINT `FK6xupv7or6838sct5bp8c93ryd` FOREIGN KEY (`talle_id`) REFERENCES `talles` (`id`),
  CONSTRAINT `FK7jlim4dtym775y1be8l1l7w3h` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKhshdf36fo6kflmxhom10pbn39` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `marcas` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `nombre` varchar(60) NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKf9j5vnky0egidx9qqqa4gbf85` (`nombre`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `pedidos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `costo_envio` decimal(12,2) NOT NULL,
  `envio_calle` varchar(150) NOT NULL,
  `envio_ciudad` varchar(80) NOT NULL,
  `envio_codigo_postal` varchar(10) NOT NULL,
  `envio_indicaciones` varchar(255) DEFAULT NULL,
  `envio_provincia` varchar(60) NOT NULL,
  `envio_telefono` varchar(30) NOT NULL,
  `estado` enum('CANCELADO','ENTREGADO','ENVIADO','EN_PREPARACION','PAGADO','PENDIENTE_PAGO') NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `mp_pago_id` varchar(100) DEFAULT NULL,
  `mp_preferencia_id` varchar(100) DEFAULT NULL,
  `recargo_personalizacion` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `usuario_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK5g0es69v35nmkmpi8uewbphs2` (`usuario_id`),
  CONSTRAINT `FK5g0es69v35nmkmpi8uewbphs2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `productos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `deporte` enum('BASQUET','FUTBOL','PADEL') NOT NULL,
  `descripcion` varchar(1000) DEFAULT NULL,
  `destacado` bit(1) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `habilitado` bit(1) NOT NULL,
  `imagen_url` varchar(500) DEFAULT NULL,
  `nombre` varchar(120) NOT NULL,
  `personalizable` bit(1) NOT NULL,
  `precio` decimal(12,2) NOT NULL,
  `categoria_id` bigint NOT NULL,
  `marca_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  KEY `FK2fwq10nwymfv7fumctxt9vpgb` (`categoria_id`),
  KEY `FK2k6lj04qqala7kgd526xduxgn` (`marca_id`),
  CONSTRAINT `FK2fwq10nwymfv7fumctxt9vpgb` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`),
  CONSTRAINT `FK2k6lj04qqala7kgd526xduxgn` FOREIGN KEY (`marca_id`) REFERENCES `marcas` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `stock_productos` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `cantidad` int NOT NULL,
  `producto_id` bigint NOT NULL,
  `talle_id` bigint NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKgbkl2n27dbubu0mya4wv5jmjc` (`producto_id`,`talle_id`),
  KEY `FKm83ec2u1jvrct2jyorl3ooxr6` (`talle_id`),
  CONSTRAINT `FKkjb62mxm70mg4759mod5dnrdd` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  CONSTRAINT `FKm83ec2u1jvrct2jyorl3ooxr6` FOREIGN KEY (`talle_id`) REFERENCES `talles` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `talles` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `etiqueta` varchar(20) NOT NULL,
  `orden` int NOT NULL,
  `tipo_talle` enum('CALZADO','PELOTA','ROPA','UNICO') NOT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKsh7wuw8u59q1qm0d58qfgmd2y` (`tipo_talle`,`etiqueta`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

CREATE TABLE `usuarios` (
  `id` bigint NOT NULL AUTO_INCREMENT,
  `apellido` varchar(60) NOT NULL,
  `contrasena_hash` varchar(100) NOT NULL,
  `email` varchar(120) NOT NULL,
  `fecha_creacion` datetime(6) NOT NULL,
  `habilitado` bit(1) NOT NULL,
  `nombre` varchar(60) NOT NULL,
  `rol` enum('ADMIN','CLIENTE') NOT NULL,
  `telefono` varchar(30) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `UKkfsp0s1tflm1cwlj8idhqsad0` (`email`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;

-- ---------- 2. Copia de datos ----------

INSERT INTO marcas (id, nombre)
SELECT id, name FROM brands;

INSERT INTO categorias (id, nombre, tipo_talle)
SELECT id, name, CASE size_type WHEN 'CLOTHING' THEN 'ROPA' WHEN 'SHOE' THEN 'CALZADO' WHEN 'BALL' THEN 'PELOTA' WHEN 'ONE_SIZE' THEN 'UNICO' END FROM categories;

INSERT INTO talles (id, tipo_talle, etiqueta, orden)
SELECT id, CASE size_type WHEN 'CLOTHING' THEN 'ROPA' WHEN 'SHOE' THEN 'CALZADO' WHEN 'BALL' THEN 'PELOTA' WHEN 'ONE_SIZE' THEN 'UNICO' END, label, sort_order FROM sizes;

INSERT INTO productos (id, nombre, descripcion, precio, deporte, categoria_id, marca_id, imagen_url,
                       personalizable, destacado, habilitado, fecha_creacion)
SELECT id, name, description, price,
       CASE sport WHEN 'FOOTBALL' THEN 'FUTBOL' WHEN 'BASKETBALL' THEN 'BASQUET' WHEN 'PADEL' THEN 'PADEL' END,
       category_id, brand_id, image_url, customizable, featured, enabled, created_at
FROM products;

INSERT INTO stock_productos (id, producto_id, talle_id, cantidad)
SELECT id, product_id, size_id, quantity FROM product_stock;

INSERT INTO usuarios (id, nombre, apellido, email, contrasena_hash, telefono, rol, habilitado, fecha_creacion)
SELECT id, first_name, last_name, email, password_hash, phone,
       CASE role WHEN 'ADMIN' THEN 'ADMIN' WHEN 'CUSTOMER' THEN 'CLIENTE' END,
       enabled, created_at
FROM users;

INSERT INTO pedidos (id, usuario_id, estado, subtotal, recargo_personalizacion, costo_envio, total,
                     envio_calle, envio_ciudad, envio_provincia, envio_codigo_postal, envio_telefono,
                     envio_indicaciones, mp_preferencia_id, mp_pago_id, fecha_creacion)
SELECT id, user_id,
       CASE status WHEN 'PENDING_PAYMENT' THEN 'PENDIENTE_PAGO' WHEN 'PAID' THEN 'PAGADO'
                   WHEN 'PREPARING' THEN 'EN_PREPARACION' WHEN 'SHIPPED' THEN 'ENVIADO'
                   WHEN 'DELIVERED' THEN 'ENTREGADO' WHEN 'CANCELLED' THEN 'CANCELADO' END,
       subtotal, customization_fee, shipping_cost, total,
       ship_street, ship_city, ship_province, ship_zip, ship_phone,
       ship_notes, mp_preference_id, mp_payment_id, created_at
FROM orders;

INSERT INTO items_pedido (id, pedido_id, producto_id, talle_id, cantidad, precio_unitario, recargo_unitario,
                          nombre_personalizado, numero_personalizado)
SELECT id, order_id, product_id, size_id, quantity, unit_price, unit_fee, custom_name, custom_number
FROM order_items;

INSERT INTO avisos_stock (id, email, producto_id, talle_id, notificado, fecha_creacion)
SELECT id, email, product_id, size_id, notified, created_at FROM stock_alerts;

-- ---------- 3. Borrado de las tablas viejas ----------

DROP TABLE stock_alerts, order_items, orders, product_stock, products, sizes, categories, brands, users;

SET FOREIGN_KEY_CHECKS = 1;
