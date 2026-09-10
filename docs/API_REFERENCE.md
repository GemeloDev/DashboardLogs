# Referencia de API

Este documento lista los endpoints REST, WebSocket y los helpers utilizados por el frontend para comunicarse con el backend. Todos los endpoints se definen en `src/services/endpoints.js` y se construyen a partir de la URL base configurada en `src/config/env.js`.

> **Nota:** este documento describe el **consumo de API desde el frontend**. El backend es un servicio independiente; no forma parte de este repositorio.

---

## 1. Configuración base

### `BASE_URL`

```javascript
import { BASE_URL } from 'src/services/endpoints'
// https://api-logs.grupo-santoro.com.mx/api (producción)
// http://localhost:8080/api (desarrollo)
```

### `REQUEST_CONFIG`

Configuración por defecto de Axios:

```javascript
{
  timeout: 30000,               // API_TIMEOUT
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json'
  }
}
```

### Helpers

| Helper | Descripción | Ejemplo |
|--------|-------------|---------|
| `buildApiConfig({ token, withCredentials })` | Construye config de Axios incluyendo Bearer token. | `buildApiConfig({ token: 'abc123' })` |
| `buildUrl(base, params)` | Construye URL con query params omitiendo nulos/vacíos. | `buildUrl('/logs', { type: 'ERROR', page: null })` |
| `url.api(path)` | Prefijo `/api`. | `url.api('/users')` |
| `url.auth(path)` | Prefijo `/api/auth`. | `url.auth('/login')` |
| `url.core(path)` | Prefijo `/api/core`. | `url.core('/users')` |
| `url.admin(path)` | Prefijo `/api/admin`. | `url.admin('/invites')` |
| `url.ai(path)` | Prefijo `/api/ai`. | `url.ai('/eva/stream')` |

---

## 2. Autenticación

Base: `BASE_URL + /auth`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/auth/login` | `AUTH.LOGIN` | POST | Iniciar sesión con email y contraseña. |
| `/auth/logout` | `AUTH.LOGOUT` | POST | Cerrar sesión. |
| `/auth/register` | `AUTH.REGISTER` | POST | Registro de nuevo usuario. |
| `/auth/verify` | `AUTH.VERIFY_TOKEN` | POST | Verificar token de acceso. |
| `/auth/refresh` | `AUTH.REFRESH_TOKEN` | POST | Refrescar token de acceso. |
| `/auth/forgot-password` | `AUTH.FORGOT_PASSWORD` | POST | Solicitar recuperación de contraseña. |
| `/auth/reset-password` | `AUTH.RESET_PASSWORD` | POST | Restablecer contraseña con token. |
| `/auth/change-password` | `AUTH.CHANGE_PASSWORD` | POST | Cambiar contraseña autenticado. |
| `/auth/accept-invite` | `AUTH.ACCEPT_INVITE` | POST | Aceptar invitación y establecer contraseña. |
| `/auth/qr-login` | `AUTH.LOGIN_QR` | POST | Generar sesión de login por QR. |
| `/auth/qr-token` | `AUTH.QR_TOKEN` | GET/POST | Obtener/validar token QR. |

### Ejemplo: login

```javascript
import { AUTH } from 'src/services/endpoints'
import axios from 'axios'

const response = await axios.post(AUTH.LOGIN, {
  email: 'usuario@empresa.com',
  password: '********'
})
```

---

## 3. Core

Base: `BASE_URL + /core`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/core/users` | `CORE.USERS` | CRUD | Gestión de usuarios. |
| `/config` | `CORE.CONFIG` | GET | Configuración global de la app. |

---

## 4. Administración

Base: `BASE_URL + /admin`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/admin/invites` | `ADMIN.INVITES` | CRUD | Gestión de invitaciones de usuarios. |

---

## 5. Logs

Base: `BASE_URL`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/logs/events/all` | `LOGS.EVENTS` | GET | Todos los eventos de log. |
| `/logs/events` | `LOGS.EVENTS_RAW` | GET | Eventos de log (raw). |
| `/logs/timeline` | `LOGS.TIMELINE` | GET | Timeline de eventos por sesión. |
| `/logs/dashboard/stats` | `LOGS.STATS` | GET | Estadísticas generales del dashboard. |
| `/filters/config` | `LOGS.FILTERS_CONFIG` | GET | Configuración de filtros disponibles. |

### Uso de filtros

```javascript
import { LOGS } from 'src/services/endpoints'
import { buildUrl } from 'src/services/endpoints'

const url = buildUrl(LOGS.EVENTS, {
  system: 'CITA_GUYANA',
  severity: 'ERROR',
  from: '2026-07-01T00:00:00Z',
  to: '2026-07-24T23:59:59Z'
})
```

---

## 6. Dashboard

