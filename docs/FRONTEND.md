# Documentación del Frontend

Este documento describe la organización del frontend de **Dashboard Logs Santoro**: componentes, páginas, stores, composables, directivas, layouts, estilos y patrones de diseño.

---

## 1. Framework y configuración

- **Framework:** Quasar Framework v2 sobre Vue 3.
- **API de componentes:** Composition API (`<script setup>`).
- **Build tool:** Vite vía `@quasar/app-vite`.
- **Configuración central:** `quasar.config.js`.
- **Variables de entorno:** `src/config/env.js` (único punto de verdad).
- **Entrada SPA:** `index.html` → `src/App.vue` → `src/router/index.js` → layouts y páginas.

---

## 2. Layouts

### `src/layouts/MainLayout.vue`

Layout principal de la aplicación. Incluye:

- Barra superior con logo, título, notificaciones, botón de Eva y menú de usuario.
- Drawer lateral de navegación con opciones según el flujo (`client` o `santoro`).
- Área principal (`<router-view />`) donde se renderizan las páginas.
- Control de visibilidad de elementos según permisos (integración con `v-can`).

---

## 3. Páginas

### Páginas públicas (sin layout, sin auth)

| Página | Ruta | Descripción |
|--------|------|-------------|
| `LoginPage.vue` | `/login` | Inicio de sesión. |
| `VerificarCuentaPage.vue` | `/verificarCuenta` | Verificación de cuenta. |
| `PasswordOlvidadoPage.vue` | `/olvide-password` | Recuperación de contraseña. |
| `ResetPasswordPage.vue` | `/reset-password` | Restablecimiento de contraseña. |
| `ChangeTempPassword.vue` | `/new-password` | Cambio de contraseña temporal. |
| `AcceptInvitation.vue` | `/accept-invite` | Aceptar invitación y establecer contraseña. |
| `ErrorNotFound.vue` | `/:catchAll(.*)*` | Página 404. |

### Páginas del flujo cliente (requieren auth, `flow: 'client'`)

| Página | Ruta | Descripción |
|--------|------|-------------|
| `EscritorioPage.vue` | `/client/escritorio` | Escritorio principal con dashboard. |
| `DiagnosticoPage.vue` | `/client/diagnostico` | Diagnóstico de sesiones y timelines. |
| `LogsPage.vue` | `/client/logs` | Vista de logs. |
| `MapaPage.vue` | `/client/mapa` | Mapa de dispositivos. |
| `APIKeysPage.vue` | `/client/myApiKeys` | Gestión de API keys del cliente. |
| `GestionEmpleadosPage.vue` | `/client/gestion-empleados` | Gestión de empleados. |
| `EvaWorkspacePage.vue` | `/client/eva` | Workspace completo de Eva AI. |
| `DashboardMobilePage.vue` | `/client/dashboard-mobile` | Dashboard optimizado para móviles. |
| `DashboardPanelWindowPage.vue` | `/client/escritorio/panel/:panel` | Ventana popout de panel. |
| `DashboardPanelWindowPage.vue` | `/client/escritorio/section/:section` | Ventana popout de sección. |

### Páginas del flujo Santoro (admin, `flow: 'santoro'`, requiere admin)

| Página | Ruta | Descripción |
|--------|------|-------------|
| `admin/EscritorioInicio.vue` | `/santoro/inicio` | Dashboard administrativo. |
| `admin/EmpresasAdminPage.vue` | `/santoro/empresas` | Gestión de organizaciones/empresas. |
| `admin/UsuariosAdminPage.vue` | `/santoro/usuarios` | Gestión de usuarios. |
| `admin/APIKeysAdminPage.vue` | `/santoro/api-keys` | Gestión de API keys global. |
| `admin/GestionEmpleadosSantoroPage.vue` | `/santoro/gestion-empleados` | Gestión de empleados (vista admin). |

### Páginas auxiliares

| Página | Descripción |
|--------|-------------|
| `LoadingPage.vue` | Pantalla de carga inicial. |

---

## 4. Componentes

### 4.1 Componentes de Eva AI (`src/components/ai/`)

