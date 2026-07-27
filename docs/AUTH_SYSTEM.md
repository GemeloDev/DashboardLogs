# Sistema de Autenticación y Autorización

Este documento describe el sistema de autenticación y autorización del **Dashboard Logs Santoro**: flujo JWT, roles, permisos, login por QR, invitaciones, control de rutas y directivas de permisos.

---

## 1. Visión general

El sistema utiliza autenticación basada en **JSON Web Tokens (JWT)**:

- **Access Token:** se usa en cada petición HTTP (header `Authorization: Bearer <token>`).
- **Refresh Token:** se usa para obtener un nuevo access token cuando este expira.
- **Persistencia de sesión:** se almacena en `localStorage` (recordar sesión) o `sessionStorage` (sesión temporal).
- **Cookie auxiliar:** el access token también se guarda en cookie (`jwt_token`) para compatibilidad con interceptores de Axios.
- **Header X-Tenant:** se inyecta automáticamente en cada petición si el usuario tiene `tenantId`.

---

## 2. Flujo de autenticación

### 2.1 Login con email y contraseña

```
Usuario ingresa credenciales
        │
        ▼
LoginPage.vue → authService.login(credentials, mantenerSesion)
        │
        ▼
POST /auth/login
        │
        ▼
Backend responde con user + authz + tokens
        │
        ▼
authService.login():
  - Guarda accessToken en cookie
  - Escribe sesión en localStorage/sessionStorage
  - Determina flujo permitido (client/santoro)
  - Limpia estado compartido del dashboard
        │
        ▼
Router redirige a /client/escritorio o /santoro/inicio
```

### 2.2 Renovación de tokens (refresh)

El interceptor de respuestas en `src/services/axiosConfig.js` maneja automáticamente el `401 Unauthorized`:

```
Petición HTTP → 401
        │
        ▼
Interceptor detecta 401 y no es /auth/refresh-token
        │
        ▼
POST /auth/refresh-token { refreshToken }
        │
        ▼
authStore.setTokens(newAccessToken, newRefreshToken)
        │
        ▼
Reintentar petición original con nuevo token
```

#### Cola de peticiones fallidas

Si múltiples peticiones fallan simultáneamente con 401 mientras se refresca el token, se encolan y se reintentan una vez obtenido el nuevo access token. Esto evita condiciones de carrera y múltiples refresh.

### 2.3 Logout

- Elimina sesión de `localStorage` y `sessionStorage`.
- Elimina cookie `jwt_token`.
- Limpia estado compartido del dashboard.
- Elimina header `Authorization` de Axios.
- Redirige a `/login`.

---

## 3. Persistencia de sesión

### `src/services/sessionStorage.js`

| Función | Descripción |
|---------|-------------|
| `readSession()` | Lee sesión de localStorage o sessionStorage. |
| `writeSession(data, persistent)` | Escribe sesión en localStorage (`persistent=true`) o sessionStorage. |
| `clearStoredSession()` | Elimina sesión de ambos storages. |
| `buildSessionData(...)` | Construye objeto de sesión con user, tokens y metadata. |
| `updateStoredTokens(...)` | Actualiza solo los tokens en la sesión existente. |
| `getStoredUser()` | Devuelve usuario almacenado. |

### Estructura de la sesión

```json
{
  "user": { "id", "name", "email", "authz", "organization", ... },
  "token": {
    "accessToken": "...",
    "refreshToken": "..."
  },
  "isAuthenticated": true,
  "sessionType": "persistent",
  "timestamp": 1783000000000
}
```

### `src/services/cookieService.js`

Gestión de la cookie `jwt_token`:

- `storeJWTInCookie(token, expirationDays)`
- `getJWTFromCookie()`
- `getJWTData(token)` — decodifica el JWT.
- `deleteJWTFromCookie()`
- `hasJWTInCookie()`

La cookie se configura con `SameSite=Strict` para mayor seguridad.

---

## 4. Roles y permisos

### 4.1 Modelo de autorización

