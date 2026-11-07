# Deploy de Golden Point

## Base de datos (Aiven)
- Servicio MySQL en Aiven, plan gratuito. Exige conexión SSL.
- La primera vez el backend crea las tablas (DDL_AUTO=update).
- Migraciones aplicadas: las 3 de backend/migraciones.
- El plan gratuito apaga el servicio si no se usa: antes de cada presentación, entrar a Aiven y tocar Power on.
- Los datos de conexión no se suben al repositorio: están en las variables de Render.

## Backend (Render)
- Web Service con Docker, conectado al repositorio del equipo (rama main, carpeta backend).
- Nombre del servicio: Qwerty123-ProyectoIntegrador-Ecommerce-CuartoSemestre
- URL: https://proyecto-integrador-e-commerce-qwerty123.onrender.com
- Health Check: /api/v1/catalogo/filtros
- Cada merge a main se publica automáticamente.
- Variables de entorno (los valores solo están en Render): DB_URL, DB_USER, DB_PASSWORD,
  JWT_SECRET, ADMIN_EMAIL, ADMIN_PASSWORD, MP_ACCESS_TOKEN, MP_WEBHOOK_SECRET,
  MP_NOTIFICATION_URL, FRONTEND_URL, CORS_ORIGINS, BREVO_API_KEY, BREVO_SENDER_EMAIL, CLOUDINARY_URL
- El plan gratuito duerme el servidor sin uso: la primera visita tarda cerca de un minuto.
- La raíz de la URL responde 401: es normal, la API solo atiende rutas /api/v1/...

## Frontend (Vercel)
- Proyecto conectado al repositorio del equipo (rama main, carpeta frontend).
- URL: https://golden-point-kappa.vercel.app
- Variable de entorno: VITE_API_URL (dirección del backend en Render).
- vercel.json redirige todas las rutas a index.html, para que /producto/3 o /pago/resultado no den 404 al recargar.
- En Render, FRONTEND_URL y CORS_ORIGINS apuntan a esta dirección.
