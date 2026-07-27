# Eva AI Assistant

**Eva** es el asistente de inteligencia artificial integrado en el **Dashboard Logs Santoro**. Permite a los usuarios consultar logs, alertas, métricas, tendencias y resúmenes ejecutivos usando lenguaje natural, con respuestas en texto y componentes visuales interactivos.

---

## 1. Visión general

Eva funciona como un chat integrado que:

- Interpreta mensajes en español e inglés.
- Detecta intenciones (`daily-summary`, `open-alerts`, `metrics-chart`, `trends`, `tickets`).
- Mantiene contexto de sistema, granularidad y rango temporal entre mensajes.
- Responde en streaming vía Server-Sent Events (SSE).
- Renderiza respuestas en tarjetas especializadas (alertas, gráficas, insights, tendencias).
- Soporta acciones rápidas, sugerencias y entrada por voz.

---

## 2. Arquitectura

```
Usuario escribe o habla
        │
        ▼
EvaChatPanel / EvaWidget
        │
        ▼
eva-command-parser.js (parseEvaCommand)
        │
        ├──► Detección de intent
        ├──► Detección de sistema
        ├──► Detección de rango temporal
        ├──► Detección de granularidad
        └──► Herencia de contexto
        │
        ▼
useEvaStream.js → SSE GET /ai/eva/stream
        │
        ▼
EvaMessageRenderer + tarjetas
```

---

## 3. Componentes

### 3.1 Componentes principales

| Componente | Ubicación | Descripción |
|------------|-----------|-------------|
| `EvaChatPanel.vue` | `components/ai/` | Panel principal de conversación. |
| `EvaWidget.vue` | `components/ai/` | Widget compacto flotante. |
| `EvaWorkspace.vue` | `components/ai/` | Workspace completo de Eva. |
| `EvaWorkspaceDrawer.vue` | `components/ai/` | Drawer lateral del workspace. |
| `EvaConversationList.vue` | `components/ai/` | Lista de conversaciones históricas. |
| `EvaContextPanel.vue` | `components/ai/` | Panel de contexto (sistema, granularidad, rango). |
| `EvaMessageBubble.vue` | `components/ai/` | Burbuja individual de mensaje. |
| `EvaMessageRenderer.vue` | `components/ai/` | Renderizador de mensajes por tipo. |
| `EvaQuickActions.vue` | `components/ai/` | Botones de acciones rápidas. |
| `EvaSuggestionsBar.vue` | `components/ai/` | Sugerencias dinámicas de preguntas. |
| `EvaTypingIndicator.vue` | `components/ai/` | Animación de "Eva está escribiendo". |
| `EvaVoiceButton.vue` | `components/ai/` | Entrada por voz. |
| `EvaFloatingButton.vue` | `components/ai/` | Botón flotante para abrir Eva. |

### 3.2 Tarjetas de respuesta

| Tarjeta | Descripción |
|---------|-------------|
| `EvaAlertCard.vue` | Muestra alertas detectadas. |
| `EvaChartCard.vue` | Muestra gráficas de métricas. |
| `EvaInsightCard.vue` | Muestra insights ejecutivos. |
| `EvaTrendCard.vue` | Muestra tendencias temporales. |

---

## 4. Store de Eva

### `src/stores/eva-store.js`

Estado principal:

| Campo | Descripción |
|-------|-------------|
| `isWidgetOpen` | Widget visible. |
| `isWorkspaceOpen` | Workspace completo visible. |
| `isListening` | Escuchando voz. |
| `loading` | Indicador de carga global. |
| `selectedSystem` | Sistema seleccionado. |
| `selectedGranularity` | `daily` u `hourly`. |
| `selectedDays` | Rango en días (default 30). |
| `selectedHours` | Rango en horas (default 24). |
| `selectedTz` | Zona horaria del usuario. |
| `availableSystem` | Lista de sistemas disponibles. |
| `lastContex` | Contexto del último mensaje. |
| `conversations` | Historial de conversaciones. |
| `currentConversationId` | Conversación activa. |
| `contextPanel` | Panel lateral de contexto (`empty`, `alert`, `insight`, `ticket`, `chart`). |
| `quickActions` | Acciones rápidas predefinidas. |

### Acciones principales

