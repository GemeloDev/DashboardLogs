# Sistema de Dashboard

Este documento describe el sistema de dashboards del **Dashboard Logs Santoro**: paneles, secciones, proveedores de datos, actualizaciones en tiempo real, sincronización entre ventanas, exportación y filtros.

---

## 1. Visión general

El dashboard es una interfaz modular compuesta por **paneles** (visualizaciones individuales) agrupados en **secciones**. Los datos se obtienen de múltiples endpoints REST y se actualizan en tiempo real vía WebSocket (STOMP).

### Características principales

- 13 paneles predefinidos.
- 7 secciones lógicas.
- Actualización en tiempo real por WebSocket.
- Sincronización cross-window entre pestañas y ventanas popout.
- Filtros por sistema y rango de fechas.
- Exportación a PDF y Excel.
- Vista móvil optimizada.

---

## 2. Paneles

Definidos en `src/constants/dashboardPanels.js`.

| ID | Clave de título | Descripción |
|----|-----------------|-------------|
| `activity` | `dashboard.panelActivityToday` | Actividad del día. |
| `eventTypes` | `dashboard.topFunctions` | Tipos de eventos principales. |
| `coverage` | `dashboard.coverageFunctions` | Cobertura de funciones. |
| `offices` | `dashboard.topLocations` | Ubicaciones principales. |
| `tags` | `common.tags` | Tags más frecuentes. |
| `outcomes` | `dashboard.topOutcomes` | Outcomes principales. |
| `statusTimeline` | `dashboard.panelStatusTimeline` | Timeline de estados. |
| `severity` | `dashboard.panelSeverity` | Distribución por severidad. |
| `http` | `dashboard.http` | Métricas HTTP. |
| `eventsDay` | `dashboard.eventsByDay` | Eventos por día. |
| `eventsWeek` | `dashboard.eventsByWeek` | Eventos por semana. |
| `eventsMonth` | `dashboard.eventsByMonth` | Eventos por mes. |
| `geo` | `dashboard.panelGeoDevices` | Mapa geográfico de dispositivos. |

Cada panel tiene configuración de tamaño (`width`, `height`) usada para ventanas popout.

---

## 3. Secciones

Definidas en `src/constants/dashboardSections.js`.

| ID | Paneles incluidos |
|----|-------------------|
| `functions` | `eventTypes`, `coverage` |
| `activity` | `activity` |
| `toplists` | `offices`, `tags`, `outcomes` |
| `status` | `statusTimeline` |
| `severity-http` | `severity`, `http` |
| `time-series` | `eventsDay`, `eventsWeek`, `eventsMonth` |
| `geo-devices` | `geo` |

### Helpers

- `getDashboardSectionDefinition(sectionId)` — devuelve la definición de una sección.
- `getDashboardSectionIdFromPanel(panelId)` — devuelve la sección a la que pertenece un panel.

---

## 4. Arquitectura de datos

```
DashboardSectionsBoard / EscritorioPage
        │
        ▼
DashboardDataProvider / useDashboardData
        │
        ├──► DashboardService.getStats({system, from, to})
        ├──► DashboardService.getSeries({system, from, to})
        ├──► DashboardService.getHttp({system, from, to})
        ├──► DashboardService.getGeo({system, from, to})
        └──► DashboardService.getDevices({system, status})
        │
        ▼
DashboardSectionRenderer
        │
        ▼
Secciones y paneles (ApexCharts, tablas, mapas)
```

### `src/services/dashboardService.js`

