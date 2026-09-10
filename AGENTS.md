# AGENTS.md — DashboardLogs

Instrucciones compactas para sesiones de OpenCode. Si un dato se deduce fácilmente del nombre de archivo o es convención genérica de Quasar/Vue, no está aquí.

## Comandos esenciales

```bash
# Instalación (ejecuta postinstall -> quasar prepare)
npm install

# Desarrollo
npm run dev              # http(s)://<host>:9000
npm run start            # alias de dev

# Calidad de código
npm run lint             # ESLint flat config
npm run format           # Prettier (sin punto y coma, comillas simples, width 100)
npm run test             # Vitest, happy-dom
npm run test:watch       # Vitest watch
npm run test:coverage    # coverage en coverage/

# Build
npm run build            # output en dist/spa
npm run build:prod       # alias

# Seguridad (ejecutar antes de commitear)
npm run security:scan-secrets
```

## Servidor de desarrollo (quasar.config.js)

- **Router en modo hash** (`vueRouterMode: 'hash`).
- **Boot files:** `pinia`, `i18n` (en ese orden).
- **Puerto:** `9000`, host `0.0.0.0`, `allowedHosts: 'all'`.
- **Proxy `/api`:** redirige a `http://187.188.66.56:8040` (desarrollo).
- **Proxy `/ws`:** no usa el proxy de Vite; hay un plugin personalizado `websocket-origin-proxy` que reescribe el header `Origin` a `http://187.188.66.56:8040` porque el backend rechaza orígenes de desarrollo.
- **Proxy `/filters`:** redirige a `http://localhost:3001` (mock API).
- `vite-plugin-checker` ejecuta ESLint en caliente y muestra errores en el navegador.

### HTTPS local

Si existen los archivos en `certs/cpanel/` (`clave.key`, `cert.crt`, `csb.cabundle`), el dev server levanta HTTPS. En Windows se usa el hostname `prueba.grupo-santoro.com.mx`; configura el archivo hosts con `configurar-hosts.ps1` o manualmente. Guía completa en `HTTPS_SETUP_GUIDE.md`.

## Mock API

El directorio `mock-api/` es un paquete independiente con su propio `package.json`.

```bash
cd mock-api
npm install
npm run dev        # node --watch server.js, puerto 3001
```

> **Nota:** `npm run mock-api` **no existe en el root**. El README/DEVELOPMENT.md lo mencionan, pero el script real está dentro de `mock-api/`.

## Variables de entorno

- Origen de verdad: `src/config/env.js`. **No uses `process.env` directamente** en código fuente.
- Archivos cargados por Quasar según modo: ver `quasar.config.js > build.envFiles`.
- En desarrollo `API_BASE_URL=/api` y `WS_BASE_URL=/ws` (rutas relativas al proxy). En producción se usan las URLs absolutas de `.env.production`.
- `quasar.config.js` re-inyecta ciertas variables en `build.env` y `extendViteConf.define`; no dupliques valores allí.

## Tests

- Corren con **Vitest** + **happy-dom**.
- Configuración en `vitest.config.js`; replica alias de Quasar (`src/`, `components/`, `stores/`, etc.) y fuerza el build cliente de Quasar.
- Helper disponible: `mountWithQuasar` en `tests/setup.js` para montar componentes con Quasar stubbeado.
- Los tests viven en `tests/unit/`, no en `src/`.

## Convenciones de código

- **Prettier:** `.prettierrc.json` — `semi: false`, `singleQuote: true`, `printWidth: 100`.
- **ESLint:** flat config (`eslint.config.js`), reglas de Quasar + Vue esencial + Prettier.
- **Endpoints:** centralizados en `src/services/endpoints.js`; no hardcodear URLs.
- **Servicios:** lógica de API en `src/services/`; usa `axiosInstance` desde `src/services/axiosConfig`.
- **Stores Pinia:** en `src/stores/`.
- **Composición:** preferir `<script setup>`; i18n con `useI18n()`.

## Seguridad

- Ejecuta `npm run security:scan-secrets` antes de subir cambios.
- `scripts/scan-secrets.mjs` escanea repositorio completo (ignora `node_modules`, `dist`, `.quasar`, `certs`). Puede arrojar falsos positivos en fixtures/mock data; revísalos antes de ignorarlos.
- Certificados en `certs/` están en `.gitignore`; no subirlos.

## Build y artefactos

- Build de producción genera `dist/spa/`.
- Directorios generados a ignorar: `dist/`, `.quasar/`, `coverage/`.

## Documentación adicional

- `docs/ARCHITECTURE.md` — arquitectura general.
- `docs/DEVELOPMENT.md` — setup local detallado.
- `docs/API_REFERENCE.md` — endpoints.
- `docs/DASHBOARD_SYSTEM.md` — lógica del dashboard.
- `HTTPS_SETUP_GUIDE.md` — configuración HTTPS local.
