-- =============================================================================
-- Migración 2026-10-19: talles de pelota según el deporte (brief 3.4)
-- =============================================================================
-- Fútbol usa N° 3, 4 y 5; básquet N° 6 y 7. Borra las filas de stock de pelotas en
-- talles que no corresponden a su deporte, SOLO si tienen cantidad 0 (no se pierde stock),
-- y los avisos "Avisarme cuando llegue" pendientes de esos talles.
-- Solo cambia datos (no estructura): se puede correr antes o después de publicar, y repetir.
-- Al final lista las filas que quedaron con stock en un talle que no corresponde: esas hay
-- que pasarlas a 0 desde el panel y volver a correr el script.
--
-- Local:  mysql -u root -p golden_point -e "source backend/migraciones/2026-10-19_talles_de_pelota.sql"
-- Aiven:  mysql -h HOST -P PUERTO -u avnadmin -p --ssl-mode=REQUIRED defaultdb -e "source ..."
-- =============================================================================

SET NAMES utf8mb4;

-- Talles que NO corresponden: fútbol fuera de N° 3 a 5, básquet fuera de N° 6 y 7, pádel ninguno
CREATE TEMPORARY TABLE talles_invalidos AS
SELECT s.id AS stock_id, s.producto_id, s.talle_id, s.cantidad
FROM stock_productos s
JOIN productos p ON p.id = s.producto_id
JOIN talles t ON t.id = s.talle_id
WHERE t.tipo_talle = 'PELOTA'
  AND NOT ((p.deporte = 'FUTBOL' AND t.etiqueta IN ('N° 3', 'N° 4', 'N° 5'))
        OR (p.deporte = 'BASQUET' AND t.etiqueta IN ('N° 6', 'N° 7')));

DELETE a FROM avisos_stock a
JOIN talles_invalidos i ON i.producto_id = a.producto_id AND i.talle_id = a.talle_id
WHERE i.cantidad = 0 AND a.notificado = 0;

DELETE s FROM stock_productos s
JOIN talles_invalidos i ON i.stock_id = s.id
WHERE i.cantidad = 0;

SELECT i.producto_id, p.nombre, t.etiqueta, i.cantidad AS stock_a_revisar
FROM talles_invalidos i
JOIN productos p ON p.id = i.producto_id
JOIN talles t ON t.id = i.talle_id
WHERE i.cantidad > 0;

DROP TEMPORARY TABLE talles_invalidos;