Métodos de datos:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getStats` | `GET /logs/dashboard/stats` | Estadísticas generales. |
| `getSeries` | `GET /logs/dashboard/series` | Series temporales. |
| `getHttp` | `GET /logs/dashboard/http` | Métricas HTTP. |
| `getGeo` | `GET /logs/dashboard/geo` | Datos geográficos. |
| `getDevices` | `GET /devices` | Resumen de dispositivos. |

Todos los métodos:

- Limpian parámetros vacíos/nulos.
- Extraen `response.data.data` o `response.data`.
- Usan timeout de 120 segundos.
- Soportan `AbortSignal` para cancelación.

### `src/services/useDashboardData.js`

Composable que orquesta la carga de datos:

| Estado | Descripción |
|--------|-------------|
| `statsData` | Datos de stats. |
| `seriesData` | Datos de series. |
| `httpData` | Datos HTTP. |
| `geoData` | Datos geo. |
| `devicesData` | Datos de dispositivos. |
| `loading` | Carga inicial. |
| `refreshing` | Refresco incremental. |
| `hasFetchedOnce` | Indica si ya se cargó al menos una vez. |
| `newLogsCount` | Logs nuevos recibidos por WebSocket sin refrescar. |
| `refreshTick` | Contador de refrescos. |

Métodos:

- `fetchAll(filters, options)` — carga los 5 endpoints en paralelo con `Promise.allSettled`.
- `subscribeSystem(system, getFilters, onRefreshExtra)` — suscribe al WebSocket del sistema.
- `unsubscribeSystem()` — cancela suscripción.
- `resetDashboardData()` — limpia todos los datos.

### Concurrencia

- Usa `fetchSeq` para descartar respuestas de peticiones anteriores (stale).
- Aborta peticiones previas con `AbortController`.
- Refresco incremental (`preserveExistingData: true`) mantiene datos visibles mientras se actualizan.

---

## 5. Actualización en tiempo real

### WebSocket STOMP

Servicio: `src/services/socketService.js`.

#### Funciones principales

| Función | Descripción |
|---------|-------------|
| `connectSocket(options)` | Conecta STOMP sin suscribirse a tópico. |
| `initializeSocket(topic, onMessage, options)` | Conecta y suscribe a un tópico (usado para QR login). |
| `subscribeToAlerts(tenantId, onAlert)` | Suscripción a alertas críticas. |
| `subscribeToNewLogs(tenantId, system, onNewLogs)` | Suscripción a nuevos logs del sistema. |
| `ensureSocketConnected()` | Garantiza conexión activa. |
| `restartSocketConnection()` | Reinicia la conexión. |
| `disconnectSocket()` | Cierra conexión. |
| `onSocketConnect(listener)` | Registra listener de conexión exitosa. |

#### Tópicos usados

| Tópico | Uso |
|--------|-----|
| `/topic/qr-login/` | Confirmación de login por QR. |
| `/topic/alerts/{tenantId}` | Alertas críticas del tenant. |
| `/topic/dashboard/{tenantId}/{system}` | Nuevos logs para refrescar dashboard. |

### Flujo de auto-refresh

```
WebSocket recibe NEW_LOGS
        │
        ▼
newLogsCount += payload.count
        │
        ▼
Debounce de 3 segundos
        │
        ▼
fetchAll(filters, { preserveExistingData: true })
        │
        ▼
onRefreshExtra?.()
refreshTick += 1
```

Esto evita múltiples refrescos consecutivos cuando llegan muchos logs en poco tiempo.

---

## 6. Sincronización entre ventanas

### `src/stores/dashboardShared.store.js`

Usa tres mecanismos para sincronizar estado entre pestañas y ventanas popout:

1. **BroadcastChannel** (`dashboard-multipanel-sync-v1`) — comunicación entre contextos del mismo origen.
2. **`storage` event** de localStorage — fallback para navegadores sin BroadcastChannel.
3. **`postMessage`** — comunicación con ventanas popout registradas.

### Estado sincronizado

| Campo | Descripción |
|-------|-------------|
| `filtros` | Filtros del dashboard (sistema, búsqueda, rango de fechas, valores). |
| `externalRefreshTick` | Timestamp del último refresco forzado. |
| `openPopoutSections` | Secciones abiertas en ventanas popout. |

### Tipos de mensaje

| Tipo | Descripción |
|------|-------------|
| `filters` | Cambio de filtros. |
| `refresh` | Refresco en tiempo real. |
| `popouts` | Cambio en secciones popout. |
| `hydrate` | Sincronización completa. |

### Registro de popouts

Las ventanas popout se registran en `window.__dashboardPopupRegistry` (Set) para recibir `postMessage`.

---

## 7. Filtros

### `src/stores/filtroFechasStore.js`

- Estado: `fechaInicio`, `fechaFin`.
- Por defecto: inicio del mes actual hasta hoy.
- Persistencia en localStorage.
- Métodos: `setFechas`, `resetearAMesActual`, `obtenerFechasFormateadas`.
- También define `useKpiStore` con contadores de KPIs.

### `src/services/filterMetadataService.js`

- `FilterMetadataService.getFilterConfig(system)` — obtiene la configuración de filtros disponibles para un sistema.
- Endpoint: `GET /filters/config`.

### `src/services/santoroFiltersController.js`

- Extrae los valores posibles de filtros desde `LOGS.STATS` para campos como event types, outcomes, severities, statuses, tags, locations, actors, environments.

---

## 8. Panel Santoro (administración)

### `src/services/dashboardSantoro.js`

Métodos para el flujo administrativo:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getStats()` | `GET /santoro/panel/stats` | Estadísticas admin. |
| `getEmpresas()` | `GET /santoro/panel/organizations` | Organizaciones. |
| `getEmpresasById(id)` | `GET /santoro/panel/organizations/{id}` | Organización por ID. |
| `createEmpresas(payload)` | `POST /santoro/panel/organizations` | Crear organización. |
| `statusEmpresa(empresa, status)` | `PUT /santoro/panel/organizations/{id}/status` | Cambiar status. |
| `getUsers()` | `GET /santoro/panel/users` | Usuarios. |
| `getAPIKeys()` | `GET /santoro/panel/api-keys` | API keys. |
| `changeStatusApiKey(...)` | `PUT /santoro/panel/organizations/{id}/api-keys/{key}/status` | Cambiar status de API key. |
| `alertasAPIs()` | `GET /santoro/panel/api-keys` | Detecta keys expiradas, por expirar y recientes. |

