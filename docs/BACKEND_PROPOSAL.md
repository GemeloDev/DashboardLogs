# Propuesta de Backend en Node.js (Idea de desarrollo)

> ⚠️ **ADVERTENCIA:** Este documento es una **idea de desarrollo** y **NO representa funcionalidad oficial** del Dashboard Logs Santoro. El sistema actual utiliza un backend independiente desarrollado en otro stack. Este documento puede servir como referencia para un futuro backend en Node.js o para entender qué espera el frontend.

---

## 1. Objetivo

Describir una posible arquitectura de backend en **Node.js** que exponga la misma API REST + WebSocket que el frontend consume actualmente. Esto facilitaría:

- Desarrollo local sin depender del backend real.
- Pruebas de integración controladas.
- Prototipado rápido de nuevas funcionalidades.

---

## 2. Alcance propuesto

El backend propuesto cubriría los módulos que el frontend ya consume:

1. **Autenticación** (JWT, refresh, QR login, invitaciones).
2. **Usuarios y organizaciones** (CRUD, roles, permisos).
3. **Logs y dashboard** (estadísticas, series, métricas HTTP, geo, dispositivos).
4. **API keys** (gestión y alertas).
5. **Eva AI** (streaming de respuestas, alertas, insights, métricas).
6. **WebSocket STOMP** (logs en tiempo real, notificaciones, QR login).

---

## 3. Stack tecnológico propuesto

| Capa | Tecnología |
|------|------------|
| Framework | Express.js / Fastify |
| WebSocket | `@stomp/stompjs` + WebSocket (o `ws` + `stomp-broker-js`) |
| Autenticación | jsonwebtoken + bcrypt |
| Base de datos | MongoDB / PostgreSQL (según preferencia) |
| ODM/ORM | Mongoose (MongoDB) o Prisma (PostgreSQL) |
| Caché | Redis para sesiones y tópicos STOMP |
| Colas | BullMQ o RabbitMQ para procesamiento de logs |
| IA | Integración con OpenAI/LLM propio vía streaming |
| Configuración | dotenv + zod para validación |
| Linting | ESLint + Prettier |

---

## 4. Estructura de directorios propuesta

```
backend-node/
├── src/
│   ├── config/             # Variables de entorno y conexiones
│   ├── modules/
│   │   ├── auth/           # Login, refresh, QR, invitaciones
│   │   ├── users/          # Gestión de usuarios
│   │   ├── organizations/  # Organizaciones (empresas)
│   │   ├── logs/           # Logs, dashboard, filtros
│   │   ├── devices/        # Dispositivos
│   │   ├── api-keys/       # API keys
│   │   └── ai/             # Eva AI
│   ├── websocket/          # Servidor STOMP
│   ├── common/             # Middlewares, utilidades, interceptores
│   └── index.js            # Punto de entrada
├── tests/
├── scripts/
├── .env.example
├── package.json
└── README.md
```

---

## 5. API REST propuesta

### 5.1 Autenticación

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login con email/password. |
| POST | `/api/auth/logout` | Logout. |
| POST | `/api/auth/register` | Registro de usuario. |
| POST | `/api/auth/verify` | Verificar token. |
| POST | `/api/auth/refresh` | Refresh token. |
| POST | `/api/auth/forgot-password` | Solicitar recuperación. |
| POST | `/api/auth/reset-password` | Restablecer contraseña. |
| POST | `/api/auth/change-password` | Cambiar contraseña. |
| POST | `/api/auth/accept-invite` | Aceptar invitación. |
| POST | `/api/auth/qr-login` | Login por QR. |
| GET/POST | `/api/auth/qr-token` | Token QR. |

### 5.2 Core

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| CRUD | `/api/core/users` | Usuarios. |
| GET | `/api/config` | Configuración global. |

### 5.3 Admin

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| CRUD | `/api/admin/invites` | Invitaciones. |