| Acción | Descripción |
|--------|-------------|
| `toggleWidget()` / `openWidget()` / `closeWidget()` | Controlar visibilidad del widget. |
| `openWorkspace()` / `closeWorkspace()` | Controlar workspace. |
| `setSelectedSystem(system)` | Cambiar sistema. |
| `setSelectedGranularity(value)` | Cambiar granularidad. |
| `setSelectedDays(value)` / `setSelectedHours(value)` | Cambiar rango temporal. |
| `setAvailableSystems(systems)` | Cargar sistemas disponibles. |
| `setLastContext(ctx)` | Guardar contexto del último mensaje. |
| `newConversation(title)` | Crear nueva conversación. |
| `addUserMessage(content)` | Agregar mensaje de usuario. |
| `addAssistantMessage(content, type, extra)` | Agregar mensaje de Eva. |
| `addStreamingMessage(type)` | Crear mensaje vacío en streaming. |
| `appendStreamingChunk(msgId, chunk)` | Agregar chunk SSE al mensaje. |
| `finalizeStreamingMessage(msgId)` | Finalizar mensaje streaming. |
| `setContextPanel(mode, title, payload)` | Mostrar panel lateral de contexto. |
| `clearContextPanel()` | Limpiar panel de contexto. |

---

## 5. Parser de comandos

### `src/services/eva-command-parser.js`

`parseEvaCommand(text, context)` devuelve un objeto con:

```javascript
{
  action: 'daily-summary',      // intent detectado
  system: 'CITA_GUYANA',          // sistema
  days: 7,                        // rango en días
  hours: null,                    // rango en horas
  granularity: 'daily',           // daily | hourly
  confidence: 'high',           // high | medium | low
  _raw: 'resumen de cita_guyana', // texto original
  _inherited: false               // heredó contexto
}
```

### Intenciones soportadas

| Intención (`action`) | Palabras clave |
|----------------------|----------------|
| `daily-summary` | resumen, daily, summary, ejecutivo, informe, diario, insight, cómo va, qué pasó, novedades, qué hay |
| `open-alerts` | alerta(s), incidente(s), warning(s), error(es), fallo(s), crítico(s), problema(s), falla(s) |
| `metrics-chart` | gráfica(s), chart(s), métrica(s), serie(s), evolución, tendencia visual, visualiz, plot, graph |
| `trends` | tendencia(s), trend(s), histórico, cómo ha evolucionado, a lo largo |
| `tickets` | ticket(s), bug(s), tarea(s), incidencia(s), borrador(es), jira, crear ticket |

### Rangos temporales

| Expresión | Resultado |
|-----------|-----------|
| "últimos 7 días" / "last 7 days" / "7d" | `days: 7` |
| "últimas 24 horas" / "24h" | `hours: 24` |
| "hoy" | `days: 1` |
| "ayer" | `days: 2` |
| "esta semana" / "última semana" | `days: 7` |
| "este mes" / "último mes" | `days: 30` |
| "últimos 3 meses" | `days: 90` |

### Granularidad

| Expresión | Resultado |
|-----------|-----------|
| "por hora", "hourly", "horario" | `granularity: 'hourly'` |
| "diario", "daily", "por día" | `granularity: 'daily'` |

### Herencia de contexto

El parser detecta frases como "mismo sistema", "igual", "también", "ahora", "y el", "del mismo", "pero con", "cambia", "actualiza" para heredar el contexto del mensaje anterior (sistema, rango, granularidad).

### Detección de sistema

El parser busca el sistema mencionado por:

1. Coincidencia exacta.
2. Nombre completo contenido en el input.
3. Matching fuzzy por tokens (mínimo 3 caracteres).

---

## 6. Streaming de respuestas

### `src/services/useEvaStream.js`

Composable que maneja SSE usando `fetch` + `ReadableStream`:

- Construye URL con `message`, `system`, `granularity`, `days`, `hours`, `tz`.
- Envía `Authorization: Bearer <token>`.
- Lee chunks de texto en tiempo real.
- Parsea eventos SSE: `chunk`, `done`, `error`.
- Actualiza el mensaje en streaming del store con `appendStreamingChunk`.
- Soporta cancelación vía `AbortController`.

### Eventos SSE

| Evento | Descripción |
|--------|-------------|
| `chunk` | Fragmento de texto de la respuesta. |
| `done` | Fin de la respuesta. |
| `error` | Error del servidor. |

---

## 7. Servicios de datos de Eva

### `src/services/eva.service.js`

Métodos REST para obtener datos de la IA:

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `getDailyPretty(params)` | `GET /ai/llm/assist/manager/daily/pretty` | Resumen diario. |
| `getAlerts(params)` | `GET /ai/alerts` | Alertas. |
| `getMetricsSeries(params)` | `GET /ai/metrics/series` | Métricas para gráficas. |
| `getHourlyInsights(params)` | `GET /ai/summaries/hourly/insights` | Insights por hora. |
| `getAlertExplain(id, params)` | `GET /ai/alerts/{id}/explain/operator` | Explicación de alerta. |
| `getTicketDraft(id, params)` | `GET /ai/alerts/{id}/ticket/draft` | Borrador de ticket. |
| `getSystems(params)` | `GET /ai/catalogs/systems` | Sistemas disponibles. |