El backend devuelve en el login un objeto `authz`:

```json
{
  "authz": {
    "permissions": ["users:read", "users:write", "logs:read", ...],
    "roles": ["ORG_OWNER", "ORG_ADMIN"],
    "systems": ["CITA_GUYANA", "DASHBOARD"]
  }
}
```

### 4.2 Roles reconocidos

| Rol | Descripción |
|-----|-------------|
| `ORG_OWNER` | Propietario de la organización. Tiene acceso total. |
| `ORG_ADMIN` | Administrador de la organización. |

### 4.3 Flujos de usuario

| Flujo | Criterio | Rutas |
|-------|----------|-------|
| `client` | Cualquier usuario autenticado. | `/client/*` |
| `santoro` | Usuario con email `@grupo-santoro.com.mx`. | `/santoro/*` |

> La determinación del flujo `santoro` se hace por dominio de correo electrónico (`@grupo-santoro.com.mx`), no solo por rol.

---

## 5. Control de acceso

### 5.1 Guards del router (`src/router/index.js`)

| Meta | Comportamiento |
|------|----------------|
| `requiresAuth: true` | Redirige a `/login` si no está autenticado. |
| `flow: 'santoro'` | Bloquea si el usuario no es del dominio Santoro; redirige a escritorio cliente. |
| `requiresAdmin: true` | Requiere rol `ORG_ADMIN`/`ORG_OWNER` o flujo `santoro`. |
| `hideLayout: true` | Páginas públicas sin layout principal. |

### Lógica de redirección

- Si un usuario autenticado intenta acceder a `/login`, se redirige a su ruta por defecto.
- Si accede a `/` o `/dashboard` o `/logs`, se redirige a la ruta por defecto según su flujo.
- Si accede a una ruta `santoro` sin ser del dominio Santoro, se redirige a `/client/escritorio`.

### 5.2 Directiva `v-can`

Ubicada en `src/directives/can.js`, registrada en `src/boot/pinia.js`.

Permite ocultar elementos del DOM según permisos/roles.

```vue
<!-- Permiso único -->
<q-btn v-can="'users:write'">Crear usuario</q-btn>

<!-- Todos los permisos -->
<q-btn v-can="['users:write', 'logs:read']">Administrar</q-btn>

<!-- Objeto de control fino -->
<q-btn v-can="{ any: ['users:read', 'logs:read'], rolesAny: ['ORG_ADMIN'] }">
  Ver panel
</q-btn>
```

### 5.3 API `authService.can()`

Disponible en `src/services/authService.js`:

| Forma de uso | Resultado |
|--------------|-----------|
| `authService.can('permiso')` | Verifica permiso único. |
| `authService.can(['p1', 'p2'])` | Requiere TODOS los permisos. |
| `authService.can({ any: [...] })` | Requiere AL MENOS UN permiso. |
| `authService.can({ all: [...] })` | Requiere TODOS los permisos. |
| `authService.can({ rolesAny: [...] })` | Requiere AL MENOS UN rol. |
| `authService.can({ rolesAll: [...] })` | Requiere TODOS los roles. |
| Combinado | `any && all && rolesAny && rolesAll` |

---

## 6. Login por QR

El sistema permite iniciar sesión escaneando un código QR con un dispositivo móvil.

### Flujo

```
1. Cliente web genera QR con qrService.js
2. Usuario escanea QR con app móvil / QRScannerModal.vue
3. App móvil envía qrToken al backend
4. Backend publica confirmación por WebSocket (/topic/qr-login)
5. Cliente web recibe mensaje y llama a authService.loginByQR(qrToken)
6. authService.loginByQR() POST /auth/qr-login
7. Se establece sesión y redirige al dashboard
```

### Servicios relacionados

- `src/services/qrService.js` — generación y descarga de códigos QR.
- `src/services/qrScannerService.js` — lectura de QR desde cámara o imagen.
- `src/services/socketService.js` — conexión STOMP para recibir confirmación.
- `src/components/QRScannerModal.vue` — modal de escaneo.

