# Guía de Desarrollo

Este documento explica cómo configurar el entorno de desarrollo, ejecutar la aplicación localmente, usar HTTPS, el mock API, linting, formateo y seguridad.

---

## 1. Requisitos

- **Node.js:** 18+ (recomendado 20+).
- **npm:** 6.13.4+ (recomendado 10+).
- **Git** para control de versiones.
- **Certificados SSL** (opcional, para desarrollo con HTTPS).

---

## 2. Instalación

### Clonar el repositorio

```bash
git clone <url-del-repositorio>
cd DashboardLogs
```

### Instalar dependencias

```bash
npm install
```

Este comando también ejecuta `quasar prepare` como postinstall.

---

## 3. Configuración de variables de entorno

El proyecto usa un sistema centralizado de variables de entorno. Consulta [`docs/CONFIGURACION_AMBIENTE.md`](CONFIGURACION_AMBIENTE.md) para más detalles.

### Archivos de entorno

| Archivo | Uso |
|---------|-----|
| `.env` | Variables comunes a todos los ambientes. |
| `.env.development` | Variables de desarrollo. |
| `.env.production` | Variables de producción. |
| `.env.local` | Overrides locales (NO se suben a git). |
| `.env.development.local` | Overrides de desarrollo local. |

### Configuración rápida

Copia el ejemplo y ajusta las URLs:

```bash
cp .env.example .env.local
```

Edita `.env.local`:

```env
API_BASE_URL=http://localhost:8080/api
WS_BASE_URL=ws://localhost:8080/ws
DEBUG_MODE=true
```

> **IMPORTANTE:** nunca subas `.env.local` ni archivos con credenciales a git.

### Variables disponibles

| Variable | Descripción | Ejemplo |
|----------|-------------|---------|
| `API_BASE_URL` | URL base de la API backend. | `http://187.188.66.56:8040/api` |
| `WS_BASE_URL` | URL base del WebSocket. | `ws://187.188.66.56:8040/ws` |
| `SOCKET_TOPIC` | Tópico STOMP para QR login. | `/topic/qr-login` |
| `APP_NAME` | Nombre de la app. | `Dashboard Logs Santoro` |
| `APP_VERSION` | Versión de la app. | `1.0.0` |
| `API_TIMEOUT` | Timeout de peticiones HTTP (ms). | `30000` |
| `DEBUG_MODE` | Habilita logs de debug. | `true` / `false` |
| `NODE_ENV` | Ambiente de ejecución. | `development` / `production` |

### Punto de acceso central

Todas las variables se deben importar desde `src/config/env.js`:

```javascript
import { API_BASE_URL, WS_BASE_URL, isDebug } from 'src/config/env'
```

Nunca uses `process.env` directamente en código fuente.

---

## 4. Ejecutar en desarrollo

### Modo estándar

```bash
npm run dev
```

Levanta el servidor en `http://localhost:9000`.

### Modo HTTPS (recomendado)

Si tienes los certificados SSL de cPanel en `certs/cpanel/`, `quasar.config.js` configurará automáticamente HTTPS en `https://prueba.grupo-santoro.com.mx:9000`.

Para configurar el archivo hosts en Windows, ejecuta como administrador:

```powershell
.\configurar-hosts.ps1
```

O manualmente agrega a `C:\Windows\System32\drivers\etc\hosts`:

```
127.0.0.1    prueba.grupo-santoro.com.mx
```

Luego:

```bash
npm run dev
```

Accede a:

```
https://prueba.grupo-santoro.com.mx:9000
```

Guía completa en [`HTTPS_SETUP_GUIDE.md`](../HTTPS_SETUP_GUIDE.md).

---

## 5. Proxy del servidor de desarrollo

`quasar.config.js` configura un proxy para rediruir peticiones al backend:

| Ruta local | Destino |
|------------|---------|
| `/api/*` | `http://187.188.66.56:8040` (desarrollo) |
| `/ws/*` | `ws://187.188.66.56:8040` |
| `/filters/*` | `http://localhost:3001` (mock API) |

Puedes cambiar estos destinos editando `quasar.config.js` o usando variables de entorno.

---

## 6. Mock API

El directorio `mock-api/` contiene un servidor Express para desarrollo local.

### Instalación

```bash
cd mock-api
npm install
```

### Ejecutar mock API

```bash
npm run mock-api
# o
node mock-api/server.js
```

Por defecto corre en `http://localhost:3001`.

### Endpoints del mock

| Endpoint | Descripción |
|----------|-------------|
| `GET /filters/config?system=...` | Configuración de filtros (proxy al backend real). |
| `GET /health` | Estado del mock API. |

### Variables del mock API

| Variable | Descripción |
|----------|-------------|
| `PORT` | Puerto del servidor (default 3001). |
| `BACKEND_URL` | URL del backend real. |
| `PAGE_SIZE` | Tamaño de página. |
| `MAX_ITEMS` | Máximo de items. |
| `THROTTLE_MS` | Throttling. |

---

