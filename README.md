# TP3 - Gestión de vehículos, conductores y viajes

Programación IV - UTN FRLR. Backend Express + MySQL y frontend Vite + React.

## Requisitos

- Node.js 20.19+ y npm.
- MySQL con el cliente de línea de comandos.

## Preparar el proyecto

1. Crear la base y sus tablas ejecutando `backend/sql/schema.sql` en MySQL.
2. Copiar `backend/.env.example` a `backend/.env` (sin reemplazar un `.env` existente) y configurar `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD` y `DB_NAME`.
3. Generar un secreto local para JWT con `node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"` y guardarlo como `JWT_SECRET` en `backend/.env`. No subir ese valor al repositorio.
4. Instalar dependencias en cada carpeta:

   ```sh
   cd backend && npm install
   cd ../frontend && npm install
   ```

5. Iniciar el backend y el frontend en terminales separadas:

   ```sh
   cd backend && npm run dev
   ```

   ```sh
   cd frontend && npm run dev
   ```

   Abrir la URL que muestra Vite, normalmente `http://localhost:5173`.

El backend usa `http://localhost:3000/api` por defecto. El secreto JWT se exige y los tokens expiran a las cuatro horas. En producción, servir la aplicación y API mediante HTTPS.

## API

- `POST /auth/register` y `POST /auth/login` son públicos.
- Vehículos, conductores y viajes tienen `GET /`, `GET /:id`, `POST /`, `PUT /:id` y `DELETE /:id`, protegidos por JWT en `Authorization: Bearer <token>`.
- Los listados aceptan `limit` (1-500) y `offset` (entero no negativo) opcionales.
- Los ejemplos de registro, autenticación y operaciones están en [backend/api.http](./backend/api.http) (extensión REST Client para VS Code).

El esquema de la consigna no vincula los registros de vehículos, conductores o viajes a un usuario; por eso, todos los usuarios autenticados operan sobre el mismo conjunto de datos.

Ejecutar las pruebas del backend con `cd backend && npm test`. Las pruebas de validación y autorización no modifican la base de datos.