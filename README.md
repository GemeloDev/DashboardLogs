# Dashboard Logs Santoro

Aplicación de dashboard en tiempo real para monitoreo, análisis y diagnóstico de logs de sistemas de **Grupo Santoro**. Ofrece visualización interactiva con gráficos, mapas geográficos, IA conversacional (Eva), control de accesos basado en roles y gestión de organizaciones, usuarios y API keys.

---

## Tabla de contenidos

1. [Descripción general](#descripción-general)
2. [Stack tecnológico](#stack-tecnológico)
3. [Estructura del proyecto](#estructura-del-proyecto)
4. [Documentación técnica](#documentación-técnica)
5. [Instalación y desarrollo](#instalación-y-desarrollo)
6. [Scripts disponibles](#scripts-disponibles)
7. [Seguridad](#seguridad)
8. [Autor y licencia](#autor-y-licencia)

---

## Descripción general

`Dashboard Logs` es una **SPA (Single Page Application)** construida con Quasar Framework / Vue 3 que se conecta a un backend externo vía REST + WebSocket. El sistema permite a operadores y administradores de Grupo Santoro:

- Visualizar logs y métricas en tiempo real.
- Explorar eventos por tipo, severidad, sistema, dispositivo, ubicación geográfica, etc.
- Ejecutar diagnósticos de sesión y consultar timelines de eventos.
- Interactuar con **Eva**, un asistente de IA que responde en lenguaje natural sobre datos del sistema.
- Administrar usuarios, empleados, organizaciones y API keys.
- Exportar datos a PDF y Excel.
- Iniciar sesión por usuario/contraseña o mediante **código QR**.

> **Nota:** este repositorio contiene **únicamente el frontend**. El backend es un servicio independiente alojado en `api-logs.grupo-santoro.com.mx` (producción) o `187.188.66.56:8040` (desarrollo). Cualquier documentación relacionada con un backend en Node.js aparece como **idea de desarrollo** y no forma parte de la funcionalidad oficial del dashboard.

---

## Stack tecnológico

| Categoría | Tecnología |
|-----------|-----------|
| Framework | [Quasar Framework v2](https://quasar.dev) (Vue 3) |
| Compilación | Vite vía `@quasar/app-vite` |
| Estado | Pinia 3 + pinia-plugin-persistedstate |
| Router | Vue Router 4 (hash mode) |
| HTTP | Axios con interceptores JWT |
| WebSocket | STOMP sobre WebSocket (`@stomp/stompjs`) |
| Gráficos | ApexCharts + vue3-apexcharts, Chart.js |
| Mapas | Leaflet, Esri-Leaflet, Maplibre GL |
| Códigos QR | qrcode (generación) + jsqr (lectura) |
| Exportación | jsPDF, jspdf-autotable, xlsx, file-saver |
| i18n | vue-i18n (español/inglés) |
| Autenticación | JWT con refresh tokens y control de roles |
| Linting | ESLint v9 flat config + Prettier |

---

## Estructura del proyecto

```
DashboardLogs/
├── docs/                     # Documentación técnica
│   ├── ARCHITECTURE.md
│   ├── API_REFERENCE.md
│   ├── AUTH_SYSTEM.md
│   ├── DASHBOARD_SYSTEM.md
│   ├── DEVELOPMENT.md
│   ├── DEPLOYMENT.md
│   ├── EVA_AI.md
│   ├── FRONTEND.md
│   ├── BACKEND_PROPOSAL.md   # Idea de desarrollo, no oficial
│   ├── CONFIGURACION_AMBIENTE.md
│   ├── PROPUESTA_SCHEMA_LOGS_BACKEND.md
│   └── ...
├── public/                   # Assets estáticos públicos
├── src/                      # Código fuente principal
│   ├── assets/               # Imágenes, logos, favicons
│   ├── boot/                 # Boot files de Quasar (pinia, i18n)
│   ├── components/           # Componentes Vue
│   ├── composables/          # Composables Vue
│   ├── config/               # Configuración central (env.js)
│   ├── constants/            # Constantes (paneles, secciones)
│   ├── css/                  # Estilos globales y variables
│   ├── data/                 # Datos mock y helpers de prueba
│   ├── directives/           # Directivas personalizadas
│   ├── helpers/              # Utilidades
│   ├── i18n/                 # Traducciones
│   ├── layouts/              # Layouts
│   ├── pages/                # Páginas de la aplicación
│   ├── router/               # Definición de rutas y guards
│   ├── services/             # Lógica de negocio y API
│   └── stores/               # Stores Pinia
├── mock-api/                 # Servidor mock local (Express)
├── scripts/                  # Scripts de utilidad
├── quasar.config.js          # Configuración de Quasar
├── package.json              # Dependencias y scripts
└── README.md                 # Este archivo
```

---

## Documentación técnica

La documentación completa se encuentra en el directorio `docs/`:

- **[ARCHITECTURE.md](docs/ARCHITECTURE.md)** — Arquitectura del sistema, stack, estructura de directorios y flujo de datos.
- **[FRONTEND.md](docs/FRONTEND.md)** — Componentes, páginas, stores, composables, layouts y estilos.
- **[API_REFERENCE.md](docs/API_REFERENCE.md)** — Endpoints REST, WebSocket y helpers de URL.
- **[AUTH_SYSTEM.md](docs/AUTH_SYSTEM.md)** — Autenticación JWT, autorización RBAC, QR login, invitaciones y flujos de usuario.
- **[EVA_AI.md](docs/EVA_AI.md)** — Arquitectura del asistente de IA Eva.
- **[DASHBOARD_SYSTEM.md](docs/DASHBOARD_SYSTEM.md)** — Paneles, secciones, sincronización cross-window, exportación y filtros.
- **[DEVELOPMENT.md](docs/DEVELOPMENT.md)** — Configuración del entorno local, HTTPS, mock API, linting y seguridad.
- **[DEPLOYMENT.md](docs/DEPLOYMENT.md)** — CI/CD, build y despliegue a AWS S3 + CloudFront.
- **[CONFIGURACION_AMBIENTE.md](docs/CONFIGURACION_AMBIENTE.md)** — Variables de entorno y configuración por ambiente.
- **[PROPUESTA_SCHEMA_LOGS_BACKEND.md](docs/PROPUESTA_SCHEMA_LOGS_BACKEND.md)** — Propuesta de estandarización del schema de logs para backend.
- **[BACKEND_PROPOSAL.md](docs/BACKEND_PROPOSAL.md)** — Idea de desarrollo de backend en Node.js (no oficial).

---

## Instalación y desarrollo

### Requisitos

- Node.js 20+
- npm 10+

### Instalación

```bash
npm install
```

### Configuración local

Copia `.env.example` a `.env.local` y ajusta las URLs según tu entorno:

```bash
cp .env.example .env.local
```

Consulta [docs/CONFIGURACION_AMBIENTE.md](docs/CONFIGURACION_AMBIENTE.md) para detalles.

### Iniciar en desarrollo

```bash
npm run dev
```

El servidor de desarrollo se levanta en `https://prueba.grupo-santoro.com.mx:9000` con HTTPS configurado. Para ello sigue [HTTPS_SETUP_GUIDE.md](HTTPS_SETUP_GUIDE.md).

### Desarrollo sin HTTPS

Si prefieres desarrollo sin HTTPS, usa:

```bash
quasar dev
```

> Recomendamos HTTPS para evitar problemas de cookies de terceros y WebSocket seguro.

---

## Scripts disponibles

| Comando | Descripción |
|---------|-------------|
| `npm run dev` | Inicia el servidor de desarrollo con HTTPS (port 9000) |
| `npm run build` | Compila para producción |
| `npm run lint` | Ejecuta ESLint |
| `npm run format` | Ejecuta Prettier |
| `npm run security:scan-secrets` | Escanea secretos en el código |
| `npm run mock-api` | Levanta el servidor mock local en port 3001 |

---

## Seguridad

- Las variables de entorno con credenciales se mantienen fuera del repositorio.
- El certificado SSL y la llave privada están en `certs/` y están en `.gitignore`.
- Antes de subir cambios, ejecuta `npm run security:scan-secrets`.
- Consulta `scripts/scan-secrets.mjs` para ver las reglas de detección.

---

## Autor y licencia

- **Autor:** Leonel Flores
- **Organización:** Grupo Santoro
- **Repositorio:** GitLab

Este proyecto es de uso interno de Grupo Santoro.