---

## 7. Sistema de invitaciones

### Flujo

```
Admin/Owner → EnviarInvitacionModal.vue
        │
        ▼
invitationsService.sendInvitation(inviteData)
        │
        ▼
POST /admin/invites
        │
        ▼
Backend genera token de invitación
        │
        ▼
invitationsService.getInvitationLink(token) genera:
  https://dashboard.grupo-santoro.com.mx/#/accept-invitation?token=...
        │
        ▼
Usuario invitado accede al link
        │
        ▼
AcceptInvitation.vue + acceptInviteService
        │
        ▼
POST /auth/accept-invite
```

### Datos de invitación

```javascript
{
  email: 'nuevo@empresa.com',
  roles: ['ORG_ADMIN'],
  ttlHours: 48,
  logFilters: { system: 'CITA_GUYANA' }
}
```

### Validación

`validateInvitationData` verifica:

- Email válido.
- Al menos un rol.
- `ttlHours` mayor o igual a 1.

---

## 8. Recuperación de contraseña

### Flujo

1. Usuario ingresa email en `PasswordOlvidadoPage.vue`.
2. `authService.forgotPassword(email)` → `POST /auth/forgot-password`.
3. Backend envía código de recuperación.
4. Usuario ingresa código y nueva contraseña en `ResetPasswordPage.vue`.
5. `authService.resetPassword({ email, code, newPassword })` → `POST /auth/reset-password`.

### Cambio de contraseña temporal

Si `mustChangePassword` es `true` al iniciar sesión, el usuario es redirigido a `ChangeTempPassword.vue` para actualizar su contraseña antes de acceder al dashboard.

---

## 9. Preferencias de flujo

### `dashboardFlow` en localStorage

```json
{
  "flow": "client" | "santoro",
  "system": "DASHBOARD"
}
```

- Se guarda al iniciar sesión.
- Se usa para recordar el flujo seleccionado.
- Se sanitiza con `authService.sanitizeFlow()` para evitar que un usuario no-Santoro acceda al flujo `santoro`.

### Funciones utilitarias

| Función | Descripción |
|---------|-------------|
| `loadPrefs()` | Carga preferencias de flujo. |
| `savePrefs(flow, system)` | Guarda preferencias de flujo. |
| `getCurrentFlow()` | Devuelve flujo actual sanitizado. |
| `isSantoroEmail(email)` | Verifica dominio `@grupo-santoro.com.mx`. |
| `canAccessSantoroFlow(user)` | Determina si puede acceder a flujo Santoro. |
| `getAllowedFlow(user)` | Devuelve `'santoro'` o `'client'`. |

---

## 10. Seguridad

- **SameSite=Strict** en cookie JWT.
- **Refresh token queue** para evitar race conditions.
- **X-Tenant** inyectado automáticamente para multi-tenencia.
- **RBAC** a nivel de rutas y elementos UI.
- **Tokens nunca persistidos en stores** de forma explícita a largo plazo; se usan en memoria y session/localStorage según preferencia.
- **Logout limpio** elimina todos los rastros de sesión en cliente.

---

## 11. Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/services/authService.js` | Lógica principal de autenticación, permisos y flujos. |
| `src/services/axiosConfig.js` | Interceptores de Axios, refresh automático. |
| `src/services/sessionStorage.js` | Persistencia de sesión. |
| `src/services/cookieService.js` | Gestión de cookie JWT. |
| `src/stores/auth.js` | Estado global de autenticación. |
| `src/router/index.js` | Guards de autenticación y autorización. |
| `src/directives/can.js` | Directiva `v-can`. |
| `src/services/invitationsService.js` | Envío de invitaciones. |
| `src/services/acceptInviteService.js` | Aceptación de invitaciones. |
| `src/services/qrService.js` | Generación de QR. |
| `src/services/qrScannerService.js` | Escaneo de QR. |
| `src/services/socketService.js` | WebSocket para QR login. |

---

## 12. Referencias

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [FRONTEND.md](FRONTEND.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
