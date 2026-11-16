# Frontend — Ruta Norte

Interfaz web de gestión de vehículos, conductores y viajes, desarrollada con Vite, React y CSS puro.

## Desarrollo

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

La aplicación queda disponible en `http://localhost:5173`. La URL base de la API se configura con `VITE_API_URL`; por defecto es `http://localhost:3000/api`.

## Contrato esperado de la API

Las solicitudes usan `fetch`, JSON y, para las operaciones protegidas, `Authorization: Bearer <token>`.

| Operación | Método y ruta |
| --- | --- |
| Registro | `POST /auth/register` |
| Inicio de sesión | `POST /auth/login` |
| Listar vehículos | `GET /vehiculos` |
| Crear, modificar y eliminar vehículos | `POST /vehiculos`, `PUT /vehiculos/:id`, `DELETE /vehiculos/:id` |
| Listar conductores | `GET /conductores` |
| Crear, modificar y eliminar conductores | `POST /conductores`, `PUT /conductores/:id`, `DELETE /conductores/:id` |
| Listar y registrar viajes | `GET /viajes`, `POST /viajes` |

El registro recibe `{ nombre, email, contrasena }`; el inicio de sesión recibe `{ email, contrasena }` y debe responder con `{ token, usuario }`. Las colecciones pueden responder como un arreglo JSON o como `{ data: [...] }`. Los nombres de campos de vehículos, conductores y viajes coinciden con `backend/sql/schema.sql`.

El backend de este repositorio todavía debe montar estas rutas para que el inicio de sesión y las operaciones de gestión funcionen; mientras tanto, la pantalla pública puede recorrerse y la aplicación muestra el error de conexión de forma explícita.
