# Golden Point

E-commerce de equipamiento deportivo de fútbol, básquet y pádel. Proyecto Final Integrador de la Tecnicatura Universitaria en Programación, grupo QWERTY123.

El brief completo está en [docs/Brief_Golden_Point_v2.docx](docs/Brief_Golden_Point_v2.docx).

## Presentación del proyecto

- **Video promocional:** [Ver video](https://youtu.be/Aix8EJIy-dw)
- **Video explicativo:** [Ver video](https://youtu.be/dSYfyAJjlVw)

- 
## Tecnologías

| Parte | Tecnología |
|---|---|
| Backend | Java 21, Spring Boot 4.1, Spring Data JPA, Maven |
| Frontend | React 19 con Vite (JavaScript) |
| Base de datos | MySQL 8 |
| Pagos | Mercado Pago (cuentas de prueba) |
| Correo | Brevo |
| Deploy | Vercel (frontend), Render (backend) y Aiven (base de datos) |

## Estructura

```
├── backend/    API REST (Spring Boot)
├── frontend/   Sitio web (React + Vite)
└── docs/       Brief y documentación
```

## Requisitos

- JDK 21
- MySQL 8 corriendo en el puerto 3306
- Node.js 20 o superior

## Cómo levantar el backend

1. Copiar `backend/.env.example` como `backend/.env` y completar:
   - el usuario y la contraseña de MySQL,
   - `JWT_SECRET`: una frase de al menos 32 caracteres para firmar los tokens,
   - `ADMIN_EMAIL` y `ADMIN_PASSWORD`: el primer administrador, que se crea solo al arrancar.
   - `MP_ACCESS_TOKEN`: Access Token de la **cuenta de prueba Vendedor** de Mercado Pago (ver más abajo).
2. Desde la carpeta `backend`, ejecutar:

   ```bash
   ./mvnw spring-boot:run
   ```

3. La API queda en `http://localhost:8080`. La base de datos `golden_point` se crea sola la primera vez, con un catálogo de prueba.
4. La documentación de la API está en `http://localhost:8080/swagger-ui.html`. Para probar las rutas protegidas, hacer login, copiar el token y pegarlo en el botón **Authorize**.

## Pagos de prueba con Mercado Pago

Se usan dos cuentas de prueba distintas, creadas en Mercado Pago Developers → *Cuentas de prueba*:

| Cuenta | Para qué se usa |
|---|---|
| **Vendedor** | Es la tienda. Su Access Token va en `MP_ACCESS_TOKEN`. |
| **Comprador** | Es el cliente. Con ella se inicia sesión en Mercado Pago al pagar. |

Para pagar, abrir el link de pago en una ventana de incógnito e iniciar sesión con la cuenta **Comprador**.
Con tarjeta de prueba, el nombre del titular define el resultado: `APRO` aprueba el pago y `OTHE` lo rechaza.

## Nombres en español (migración de octubre de 2026)

Las tablas, columnas, rutas de la API y el código pasaron a español (por ejemplo `products` → `productos`, `/api/v1/orders` → `/api/v1/pedidos`).
Una base creada antes de ese cambio se convierte una sola vez con [backend/migraciones/2026-10-18_nombres_en_espanol.sql](backend/migraciones/2026-10-18_nombres_en_espanol.sql),
que copia los datos a las tablas nuevas y borra las viejas. El encabezado del archivo tiene el comando para la base local y para Aiven. Las bases nuevas no lo necesitan.

Los scripts de `backend/migraciones` se corren en orden de nombre, una sola vez por base y **antes** de publicar el código que los necesita
(en Render la base se valida al arrancar). Después de la traducción vino `2026-10-18_ajustes_y_ofertas.sql`: tabla `ajustes_tienda`
(envío y recargo editables desde el panel → Ajustes) y columna `precio_oferta` en `productos`.

## Cómo levantar el frontend

1. Copiar `frontend/.env.example` como `frontend/.env.local`.
2. Desde la carpeta `frontend`, ejecutar:

   ```bash
   npm install
   npm run dev
   ```

3. El sitio queda en `http://localhost:5173`.

## Deploy

| Parte | Servicio | Carpeta del repo |
|---|---|---|
| Base de datos | Aiven (MySQL) | — |
| Backend | Render (Web Service con Docker) | `backend` |
| Frontend | Vercel | `frontend` |
| Fotos de productos | Cloudinary | — |

El orden importa, porque cada servicio necesita la dirección del anterior.

### 1. Base de datos en Aiven

Crear un servicio **MySQL** (plan gratis) y anotar host, puerto, usuario y contraseña. Aiven exige conexión con SSL.

### 2. Backend en Render

**New → Web Service**, conectar el repositorio, **Root Directory** `backend` y **Runtime** Docker (usa el `backend/Dockerfile`). En **Health Check Path** poner `/api/v1/catalogo/filtros`.

Variables de entorno:

| Variable | Valor |
|---|---|
| `DB_URL` | `jdbc:mysql://HOST:PUERTO/defaultdb?sslMode=REQUIRED` |
| `DB_USER` / `DB_PASSWORD` | Los de Aiven |
| `DDL_AUTO` | `update` en el primer arranque (crea las tablas); después `validate` |
| `JWT_SECRET` | Una frase nueva de 32 caracteres o más (no usar la de desarrollo) |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | El primer administrador, con una contraseña fuerte |
| `MP_ACCESS_TOKEN` | Access Token de la cuenta de prueba Vendedor |
| `BREVO_API_KEY` / `BREVO_SENDER_EMAIL` | Los de Brevo |
| `CLOUDINARY_URL` | `cloudinary://API_KEY:API_SECRET@CLOUD_NAME` |
| `FRONTEND_URL` | La dirección de Vercel (paso 3), por ejemplo `https://golden-point.vercel.app` |
| `CORS_ORIGINS` | La misma dirección de Vercel |
| `MP_NOTIFICATION_URL` | La dirección de Render, por ejemplo `https://golden-point-api.onrender.com` |
| `MP_WEBHOOK_SECRET` | La clave secreta del webhook (paso 4) |

Con `FRONTEND_URL` en https, Mercado Pago devuelve al cliente al sitio automáticamente cuando el pago se aprueba.

En el plan gratis, Render duerme el backend después de 15 minutos sin uso: la primera visita tarda cerca de un minuto y el sitio muestra "Estamos despertando el servidor…".

### 3. Frontend en Vercel

**Add New → Project**, importar el repositorio, **Root Directory** `frontend` (Vercel detecta Vite solo) y la variable:

| Variable | Valor |
|---|---|
| `VITE_API_URL` | `https://TU-BACKEND.onrender.com/api/v1` |

`frontend/vercel.json` hace que las direcciones como `/producto/3` o `/pago/resultado` carguen la app en vez de dar 404.

### 4. Webhook de Mercado Pago

En Mercado Pago Developers → tu aplicación → **Webhooks**, modo de prueba:

- URL: `https://TU-BACKEND.onrender.com/api/v1/pagos/webhook`
- Evento: **Pagos**

Copiar la **clave secreta** que muestra y cargarla en `MP_WEBHOOK_SECRET` en Render. Así el pedido queda pagado aunque el cliente cierre la pestaña antes de volver al sitio.
