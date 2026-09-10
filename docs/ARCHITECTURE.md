# Arquitectura del Sistema

Este documento describe la arquitectura general del **Dashboard Logs Santoro**: su propósito, stack tecnológico, organización de directorios, patrones de diseño, flujo de datos y formas de integración con servicios externos.

---

## 1. Visión general

El **Dashboard Logs Santoro** es una aplicación web de monitoreo y análisis de logs en tiempo real. Su objetivo es ofrecer a operadores, administradores y clientes una interfaz unificada para:

- Visualizar métricas, alertas, series temporales y mapas geográficos.
- Explorar logs y ejecutar diagnósticos de sesión.
- Administrar usuarios, organizaciones, empleados y API keys.
- Interactuar con una asistente de IA llamada **Eva**.

> **Alcance del repositorio:** este repositorio contiene exclusivamente el **frontend** de la aplicación. El backend es un servicio independiente (no Node.js) alojado en infraestructura de Grupo Santoro.

---

## 2. Stack tecnológico

| Capa | Tecnología | Uso |
|------|------------|-----|
| Framework UI | Quasar Framework v2 | Componentes, layouts, temas, PWA |
| Motor de UI | Vue 3 + Composition API | Lógica reactiva de componentes |
| Build tool | Vite vía `@quasar/app-vite` | Empaquetado, HMR, optimización |
| Router | Vue Router 4 | Navegación cliente (hash mode) |
| Estado | Pinia 3 + persistedstate | Estado global y persistencia de filtros |
| HTTP | Axios | Peticiones REST al backend |
| WebSocket | STOMP sobre WebSocket (`@stomp/stompjs`) | Logs y notificaciones en tiempo real |
| Gráficos | ApexCharts + Chart.js | Dashboards y visualizaciones |
| Mapas | Leaflet + Esri-Leaflet + Maplibre GL | Mapas de calor y ubicaciones de dispositivos |
| QR | qrcode + jsqr | Login por QR y escaneo de códigos |
| Exportación | jsPDF + xlsx | Generación de PDF/Excel |
| i18n | vue-i18n | Español/inglés |
| Utilidades | date-fns, lodash-es, jwt-decode | Fechas, utilidades, decodificación JWT |

---

## 3. Arquitectura de alto nivel

```
┌───────────────────────────────────────────────────────────────┐
│                        Cliente (navegador)                    │
│                                                               │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              Dashboard Logs (Vue 3 / Quasar)             │  │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐   │  │
│  │  │   Páginas    │  │ Componentes  │  │    Stores    │   │  │
│  │  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘   │  │
│  │         └─────────────────┴──────────────────┘            │  │
│  │                           │                               │  │
│  │              ┌────────────┴────────────┐                  │  │
│  │              │     Services Layer      │                  │  │
│  │              │  axiosConfig, services  │                  │  │
│  │              └────────────┬────────────┘                  │  │
│  └───────────────────────────┼───────────────────────────────┘  │
│                              │                                  │
│                   HTTPS / WSS│REST / STOMP                     │
└──────────────────────────────┼──────────────────────────────────┘
                               │
           ┌───────────────────┼───────────────────┐
           │                   │                   │
           ▼                   ▼                   ▼
   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
   │  Backend API │   │   WebSocket  │   │    AI API    │
   │  (Servidor   │   │   (STOMP)    │   │   (Eva AI)   │
   │   externo)   │   │              │   │              │
   └──────────────┘   └──────────────┘   └──────────────┘
```

### Responsabilidades por capa

| Capa | Responsabilidad |
|------|-----------------|
| **Páginas (`src/pages`)** | Vistas de alto nivel asociadas a rutas. |
| **Componentes (`src/components`)** | Bloques reutilizables: tablas, gráficas, mapas, paneles, modales, etc. |
| **Stores (`src/stores`)** | Estado global: auth, filtros de consola, fechas, Eva, sincronización cross-window. |
| **Services (`src/services`)** | Lógica de acceso a datos, transformaciones y utilidades de negocio. |
| **Composables (`src/composables`)** | Lógica reutilizable con estado de Vue (selects, búsquedas, etc.). |
| **Config (`src/config`)** | Variables de entorno centralizadas y helpers. |
| **Router (`src/router`)** | Definición de rutas, guards de autenticación y flujos. |
| **Directives (`src/directives`)** | Directivas personalizadas (`v-can`). |

---

## 4. Estructura de directorios

```
DashboardLogs/
├── docs/                     # Documentación técnica
├── public/                   # Assets estáticos accesibles públicamente
├── mock-api/                 # Servidor Express mock (desarrollo local)
├── scripts/                  # Scripts de utilidad (scan-secrets, etc.)
├── src/
│   ├── assets/               # Imágenes, logos, favicons
│   ├── boot/                 # Boot files de Quasar (pinia, i18n)
│   ├── components/           # Componentes Vue organizados por dominio
│   │   ├── ai/               # Componentes de Eva AI
│   │   ├── blocks/           # Bloques del dashboard
│   │   ├── dashboard/        # Componentes de dashboard
│   │   ├── escritorio/       # Componentes del escritorio cliente
│   │   └── *.vue             # Componentes compartidos
│   ├── composables/          # Composables Vue
│   ├── config/               # Configuración central (env.js)
│   ├── constants/            # Constantes globales
│   ├── css/                  # Estilos SCSS y variables de Quasar
│   ├── data/                 # Datos mock
│   ├── directives/           # Directivas personalizadas
│   ├── helpers/              # Funciones utilitarias
│   ├── i18n/                 # Traducciones (es, en)
│   ├── layouts/              # Layouts (MainLayout)
│   ├── pages/                # Páginas por ruta
│   │   └── admin/            # Páginas del flujo Santoro
│   ├── router/               # Configuración de rutas
│   ├── services/             # Lógica de acceso a backend
│   └── stores/               # Stores Pinia
├── certs/                    # Certificados SSL (gitignored)
├── .env*                     # Variables de entorno
├── quasar.config.js          # Configuración de Quasar
├── package.json
└── README.md
```