---

## 9. Componentes del dashboard

### Proveedores y renderizado

| Componente | Descripción |
|------------|-------------|
| `DashboardDataProvider.vue` | Provee datos a componentes hijos. |
| `DashboardSectionsBoard.vue` | Tablero principal de secciones. |
| `DashboardSectionRenderer.vue` | Renderiza una sección según su tipo. |
| `DashboardSectionSkeleton.vue` | Skeleton de carga. |
| `DashboardPopoutButton.vue` | Abre panel/sección en ventana popout. |

### Secciones

| Componente | Descripción |
|------------|-------------|
| `DashboardSectionActivity.vue` | Actividad. |
| `DashboardSectionFunctions.vue` | Funciones y cobertura. |
| `DashboardSectionGeoDevices.vue` | Mapa geo/dispositivos. |
| `DashboardSectionSeverityHttp.vue` | Severidad y HTTP. |
| `DashboardSectionShell.vue` | Wrapper de sección. |
| `DashboardSectionStatus.vue` | Estado. |
| `DashboardSectionTimeSeries.vue` | Series temporales. |
| `DashboardSectionToplists.vue` | Top lists. |

### Bloques

| Componente | Descripción |
|------------|-------------|
| `ChartDrivenFilters.vue` | Filtros derivados de gráficas. |
| `ConsoleCard.vue` | Tarjeta de consola. |
| `ConsoleDevicesMap.vue` | Mapa de dispositivos. |
| `ConsoleGeoHeatMap.vue` | Mapa de calor. |
| `ConsoleGeoMap.vue` | Mapa geográfico. |
| `DetailDialog.vue` | Diálogo de detalle. |
| `DinamicFilters.vue` | Panel de filtros dinámicos. |
| `KPITotalLogs.vue` | KPI total de logs. |
| `RateLimitConfig.vue` | Configuración de rate limit. |

---

## 10. Ventanas popout

Las secciones y paneles individuales pueden abrirse en ventanas emergentes.

### Rutas

| Ruta | Descripción |
|------|-------------|
| `/client/escritorio/section/:section` | Abre una sección completa. |
| `/client/escritorio/panel/:panel` | Abre un panel individual. |

### Mecanismo

1. El componente `DashboardPopoutButton.vue` abre una ventana con `window.open()`.
2. La ventana popout se registra en `window.__dashboardPopupRegistry`.
3. El estado se sincroniza vía `postMessage` y `BroadcastChannel`.
4. Al cerrar la ventana, se actualiza `openPopoutSections`.

---

## 11. Exportación

### PDF

- Librerías: `jspdf`, `jspdf-autotable`.
- Servicio: `src/services/exportService.js`.
- Usado para exportar resúmenes y tablas del dashboard.

### Excel

- Librería: `xlsx`.
- Servicios:
  - `src/services/exportService.js` — exportación de datos de sesión.
  - `src/services/consoleExportService.js` — exportación de consola de logs a Excel/CSV.

---

## 12. Datos mock

Para desarrollo local sin backend:

- `src/data/mock_logs.json` — datos de logs de ejemplo.
- `src/data/MockLogsService.js` — servicio que expone los datos mock.
- `mock-api/server.js` — servidor Express local que sirve configuración de filtros.

---

## 13. Buenas prácticas

1. **Usar `useDashboardData`** para centralizar la carga y suscripción WebSocket.
2. **No llamar directamente** a `DashboardService` desde páginas; preferir el composable.
3. **Cancelar suscripciones** al desmontar componentes para evitar fugas.
4. **Respetar el `AbortSignal`** en peticiones largas para evitar condiciones de carrera.
5. **Sincronizar cambios de filtros** a través de `dashboardSharedStore`.

---

## 14. Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/constants/dashboardPanels.js` | Definición de paneles. |
| `src/constants/dashboardSections.js` | Definición de secciones. |
| `src/services/dashboardService.js` | Peticiones de datos del dashboard. |
| `src/services/useDashboardData.js` | Composable de carga y WebSocket. |
| `src/services/socketService.js` | Conexión STOMP y suscripciones. |
| `src/services/dashboardSantoro.js` | Datos del panel admin. |
| `src/services/filterMetadataService.js` | Configuración de filtros. |
| `src/services/santoroFiltersController.js` | Extracción de valores de filtros. |
| `src/services/exportService.js` | Exportación PDF/Excel. |
| `src/services/consoleExportService.js` | Exportación de consola. |
| `src/stores/dashboardShared.store.js` | Sincronización cross-window. |
| `src/stores/filtroFechasStore.js` | Filtro de fechas. |
| `src/components/dashboard/*.vue` | Componentes del dashboard. |
| `src/components/blocks/*.vue` | Bloques visuales. |

---

## 15. Referencias

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [FRONTEND.md](FRONTEND.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [EVA_AI.md](EVA_AI.md)
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