Base: `BASE_URL + /logs/dashboard`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/logs/dashboard/stats` | `DASHBOARD.STATS` | GET | Estadísticas del dashboard. |
| `/logs/dashboard/series` | `DASHBOARD.SERIES` | GET | Series temporales. |
| `/logs/dashboard/http` | `DASHBOARD.HTTP` | GET | Métricas HTTP. |
| `/logs/dashboard/geo` | `DASHBOARD.GEO` | GET | Datos geográficos. |

---

## 7. Dispositivos

Base: `BASE_URL`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/devices` | `DEVICES.SUMMARY` | GET | Resumen de dispositivos. |

---

## 8. Catálogos

Base: `BASE_URL`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/catalogs/api-keys` | `CATALOGS.API_KEYS` | CRUD | Catálogo de API keys. |
| `/logs/dashboard/systems-health` | `CATALOGS.HEALT` | GET | Estado de salud de sistemas. |

---

## 9. Panel Santoro (administración interna)

Base: `BASE_URL + /santoro/panel`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/santoro/panel/stats` | `SANTORO.STATS` | GET | Estadísticas del panel admin. |
| `/santoro/panel/organizations` | `SANTORO.EMPRESAS` | CRUD | Gestión de organizaciones. |
| `/santoro/panel/users` | `SANTORO.USUARIOS` | CRUD | Gestión de usuarios (admin). |
| `/santoro/panel/api-keys` | `SANTORO.API_KEYS` | CRUD | Gestión de API keys (admin). |

---

## 10. Eva AI

Base: `BASE_URL + /ai`

| Endpoint | Constante | Método | Descripción |
|----------|-----------|--------|-------------|
| `/ai/eva/stream` | `EVA.STREAM` | SSE | Streaming de respuestas de Eva. |
| `/ai/llm/assist/manager/daily/pretty` | `EVA.DAILY_PRETTY` | GET | Resumen diario formateado. |
| `/ai/alerts` | `EVA.ALERTS` | GET | Listado de alertas. |
| `/ai/metrics/series` | `EVA.METRICS_SERIES` | GET | Métricas para gráficas. |
| `/ai/summaries/hourly/insights` | `EVA.HOURLY_INSIGHTS` | GET | Insights por hora. |
| `/ai/catalogs/systems` | `EVA.CATALOGS_SYSTEMS` | GET | Catálogo de sistemas disponibles. |
| `/ai/alerts/{id}/explain/operator` | `EVA.alertExplain(id)` | GET | Explicación de alerta para operador. |
| `/ai/alerts/{id}/ticket/draft` | `EVA.ticketDraft(id)` | GET | Borrador de ticket para alerta. |

### Ejemplo: streaming de Eva

```javascript
import { EVA } from 'src/services/endpoints'

const eventSource = new EventSource(`${EVA.STREAM}?message=...&system=...`)

eventSource.onmessage = (event) => {
  const chunk = event.data
  // Append chunk to conversation
}
```

---

## 11. WebSocket

### Configuración

| Constante | Descripción |
|-----------|-------------|
| `SOCKET.URL` | URL del WebSocket (si está definida en env). |
| `SOCKET.TOPIC` | Tópico por defecto para QR login: `/topic/qr-login`. |

### Uso típico

El servicio `socketService.js` encapsula STOMP:

```javascript
import socketService from 'src/services/socketService'

// Conectar
socketService.connect()

// Suscribirse a un tópico
socketService.subscribe('/topic/logs', (message) => {
  console.log('Nuevo log:', message.body)
})

// Publicar
socketService.publish('/app/qr-auth', { token: 'abc123' })
```

### Tópicos comunes

| Tópico | Propósito |
|--------|-----------|
| `/topic/qr-login` | Confirmación de login por QR. |
| `/topic/logs` | Nuevos logs en tiempo real. |
| `/topic/notifications` | Notificaciones del sistema. |

---

## 12. Códigos de respuesta y manejo de errores

El frontend centraliza el manejo de errores en `axiosConfig.js`:

- **401 Unauthorized:** intenta refrescar el token automáticamente. Si falla, redirige a login.
- **403 Forbidden:** el usuario no tiene permisos; se ocultan elementos o se muestra mensaje.
- **500+:** se muestra mensaje de error y se loguea en consola (si debug está activo).
- **Errores de red:** se muestra notificación al usuario y se reintentan algunas peticiones críticas.

---

## 13. Versionado y evolución

- Los endpoints actuales no tienen prefijo de versión (`/v1/...`).
- En caso de evolución de la API, se recomienda:
  1. Agregar nuevos endpoints en `endpoints.js`.
  2. Mantener retrocompatibilidad en servicios.
  3. Actualizar esta documentación.

---

## 14. Referencias

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [FRONTEND.md](FRONTEND.md)
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
- [EVA_AI.md](EVA_AI.md)
- [CONFIGURACION_AMBIENTE.md](CONFIGURACION_AMBIENTE.md)