## 7. Scripts de npm

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo. |
| `npm run build` | Compila para producción (output en `dist/spa`). |
| `npm run build:prod` | Alias de `build`. |
| `npm run start` | Alias de `dev`. |
| `npm run lint` | Ejecuta ESLint sobre archivos JS/Vue. |
| `npm run format` | Formatea código con Prettier. |
| `npm run security:scan-secrets` | Escanea secretos en el código. |
| `npm run test` | Placeholder (sin tests configurados). |
| `npm run postinstall` | Ejecuta `quasar prepare`. |

---

## 8. Linting y formateo

### ESLint

Configuración en `eslint.config.js` (flat config):

- Reglas de Quasar.
- Reglas de Vue.
- Prettier integrado.

```bash
npm run lint
```

### Prettier

Configuración en `.prettierrc.json`:

- Sin punto y coma.
- Comillas simples.
- Ancho de línea: 100.

```bash
npm run format
```

### Vite plugin checker

Durante `quasar dev`, `vite-plugin-checker` ejecuta ESLint automáticamente y muestra errores en el navegador.

---

## 9. Seguridad

### Escaneo de secretos

Antes de subir cambios, ejecuta:

```bash
npm run security:scan-secrets
```

El script `scripts/scan-secrets.mjs` detecta:

- Llaves privadas (`-----BEGIN PRIVATE KEY-----`).
- Asignaciones de secretos, API keys, tokens, passwords.
- Tokens Bearer.
- JWTs.

### Certificados

- Los certificados SSL deben estar en `certs/cpanel/` y están en `.gitignore`.
- Nunca subas llaves privadas, certificados ni bundles.

### Cookies

- La cookie `jwt_token` se configura con `SameSite=Strict`.
- Tokens de acceso y refresh se almacenan en localStorage/sessionStorage según preferencia del usuario.

---

## 10. Estructura recomendada para nuevos desarrolladores

1. **Configura el entorno:**
   - Copia `.env.example` a `.env.local`.
   - Ajusta `API_BASE_URL` y `WS_BASE_URL`.

2. **Instala dependencias:**
   - `npm install`.

3. **Configura HTTPS (opcional):**
   - Coloca certificados en `certs/cpanel/`.
   - Ejecuta `configurar-hosts.ps1` como admin.

4. **Levanta el mock API (si lo necesitas):**
   - `npm run mock-api`.

5. **Inicia la app:**
   - `npm run dev`.

6. **Antes de commitear:**
   - `npm run lint`
   - `npm run format`
   - `npm run security:scan-secrets`

---

## 11. Depuración

### Logs de debug

Si `DEBUG_MODE=true` o estás en desarrollo, `src/config/env.js` imprime en consola:

```
🔧 Configuración del Ambiente
Ambiente: development
API Base URL: ...
WebSocket URL: ...
Debug Mode: true
```

### Proxy logs

El proxy de desarrollo imprime cada petición y respuesta:

```
🔄 Proxy request: GET /api/logs/events -> ...
✅ Proxy response: 200 /api/logs/events
```

### WebSocket logs

STOMP imprime mensajes de debug en consola cuando `isDebug` es true.

---

## 12. Solución de problemas comunes

### Error de certificado inválido

- Limpia caché del navegador (`Ctrl + Shift + Delete`).
- Verifica que el archivo hosts tenga la entrada correcta.
- Ejecuta `ipconfig /flushdns` en PowerShell admin.

### `ERR_CONNECTION_REFUSED`

- Verifica que `quasar dev` esté corriendo.
- Verifica que el puerto 9000 esté libre.

### Variables de entorno no se aplican

- Reinicia el servidor de desarrollo.
- Verifica que estés importando desde `src/config/env.js`.
- Revisa que el archivo `.env.local` exista y tenga el formato correcto.

### WebSocket no conecta

- Verifica `WS_BASE_URL`.
- Verifica que el proxy `/ws` en `quasar.config.js` apunte al backend correcto.
- Revisa la consola del navegador por errores STOMP.

---

## 13. Extensiones recomendadas de VS Code

Configuradas en `.vscode/settings.json` y `.vscode/extensions.json`:

- ESLint.
- Prettier.
- Vue Language Features (Volar).

---

## 14. Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `quasar.config.js` | Configuración de Quasar, build, devServer, proxy, env. |
| `src/config/env.js` | Punto de acceso a variables de entorno. |
| `.env.example` | Plantilla de variables. |
| `.env.development` | Variables de desarrollo. |
| `.env.production` | Variables de producción. |
| `mock-api/server.js` | Servidor mock local. |
| `scripts/scan-secrets.mjs` | Escaneo de secretos. |
| `eslint.config.js` | Configuración de ESLint. |
| `.prettierrc.json` | Configuración de Prettier. |
| `HTTPS_SETUP_GUIDE.md` | Guía de configuración HTTPS. |
| `configurar-hosts.ps1` | Script para configurar archivo hosts. |

---

## 15. Referencias

- [README.md](../README.md)
- [ARCHITECTURE.md](ARCHITECTURE.md)
- [CONFIGURACION_AMBIENTE.md](CONFIGURACION_AMBIENTE.md)
- [HTTPS_SETUP_GUIDE.md](../HTTPS_SETUP_GUIDE.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