### `src/composables/useEvaSystems.js`

Carga los sistemas disponibles:

- Si el usuario tiene `orgWide: true`, consulta todos los sistemas vía `EvaService.getSystems()`.
- Si no, usa los sistemas de `authz.systems` del usuario.

### `src/services/eva-suggestions.js`

Genera sugerencias dinámicas combinando:

- Sugerencias base: Resumen diario, Alertas abiertas, Tendencias.
- Sugerencias de gráficas por cada sistema disponible del usuario.

### `src/services/eva-context-labels.js`

Builders de etiquetas:

- `buildRangeLabel(...)` — texto del rango.
- `buildContextLabel(...)` — etiqueta completa: `Sistema · granularidad · rango`.
- `buildChartTitle(...)` / `buildChartSummary(...)` — título y resumen de gráficas.
- `buildAlertsTitle(...)` / `buildAlertsSummary(...)` — título y resumen de alertas.

### `src/services/eva-summary-presenter.js`

Formatea el resumen ejecutivo:

- `buildExecutivePresentation(payload, fallbackText)` — devuelve `{ narrative, bullets, recommendations }`.
- Valida que el narrative no contenga errores técnicos (LLM no disponible, API key inválida, etc.).
- Si el narrative no es seguro, construye un fallback a partir de datos base.
- Formatea porcentajes, números y fechas con `Intl` en español de México.

---

## 8. Tarjetas de respuesta

### `EvaInsightCard`

Muestra:

- Narrativa ejecutiva.
- Bullet points clave.
- Recomendaciones.

### `EvaAlertCard`

Muestra alertas con:

- Severidad.
- Sistema afectado.
- Mensaje.
- Botones para explicar o generar borrador de ticket.

### `EvaChartCard`

Muestra gráficas de ApexCharts basadas en datos de `metrics/series`.

### `EvaTrendCard`

Muestra tendencias temporales con indicadores de dirección.

---

## 9. Contexto visual

El panel de contexto (`EvaContextPanel.vue`) muestra información asociada al último mensaje:

- `empty`: sin contexto.
- `alert`: detalle de alerta.
- `insight`: resumen ejecutivo.
- `ticket`: borrador de ticket.
- `chart`: datos de gráfica.

---

## 10. Voz y accesibilidad

- `EvaVoiceButton.vue` usa la API de reconocimiento de voz del navegador (`SpeechRecognition` / `webkitSpeechRecognition`) para transcribir mensajes.
- El texto transcrito se envía al parser como un mensaje de usuario normal.

---

## 11. Flujo de uso típico

1. Usuario abre Eva desde el botón flotante o página `/client/eva`.
2. Eva muestra mensaje de bienvenida y sugerencias.
3. Usuario escribe: "resumen de CITA_GUYANA últimos 7 días".
4. Parser detecta:
   - `action: 'daily-summary'`
   - `system: 'CITA_GUYANA'`
   - `days: 7`
   - `granularity: 'daily'`
5. Se agrega mensaje de usuario al store.
6. `useEvaStream` abre SSE hacia `/ai/eva/stream`.
7. Eva responde en streaming; se renderiza como `EvaInsightCard` o mensaje de texto.
8. El usuario puede continuar con contexto: "y ahora por hora" → hereda sistema y cambia granularidad.

---

## 12. Archivos clave

| Archivo | Responsabilidad |
|---------|-----------------|
| `src/stores/eva-store.js` | Estado de conversaciones, contexto y UI. |
| `src/services/eva-command-parser.js` | Parser de intenciones en lenguaje natural. |
| `src/services/useEvaStream.js` | Streaming SSE de respuestas. |
| `src/services/eva.service.js` | API REST de datos de IA. |
| `src/services/eva-suggestions.js` | Generación de sugerencias. |
| `src/services/eva-context-labels.js` | Builders de etiquetas. |
| `src/services/eva-summary-presenter.js` | Formateo de resúmenes ejecutivos. |
| `src/composables/useEvaSystems.js` | Carga de sistemas disponibles. |
| `src/components/ai/*.vue` | Componentes visuales de Eva. |

---

## 13. Referencias

- [ARCHITECTURE.md](ARCHITECTURE.md)
- [FRONTEND.md](FRONTEND.md)
- [API_REFERENCE.md](API_REFERENCE.md)
- [DASHBOARD_SYSTEM.md](DASHBOARD_SYSTEM.md)
- [AUTH_SYSTEM.md](AUTH_SYSTEM.md)
