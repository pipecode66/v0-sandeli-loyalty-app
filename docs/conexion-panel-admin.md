# Conexion con panel administrativo

## Variable de entorno requerida

Configura en Vercel:

- `NEXT_PUBLIC_ADMIN_API_BASE_URL=https://<tu-panel-admin>.vercel.app`

Si el valor ya incluye `/api/public`, tambien es valido.

## Flujo implementado

- Login: `POST /api/public/auth/login`
- Primer ingreso: `POST /api/public/auth/setup-password` cuando `requiresPasswordSetup` es `true`
- Token Bearer en:
  - `GET /api/public/auth/me`
  - `PATCH /api/public/auth/me`
  - `GET /api/public/invoices`
  - `GET /api/public/redemptions`
  - `POST /api/public/redemptions`
- Catalogo: `GET /api/public/catalog` con refresco cada 20s y al recuperar foco.