---

## 5. Patrones arquitectónicos

### 5.1 Fuente única de verdad

- **Variables de entorno:** `src/config/env.js` es el único lugar desde el cual se deben leer configuraciones. Ningún otro archivo debe usar `process.env` directamente.
- **Endpoints:** `src/services/endpoints.js` centraliza todas las URLs de la API.
- **Configuración de Quasar:** `quasar.config.js` inyecta las variables de entorno al build.

### 5.2 Separación de responsabilidades

- Las páginas no hacen peticiones HTTP directamente; delegan en servicios.
- Los servicios encapsulan Axios y transforman respuestas cuando es necesario.
- Los stores orquestan estado global (auth, filtros, preferencias).
- Los componentes se enfocan en presentación y eventos de usuario.

### 5.3 Comunicación en tiempo real

- **STOMP sobre WebSocket** se usa para:
  - Logs y métricas en vivo.
  - Notificaciones del sistema.
  - Login por QR (el cliente escanea un QR y el servidor confirma vía WebSocket).
- El servicio `socketService.js` encapsula la conexión STOMP y expone métodos de suscripción/publicación.

### 5.4 Sincronización entre ventanas

- El store `dashboardShared.store.js` usa la API `BroadcastChannel` para sincronizar filtros y estado del dashboard entre múltiples pestañas o ventanas del navegador.

---

## 6. Flujo de datos

### 6.1 Autenticación

```
Usuario ──► LoginPage ──► authService.login()
                              │
                              ▼
                    axiosConfig (POST /auth/login)
                              │
                              ▼
                         Backend API
                              │
                              ▼
                    auth store (tokens + usuario)
                              │
                              ▼
                    router redirige a flujo client/santoro
```

### 6.2 Dashboard en tiempo real

```
DashboardPage
     │
     ▼
useDashboardData / DashboardDataProvider
     │
     ├──► dashboardService.fetchStats()   ──► REST API
     ├──► dashboardService.fetchSeries()  ──► REST API
     └──► socketService.subscribe()       ──► WebSocket STOMP
                    │
                    ▼
            Reactividad Vue + stores
                    │
                    ▼
        DashboardSectionRenderer ──► ApexCharts / Mapas / Tablas
```

### 6.3 Eva AI

```
EvaWorkspacePage / EvaChatPanel
     │
     ▼
eva.service.js + useEvaStream.js
     │
     ├──► Comandos predefinidos  ──► eva-command-parser.js
     └──► Streaming SSE          ──► /ai/eva/stream
                    │
                    ▼
         EvaMessageRenderer + tarjetas (alert, chart, insight, trend)
```

---

## 7. Integraciones externas

| Sistema | Tipo | Uso |
|---------|------|-----|
| Backend API | REST | Autenticación, logs, dashboard, catálogos |
| WebSocket | STOMP | Real-time logs, QR login, notificaciones |
| AI API | REST + SSE | Eva AI assistant |
| AWS S3 + CloudFront | Deploy | Hosting del SPA y distribución de assets |

---

## 8. Seguridad

- **JWT:** tokens de acceso y refresh. Rotación automática en `axiosConfig.js`.
- **Cookies + localStorage:** el refresh token puede almacenarse en cookie segura (`HttpOnly`) según configuración del backend.
- **RBAC:** roles y permisos controlan rutas y visibilidad de elementos UI.
- **v-can:** directiva para ocultar/mostrar elementos según permisos.
- **Scan de secretos:** `npm run security:scan-secrets` revisa claves, tokens y certificados.
- **HTTPS:** desarrollo local con certificados reales de cPanel.

---

## 9. Notas sobre el backend

> **El backend NO está en este repositorio.** El dashboard consume una API REST y WebSocket desarrollados en un servidor independiente.

- Para la propuesta de estandarización del schema de logs que envía el backend, ver [`docs/PROPUESTA_SCHEMA_LOGS_BACKEND.md`](PROPUESTA_SCHEMA_LOGS_BACKEND.md).
- Para una **idea de desarrollo** de backend en Node.js (no oficial), ver [`docs/BACKEND_PROPOSAL.md`](BACKEND_PROPOSAL.md).

---

## 10. Decisiones arquitectónicas clave

| Decisión | Motivo |
|----------|--------|
| Quasar + Vite | Framework completo con componentes Material, PWA, SSR opcional y build rápido. |
| Pinia | Estado simple, tipado amigable y buena integración con Vue Devtools. |
| Axios interceptors | Manejo centralizado de tokens, refresh automático y errores globales. |
| STOMP sobre WebSocket | Protocolo simple para mensajería con tópicos y colas. |
| BroadcastChannel | Sincronización nativa del navegador sin librerías externas. |
| Env centralizado (`src/config/env.js`) | Evita URLs hardcodeadas y facilita cambios por ambiente. |

---

## 11. Referencias

- [README.md](../README.md)
- [FRONTEND.md](FRONTEND.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
- [EVA_AI.md](EVA_AI.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
- [DEPLOYMENT.md](DEPLOYMENT.md)
- [CONFIGURACION_AMBIENTE.md](CONFIGURACION_AMBIENTE.md)