| Componente | Descripción |
|------------|-------------|
| `EvaChatPanel.vue` | Panel principal de conversación. |
| `EvaContextPanel.vue` | Panel lateral de contexto (sistema, granularidad, rango de fechas). |
| `EvaConversationList.vue` | Lista de conversaciones históricas. |
| `EvaFloatingButton.vue` | Botón flotante para abrir Eva. |
| `EvaMessageBubble.vue` | Burbuja individual de mensaje. |
| `EvaMessageRenderer.vue` | Renderizador de mensajes según tipo. |
| `EvaQuickActions.vue` | Botones de acciones rápidas. |
| `EvaSuggestionsBar.vue` | Barra de sugerencias de preguntas. |
| `EvaTypingIndicator.vue` | Animación de "Eva está escribiendo". |
| `EvaVoiceButton.vue` | Botón de entrada por voz. |
| `EvaWidget.vue` | Modo widget compacto. |
| `EvaWorkspace.vue` | Workspace completo de Eva. |
| `EvaWorkspaceDrawer.vue` | Drawer lateral del workspace. |
| `cards/EvaAlertCard.vue` | Tarjeta de alerta. |
| `cards/EvaChartCard.vue` | Tarjeta de gráfica. |
| `cards/EvaInsightCard.vue` | Tarjeta de insight. |
| `cards/EvaTrendCard.vue` | Tarjeta de tendencia. |

### 4.2 Bloques del dashboard (`src/components/blocks/`)

| Componente | Descripción |
|------------|-------------|
| `ChartDrivenFilters.vue` | Filtros interactivos derivados de gráficas. |
| `ConsoleCard.vue` | Tarjeta de consola. |
| `ConsoleDevicesMap.vue` | Mapa de dispositivos. |
| `ConsoleGeoHeatMap.vue` | Mapa de calor geográfico. |
| `ConsoleGeoMap.vue` | Mapa geográfico general. |
| `DetailDialog.vue` | Diálogo de detalle de evento. |
| `DinamicFilters.vue` | Panel de filtros dinámicos. |
| `KPITotalLogs.vue` | KPI de total de logs. |
| `RateLimitConfig.vue` | UI de configuración de rate limits. |

### 4.3 Dashboard (`src/components/dashboard/`)

| Componente | Descripción |
|------------|-------------|
| `DashboardDataProvider.vue` | Proveedor de datos para dashboard. |
| `DashboardPopoutButton.vue` | Botón para abrir panel en ventana popout. |
| `DashboardSectionRenderer.vue` | Renderizador de sección según tipo. |
| `DashboardSectionsBoard.vue` | Tablero principal de secciones. |
| `DashboardSectionSkeleton.vue` | Skeleton de carga de sección. |
| `sections/DashboardSectionActivity.vue` | Sección de actividad. |
| `sections/DashboardSectionFunctions.vue` | Sección de funciones. |
| `sections/DashboardSectionGeoDevices.vue` | Sección geo/dispositivos. |
| `sections/DashboardSectionSeverityHttp.vue` | Sección severidad y HTTP. |
| `sections/DashboardSectionShell.vue` | Wrapper de sección. |
| `sections/DashboardSectionStatus.vue` | Sección de estado. |
| `sections/DashboardSectionTimeSeries.vue` | Sección de series temporales. |
| `sections/DashboardSectionToplists.vue` | Sección de top lists. |

### 4.4 Escritorio cliente (`src/components/escritorio/`)

| Componente | Descripción |
|------------|-------------|
| `ActivityTodayWidget.vue` | Widget de actividad del día. |
| `EscritorioConsola.vue` | Consola de logs. |
| `EscritorioConsolaSimple.vue` | Consola simplificada. |
| `EscritorioDetalleModal.vue` | Modal de detalle. |
| `EscritorioDiagnostico.vue` | Panel de diagnóstico. |
| `EscritorioFiltros.vue` | Filtros del escritorio. |
| `EscritorioGraficasEnhanced.vue` | Gráficas mejoradas. |
| `EscritorioGuia.vue` | Guía de usuario. |
| `FlujoEscritorio.vue` | Orquestador del flujo del escritorio. |
| `resultadosEscritorio/ResultadosByToken.vue` | Resultados por token de sesión. |

### 4.5 Componentes compartidos (`src/components/`)

| Componente | Descripción |
|------------|-------------|
| `EnviarInvitacionModal.vue` | Modal para enviar invitaciones. |
| `EventosAbiertosTable.vue` | Tabla de eventos abiertos. |
| `EventosFallidosTable.vue` | Tabla de eventos fallidos. |
| `FuncionalidadesMulTable.vue` | Tabla de funcionalidades. |
| `LogFilters.vue` | Filtros de logs. |
| `LogTable.vue` | Tabla de logs. |
| `NoDataMessage.vue` | Mensaje de estado vacío. |
| `QRScannerModal.vue` | Modal para escanear QR. |

---

## 5. Stores (Pinia)

### `src/stores/auth.js`

