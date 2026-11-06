# Deploy de Golden Point

## Base de datos (Aiven)
- Servicio MySQL en Aiven, plan gratuito. Exige conexión SSL.
- La primera vez el backend crea las tablas (DDL_AUTO=update).
- Migraciones aplicadas: las 3 de backend/migraciones.
- El plan gratuito apaga el servicio si no se usa: antes de cada presentación, entrar a Aiven y tocar Power on.
- Los datos de conexión no se suben al repositorio: están en las variables de Render.