### 5.4 Logs y dashboard

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/logs/events/all` | Todos los eventos. |
| GET | `/api/logs/events` | Eventos raw. |
| GET | `/api/logs/timeline` | Timeline por sesión. |
| GET | `/api/logs/dashboard/stats` | Estadísticas. |
| GET | `/api/logs/dashboard/series` | Series temporales. |
| GET | `/api/logs/dashboard/http` | Métricas HTTP. |
| GET | `/api/logs/dashboard/geo` | Datos geográficos. |
| GET | `/api/logs/dashboard/systems-health` | Salud de sistemas. |
| GET | `/api/filters/config` | Configuración de filtros. |

### 5.5 Dispositivos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/devices` | Resumen de dispositivos. |

### 5.6 Catálogos

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| CRUD | `/api/catalogs/api-keys` | API keys. |

### 5.7 Panel Santoro

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/santoro/panel/stats` | Estadísticas admin. |
| CRUD | `/api/santoro/panel/organizations` | Organizaciones. |
| CRUD | `/api/santoro/panel/users` | Usuarios admin. |
| CRUD | `/api/santoro/panel/api-keys` | API keys admin. |
| PUT | `/api/santoro/panel/organizations/:id/api-keys/:key/status` | Cambiar status de API key. |

### 5.8 Eva AI

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| SSE | `/api/ai/eva/stream` | Streaming de respuestas. |
| GET | `/api/ai/llm/assist/manager/daily/pretty` | Resumen diario. |
| GET | `/api/ai/alerts` | Alertas. |
| GET | `/api/ai/alerts/:id/explain/operator` | Explicar alerta. |
| GET | `/api/ai/alerts/:id/ticket/draft` | Borrador de ticket. |
| GET | `/api/ai/metrics/series` | Métricas para gráficas. |
| GET | `/api/ai/summaries/hourly/insights` | Insights por hora. |
| GET | `/api/ai/catalogs/systems` | Sistemas disponibles. |

---

## 6. Modelos de datos propuestos

### 6.1 Usuario

```javascript
{
  id: ObjectId,
  name: String,
  email: String,
  passwordHash: String,
  tenantId: ObjectId,
  roles: ['ORG_ADMIN', 'ORG_OWNER'],
  permissions: ['users:read', 'logs:read'],
  systems: ['CITA_GUYANA'],
  mustChangePassword: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### 6.2 Organización

```javascript
{
  id: ObjectId,
  name: String,
  slug: String,
  status: 'ACTIVE' | 'INACTIVE',
  createdAt: Date
}
```

### 6.3 Log

Ver [`docs/PROPUESTA_SCHEMA_LOGS_BACKEND.md`](PROPUESTA_SCHEMA_LOGS_BACKEND.md) para el schema estándar propuesto.

### 6.4 API Key

```javascript
{
  id: ObjectId,
  organizationId: ObjectId,
  name: String,
  keyHash: String,
  status: 'ACTIVE' | 'REVOKED',
  expiresAt: Date,
  createdAt: Date
}
```

### 6.5 Sesión

```javascript
{
  id: ObjectId,
  userId: ObjectId,
  accessTokenJti: String,
  refreshTokenJti: String,
  caseId: String,
  ip: String,
  userAgent: String,
  createdAt: Date,
  expiresAt: Date
}
```

---

## 7. WebSocket STOMP propuesto

### Tópicos

| Tópico | Uso |
|--------|-----|
| `/topic/qr-login` | Confirmación de login por QR. |
| `/topic/alerts/:tenantId` | Alertas críticas. |
| `/topic/dashboard/:tenantId/:system` | Nuevos logs para dashboard. |
| `/topic/notifications` | Notificaciones generales. |

### Ejemplo: QR login

```
1. Cliente web genera QR con un token temporal.
2. Cliente móvil envía POST /api/auth/qr-login { qrToken }.
3. Backend valida el token y publica en /topic/qr-login:
   {
     "accessToken": "...",
     "refreshToken": "...",
     "user": { ... }
   }
4. Cliente web recibe el mensaje y establece sesión.
```

### Ejemplo: nuevos logs

```
1. Backend recibe un nuevo log.
2. Backend publica en /topic/dashboard/{tenantId}/{system}:
   {
     "type": "NEW_LOGS",
     "count": 1
   }
3. Cliente web recibe el mensaje y refresca dashboard.
```

---

## 8. Autenticación y autorización propuesta

### JWT

- **Access token:** corta duración (15 min), contiene `sub`, `tenantId`, `caseId`, `roles`, `permissions`, `systems`.
- **Refresh token:** larga duración (7 días), almacenado en cookie `HttpOnly` o en sesión segura.

### Middleware

```javascript
function authenticate(req, res, next) {
  const token = req.headers.authorization?.replace('Bearer ', '')
  if (!token) return res.status(401).json({ ok: false, message: 'No autorizado' })
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET)
    next()
  } catch {
    return res.status(401).json({ ok: false, message: 'Token inválido' })
  }
}

function requirePermission(permission) {
  return (req, res, next) => {
    if (!req.user?.permissions?.includes(permission)) {
      return res.status(403).json({ ok: false, message: 'Permisos insuficientes' })
    }
    next()
  }
}
```

---

## 9. Eva AI propuesta

### Arquitectura

```
Pregunta del usuario
        │
        ▼
Intent classifier (regex + LLM)
        │
        ▼
Query builder (sistema, rango, granularidad)
        │
        ▼
Consulta a base de datos / logs
        │
        ▼
LLM para generar respuesta
        │
        ▼
Streaming SSE → frontend
```

### Endpoints de integración

| Endpoint | Implementación |
|----------|----------------|
| `/api/ai/eva/stream` | Abrir conexión SSE, recibir `message`, `system`, `days`, `hours`, `granularity`, generar chunks. |
| `/api/ai/llm/assist/manager/daily/pretty` | Consultar stats del día y formatear narrativa. |
| `/api/ai/alerts` | Listar alertas abiertas. |
| `/api/ai/alerts/:id/explain/operator` | Explicar alerta en lenguaje natural. |
| `/api/ai/alerts/:id/ticket/draft` | Generar borrador de ticket. |

---

## 10. Variables de entorno propuestas

```env
PORT=8080
NODE_ENV=development

# Base de datos
DATABASE_URL=mongodb://localhost:27017/dashboard_logs
REDIS_URL=redis://localhost:6379

# JWT
JWT_SECRET=super_secret_cambiar_en_produccion
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Frontend
FRONTEND_URL=https://dashboard.grupo-santoro.com.mx

# AI
LLM_API_KEY=...
LLM_MODEL=gpt-4o-mini
```

---

## 11. Consideraciones de seguridad

- Hash de contraseñas con bcrypt.
- Tokens JWT con duración corta y refresh rotation.
- Validación de `X-Tenant` contra el tenant del usuario.
- Rate limiting en endpoints de auth.
- CORS configurado solo para el dominio del frontend.
- WebSocket con autenticación por token de acceso.
- No exponer logs con datos sensibles (contraseñas, tokens, información personal).

---

## 12. Próximos pasos (si se decide implementar)

1. Definir si se usará MongoDB o PostgreSQL.
2. Crear modelo de datos basado en [`PROPUESTA_SCHEMA_LOGS_BACKEND.md`](PROPUESTA_SCHEMA_LOGS_BACKEND.md).
3. Implementar módulo de autenticación.
4. Implementar endpoints de logs y dashboard.
5. Implementar WebSocket STOMP.
6. Integrar LLM para Eva AI.
7. Crear tests de integración.
8. Dockerizar y agregar CI/CD.

---

## 13. Conclusión

Esta propuesta es un **punto de partida técnico**. No reemplaza al backend actual y no está priorizada para desarrollo. Sirve para:

- Documentar el contrato esperado por el frontend.
- Facilitar mocks y desarrollo local.
- Planificar una eventual migración o backend alternativo.

---

## 14. Referencias

- [README.md](../README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [PROPUESTA_SCHEMA_LOGS_BACKEND.md](PROPUESTA_SCHEMA_LOGS_BACKEND.md)
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
- [EVA_AI.md](EVA_AI.md)