- Estado: usuario, tokens, sesión, flujo (`client`/`santoro`).
- Acciones: login, logout, refresh, setUser, setFlow.
- Getters: isAuthenticated, isAdmin, currentFlow, etc.

### `src/stores/consoleFilters.store.js`

- Estado: filtros aplicados en la consola de logs.
- Persistencia: almacena filtros en localStorage para mantenerlos entre sesiones.

### `src/stores/dashboardShared.store.js`

- Estado compartido entre ventanas del navegador usando `BroadcastChannel`.
- Permite sincronizar filtros y selecciones del dashboard en pestañas/ventanas abiertas.

### `src/stores/eva-store.js`

- Estado: conversaciones, mensajes, contexto actual (sistema, granularidad, fechas), sugerencias.
- Acciones: enviar mensaje, recibir respuesta, cambiar contexto, limpiar conversación.

### `src/stores/filtroFechasStore.js`

- Estado: rango de fechas seleccionado globalmente.
- Se usa en dashboard, consola y Eva para mantener coherencia temporal.

---

## 6. Composables

### `src/composables/useEvaSystems.js`

Carga los sistemas disponibles para consultar a Eva. Centraliza la lógica de catálogos y estados de carga.

### `src/composables/useFilterableSelect.js`

Proporciona un select con filtrado interno, búsqueda y paginación básica. Útil para catálogos grandes.

### `src/composables/useSearchableSelect.js`

Proporciona un select con búsqueda textual remota o local. Maneja estados de carga, resultados y selección.

---

## 7. Directivas

### `src/directives/can.js`

Directiva `v-can` que muestra u oculta elementos del DOM según los permisos del usuario autenticado.

```vue
<q-btn v-can="'users:write'">Crear usuario</q-btn>
```

Registrada en `src/boot/pinia.js`.

---

## 8. Boot files

Quasar ejecuta los archivos de `src/boot/` al iniciar la aplicación.

| Archivo | Función |
|---------|---------|
| `pinia.js` | Inicializa Pinia, el plugin de persistencia y registra la directiva `v-can`. |
| `i18n.js` | Inicializa vue-i18n con español por defecto e inglés como fallback. |

---

## 9. Estilos

### `src/css/app.scss`

Estilos globales de la aplicación: tema oscuro, tarjetas, tablas, tipografía, scrollbars, utilidades.

### `src/css/quasar.variables.scss`

Variables de Quasar: colores de marca (naranja/púrpura), espaciado, bordes, sombras.

### `src/css/chart-enhancements.scss`

Mejoras visuales para tooltips y animaciones de gráficas.

### Tema

- Modo oscuro por defecto.
- Paleta de marca: naranja y púrpura.
- Diseño responsive adaptado a escritorio, tablet y móvil.

---

## 10. Configuración y constantes

### `src/config/env.js`

Fuente única de verdad para variables de entorno. Ver [CONFIGURACION_AMBIENTE.md](CONFIGURACION_AMBIENTE.md).

### `src/constants/dashboardPanels.js`

Definición de los 13 paneles del dashboard: IDs, títulos, tamaños, iconos y configuración.

### `src/constants/dashboardSections.js`

Agrupación de los paneles en 7 secciones lógicas (Activity, Functions, Geo/Devices, etc.).

---

## 11. Helpers

### `src/helpers/index.js`

Funciones utilitarias:

- Formato de fechas (`formatDate`, `formatDateTime`).
- `timeAgo` para tiempos relativos.
- Formateo de strings y números.
- Utilidades comunes usadas por componentes y servicios.

---

## 12. Internacionalización

- Idioma por defecto: español (`es`).
- Fallback: inglés (`en`).
- Archivos: `src/i18n/es.js` y `src/i18n/en.js`.
- Cada archivo exporta un objeto con traducciones anidadas por módulo.

---

## 13. Buenas prácticas

1. **No hardcodear URLs:** usar `src/services/endpoints.js` y `src/config/env.js`.
2. **No usar `process.env` directamente:** importar desde `src/config/env.js`.
3. **Separar lógica de presentación:** las páginas usan servicios; los componentes usan props y emits.
4. **Reutilizar composables:** la lógica común debe ir a `src/composables/`.
5. **Mantener stores pequeños:** cada store debe tener una responsabilidad clara.
6. **Persistir con criterio:** solo filtros y preferencias del usuario; nunca tokens de acceso crudos.

---

## 14. Referencias

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
- [EVA_AI.md](EVA_AI.md)
- [DEVELOPMENT.md](DEVELOPMENT.md)
