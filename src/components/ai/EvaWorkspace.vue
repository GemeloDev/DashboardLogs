<template>
  <q-dialog
    v-model="workspaceOpen"
    maximized
    transition-show="slide-up"
    transition-hide="slide-down"
  >
    <q-card class="eva-workspace">
      <q-card-section class="eva-workspace-header row items-center no-wrap">
        <div class="eva-workspace-title-wrap">
          <div class="eva-workspace-title">Eva Workspace</div>
          <div class="eva-workspace-subtitle">
            Panel avanzado de análisis y conversación
          </div>
        </div>

        <q-space />

        <q-btn
          flat
          round
          dense
          icon="close"
          color="white"
          @click="eva.closeWorkspace()"
        />
      </q-card-section>

      <q-separator dark />

      <q-card-section class="eva-workspace-body">
        <div class="eva-workspace-grid">
          <!-- Conversación -->
          <div class="eva-workspace-chat">
            <div class="eva-section-title q-mb-md">Conversación</div>

            <div ref="chatScrollRef" class="eva-chat-scroll">
              <EvaMessageBubble
                v-for="msg in messages"
                :key="msg.id"
                :message="msg"
                compact
                @action="handleMessageAction"
                @followup="handleFollowUp"
              />

              <!-- Typing indicator — aparece mientras Eva procesa -->
              <EvaTypingIndicator
                :visible="eva.loading"
                :action="currentAction"
              />
            </div>

            <div class="eva-chat-footer">
              <EvaSuggestionsBar
                :suggestions="suggestions"
                @select="handleSuggestionSelect"
              />

              <div class="row items-center q-gutter-sm">
                <q-input
                  v-model="input"
                  dark
                  dense
                  outlined
                  class="col"
                  placeholder="Escribe a Eva..."
                  :disable="isStreaming"
                  @keyup.enter="sendMessage"
                />
                <q-btn
                  round
                  color="primary"
                  icon="send"
                  :disable="isStreaming"
                  :loading="isStreaming"
                  @click="sendMessage"
                />
              </div>
            </div>
          </div>

          <!-- Panel contextual -->
          <div class="eva-workspace-context">
            <EvaContextPanel />
          </div>
        </div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted } from 'vue'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import { parseEvaCommand, extractContext } from 'src/services/eva-command-parser'
import { getEvaSuggestions, getContextualFollowUps } from 'src/services/eva-suggestions'
import { loadEvaSystems } from 'src/composables/useEvaSystems'
import { useEvaStream } from 'src/services/useEvaStream'
import { buildChartTitle, buildChartSummary, buildAlertsTitle, buildAlertsSummary } from 'src/services/eva-context-labels'

import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaContextPanel from './EvaContextPanel.vue'
import EvaSuggestionsBar from './EvaSuggestionsBar.vue'
import EvaTypingIndicator from './EvaTypingIndicator.vue'

const eva           = useEvaStore()
const chatScrollRef = ref(null)
const input         = ref('')
const currentAction = ref(null)
const { streamMessage, isStreaming } = useEvaStream()

onMounted(async () => {
  await loadEvaSystems
})

const workspaceOpen = computed({
  get: () => eva.isWorkspaceOpen,
  set: (val) => {
    if (!val) eva.closeWorkspace()
  }
})

const messages = computed(() => eva.currentConversation?.messages || [])
const suggestions = computed(() => getEvaSuggestions(input.value))

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollMessagesToBottom()
  },
  { immediate: true }
)

// Scroll cuando aparece/desaparece el typing indicator
watch(
  () => eva.loading,
  async () => {
    await nextTick()
    scrollMessagesToBottom()
  }
)

function scrollMessagesToBottom() {
  const el = chatScrollRef.value
  if (!el) return
  el.scrollTop = el.scrollHeight
}


async function handleSuggestionSelect(item) {
  if (!item?.prompt) return
  input.value = item.prompt
  await sendMessage()
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isStreaming.value) return   // bloquear si ya está streamando

  eva.addUserMessage(text)
  input.value = ''

  const command = parseEvaCommand(text, extractContext(eva))

  if (command) {
    // Aplicar parámetros del comando al store
    if (command.system)      eva.setSelectedSystem(command.system)
    if (command.granularity) eva.setSelectedGranularity(command.granularity)
    if (typeof command.days   === 'number' && command.days   > 0) eva.setSelectedDays(command.days)
    if (typeof command.hours  === 'number' && command.hours  > 0) eva.setSelectedHours(command.hours)

    // Guardar contexto para memoria corta
    eva.setLastContext({
      intent:      command.action,
      system:      command.system      ?? eva.selectedSystem,
      granularity: command.granularity ?? eva.selectedGranularity,
      days:        command.days        ?? eva.selectedDays,
      hours:       command.hours       ?? eva.selectedHours,
    })

    // Acciones con panel contextual → flujo normal (incluye daily-summary)
    if (['daily-summary', 'metrics-chart', 'trends', 'open-alerts'].includes(command.action)) {
      currentAction.value = command.action
      await handleQuickAction({
        key:             command.action,
        label:           text,
        skipUserMessage: true,
        fromInput:       true
      })
      currentAction.value = null
      await nextTick()
      scrollMessagesToBottom()
      return
    }

    // Texto libre sin acción específica → STREAMING
    currentAction.value = 'stream'
    try {
      await streamMessage({
        message:     text,
        system:      eva.selectedSystem,
        granularity: eva.selectedGranularity,
        days:        eva.selectedDays,
        hours:       eva.selectedHours,
        tz:          eva.selectedTz,
        type:        'text'
      })
    } catch (err) {
      console.error('Eva stream error:', err)
    }
    currentAction.value = null

    await nextTick()
    scrollMessagesToBottom()
    return
  }

  // Sin comando reconocido → streaming con fallback descriptivo
  currentAction.value = 'stream'
  try {
    await streamMessage({ message: text, type: 'text' })
  } catch (err) {
    console.error('Eva stream error:', err)
  }
  currentAction.value = null

  await nextTick()
  scrollMessagesToBottom()
}

async function handleQuickAction(action) {
  if (!action?.key) return

  try {
    if (!action?.skipUserMessage && action?.label) {
      eva.addUserMessage(action.label)
    }

    currentAction.value = action.key
    eva.setLoading(true)

    if (action.key === 'daily-summary') {
      const res = await EvaService.getDailyPretty({
        days: 1,
        tz: eva.selectedTz,
        maxTickets: 5
      })

      const payload = res?.data?.data || res?.data || {}
      const base = payload?.base || null
      const pretty = payload?.pretty || null

      const summaryText =
        pretty?.executiveNarrative ||
        (Array.isArray(base?.executiveSummary) ? base.executiveSummary.join(' ') : null) ||
        'No se obtuvo resumen.'

      eva.addAssistantMessage(summaryText, 'insight', {
        raw: payload,
        meta: {
          bullets:   pretty?.executiveBullets || base?.executiveSummary || [],
          followUps: buildFollowUps('daily-summary'),
          actions: [
            { key: 'open-context',         label: 'Ver panel',  icon: 'right_panel_open' },
            { key: 'refresh-daily-summary', label: 'Actualizar', icon: 'refresh' }
          ]
        }
      })

      eva.setContextPanel('insight', 'Resumen diario', payload)

      eva.setLastContext({
        intent: 'daily-summary',
        system: eva.selectedSystem,
        granularity: 'daily',
        days: 1,
        hours: null
      })

      return
    }

    if (action.key === 'open-alerts') {
      const res = await EvaService.getAlerts({
        page: 0,
        size: 5,
        granularity: 'daily',
        tz: eva.selectedTz
      })

      const payload = res?.data?.data || {}
      const content = payload?.content || []

      const ctx = {
        system: eva.lastContext?.system || eva.selectedSystem || null,
        granularity: eva.lastContext?.granularity || 'daily',
        days: eva.lastContext?.days || 30,
        hours: eva.lastContext?.hours || null
      }

      const alertBullets = buildAlertsSummary(ctx)

      const text = !content.length
        ? 'No encontré alertas abiertas para este tenant.'
        : `Encontré ${content.length} alertas recientes. La más nueva está en estado ${content[0].status}.`

      eva.addAssistantMessage(text, 'alert', {
        raw: payload,
        meta: {
          items:     content,
          bullets:   alertBullets,
          followUps: buildFollowUps('open-alerts'),
          actions: [
            { key: 'open-context',    label: 'Ver panel',    icon: 'right_panel_open' },
            { key: 'go-alerts-module', label: 'Ir a alertas', icon: 'warning' }
          ]
        }
      })

      eva.setContextPanel(
        'alert', 
        buildAlertsTitle(ctx),
        {
          ...payload,
          evaContext: ctx
        }
      )

      eva.setLastContext({
        intent: 'open-alerts',
        system: ctx.system,
        granularity: ctx.granularity,
        days: ctx.days,
        hours: ctx.hours
      })

      await nextTick()
      scrollMessagesToBottom()
      return
    }

    if (action.key === 'trends') {
      const res = await EvaService.getHourlyInsights({
        hours: 24,
        tz: eva.selectedTz
      })

      const payload = res?.data?.data || {}

      // ── Alcance: global o por sistema ─────────────────────────────────────
      const scopeSystem = payload?.system || eva.selectedSystem || null
      const scopeLabel  = scopeSystem
        ? `del sistema **${scopeSystem}**`
        : 'de **todos los sistemas** (vista global)'

      // ── Buckets: intervalos de tiempo agrupados ───────────────────────────
      const bucketCount  = payload?.buckets?.length ?? payload?.totalBuckets ?? 0
      const totalEvents  = payload?.totalEvents ?? payload?.total ?? 0
      const bucketExpl   = bucketCount > 0
        ? `Analicé ${bucketCount} intervalos de tiempo (buckets) — cada bucket representa ` +
          `una ventana horaria donde se agrupan los eventos para detectar patrones. ` +
          `En total se registraron **${totalEvents} eventos** distribuidos en esos intervalos.`
        : `No se encontraron intervalos con actividad en las últimas 24 horas.`

      // ── Status y señales ──────────────────────────────────────────────────
      const status       = payload?.status || 'OK'
      const statusMsg    = {
        OK:   'Los indicadores están dentro de parámetros normales. ✅',
        WARN: 'Se detectaron señales que merecen atención. ⚠️',
        CRIT: 'Hay indicadores críticos — se recomienda revisión inmediata. 🔴'
      }[status] ?? 'Estado desconocido.'

      // ── Highlights y warnings ─────────────────────────────────────────────
      const highlights   = Array.isArray(payload?.highlights) ? payload.highlights : []
      const warnings     = Array.isArray(payload?.warnings)   ? payload.warnings   : []

      const signalLines  = [
        ...warnings.slice(0, 2).map(w => `⚠️ ${w}`),
        ...highlights.slice(0, 2).map(h => `💡 ${h}`)
      ]

      // ── Texto final compuesto ─────────────────────────────────────────────
      const text = [
        `📊 **Tendencias de las últimas 24 horas** ${scopeLabel}.`,
        '',
        bucketExpl,
        '',
        `**Estado general:** ${statusMsg}`,
        ...(signalLines.length ? ['', ...signalLines] : []),
        '',
        '_Puedes pedir "abre la gráfica" para ver la evolución visual en detalle._'
      ].join('\n')

      eva.addAssistantMessage(text, 'trend', {
        raw: payload,
        meta: {
          severity:        status,
          recommendations: payload?.recommendations || [],
          followUps:       buildFollowUps('trends'),
          actions: [
            { key: 'open-context',       label: 'Ver panel',     icon: 'right_panel_open' },
            { key: 'open-metrics-chart', label: 'Abrir gráfica', icon: 'insights' }
          ]
        }
      })

      eva.setContextPanel('trend', 'Tendencias', payload)

      eva.setLastContext({
        intent:      'trends',
        system:      scopeSystem,
        granularity: 'hourly',
        days:        null,
        hours:       24
      })

      return
    }

    if (action.key === 'metrics-chart') {

      if (!eva.selectedSystem) {
        eva.addAssistantMessage(
          'Aún no tengo un system seleccionado. Espera a que cargue el ctálogo dinámico',
          'text'
        )
        await nextTick()
        scrollMessagesToBottom()
        return 
      }

      const res = await EvaService.getMetricsSeries({
        granularity: eva.selectedGranularity,
        system: eva.selectedSystem,
        days: eva.selectedGranularity === 'daily' ? eva.selectedDays : undefined,
        hours: eva.selectedGranularity === 'hourly' ? eva.selectedHours : undefined,
        tz: eva.selectedTz
      })

      const payload = res?.data?.data || {}
      const points = payload?.points || []

      const ctx = {
        system: payload?.system || eva.selectedSystem,
        granularity: payload?.granularity || eva.selectedGranularity,
        days:
          (payload?.granularity || eva.selectedGranularity) === 'daily'
            ? eva.selectedDays
            : null,
        hours:
          (payload?.granularity || eva.selectedGranularity) === 'hourly'
            ? eva.selectedHours
            : null
      }

      const contextBullets = buildChartSummary(ctx)

      const text = points.length
        ? `Ya preparé la gráfica de ${ctx.system} con ${points.length} puntos.`
        : `No encontré puntos para ${ctx.system} en el rango solicitado.`

      eva.addAssistantMessage(text, 'chart', {
        raw: payload,
        meta: {
          system:      ctx.system,
          granularity: ctx.granularity,
          rangeLabel:  ctx.granularity === 'hourly'
            ? `${ctx.hours || 24} horas`
            : `${ctx.days || 30} días`,
          points:    points.length,
          bullets:   contextBullets,
          followUps: buildFollowUps('metrics-chart'),
          actions: [
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' }
          ]
        }
      })

      eva.setContextPanel(
        'chart', 
        buildChartTitle(ctx),
        {
          ...payload,
          evaContext: ctx
        }
      )

      eva.setLastContext({
        intent: 'metrics-chart',
        system: ctx.system,
        granularity: ctx.granularity,
        days: ctx.granularity === 'daily' ? eva.selectedDays : null,
        hours: ctx.granularity === 'hourly' ? eva.selectedHours : null
      })

      eva.openWorkspace()

      await nextTick()
      scrollMessagesToBottom()
      return
    }

    eva.addAssistantMessage('Acción no implementada.', 'text')
  } catch (error) {
    console.error('EvaWorkspace action error:', error)
    eva.addAssistantMessage('Ocurrió un error al procesar la solicitud.', 'text')
  } finally {
    eva.setLoading(false)
    currentAction.value = null
  }
}

// ── Follow-ups: construye las sugerencias contextuales para un mensaje ────────
function buildFollowUps(action) {
  return getContextualFollowUps(action, {
    system:           eva.selectedSystem,
    granularity:      eva.selectedGranularity,
    days:             eva.selectedDays,
    hours:            eva.selectedHours,
    availableSystems: eva.availableSystem ?? []
  })
}

// ── Cuando el usuario hace clic en un follow-up ───────────────────────────────
async function handleFollowUp(item) {
  if (!item?.prompt) return
  input.value = item.prompt
  await sendMessage()
}

function handleMessageAction(action) {
  console.log('EvaWorkspace -> card action:', action)

  if (!action?.key) return

  if (action.key === 'open-context') {
    return
  }

  if (action.key === 'refresh-daily-summary') {
    handleQuickAction({
      key: 'daily-summary',
      label: 'Resumen diario'
    })
    return
  }

  if (action.key === 'open-metrics-chart') {
    handleQuickAction({
      key: 'metrics-chart',
      label: 'Gráfica por system'
    })
    return
  }

  if (action.key === 'refresh-chart') {
    handleQuickAction({
      key: 'metrics-chart',
      label: 'Gráfica por system'
    })
    return
  }

  if (action.key === 'go-alerts-module') {
    handleQuickAction({
      key: 'open-alerts',
      label: 'Alertas abiertas'
    })
    return
  }
}
</script>

<style scoped>
.eva-workspace {
  background: linear-gradient(180deg, #08111f 0%, #0b1526 100%);
  color: #eaf0ff;
}

.eva-workspace-header {
  min-height: 72px;
  background: rgba(255,255,255,0.03);
}

.eva-workspace-title {
  font-size: 22px;
  font-weight: 700;
  color: #fff;
}

.eva-workspace-subtitle {
  font-size: 13px;
  color: rgba(234,240,255,0.68);
  margin-top: 4px;
}

.eva-workspace-body {
  height: calc(100vh - 73px);
  padding: 16px;
  overflow: hidden;
}

.eva-workspace-grid {
  display: grid;
  grid-template-columns: 1.2fr 1fr;
  gap: 16px;
  height: 100%;
  min-height: 0;
}

.eva-workspace-chat,
.eva-workspace-context {
  min-height: 0;
  background: rgba(255,255,255,0.03);
  border: 1px solid rgba(255,255,255,0.08);
  border-radius: 20px;
  padding: 16px;
  overflow: hidden;
}

.eva-workspace-chat {
  display: flex;
  flex-direction: column;
}

.eva-section-title {
  font-size: 16px;
  font-weight: 700;
  color: #9fc3ff;
}

.eva-chat-scroll {
  display: flex;
  flex-direction: column;
  gap: 10px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;
  padding-right: 8px;
  scroll-behavior: smooth;
}

.eva-chat-scroll::-webkit-scrollbar {
  width: 8px;
}

.eva-chat-scroll::-webkit-scrollbar-track {
  background: rgba(255,255,255,0.04);
  border-radius: 999px;
}

.eva-chat-scroll::-webkit-scrollbar-thumb {
  background: rgba(0,212,255,0.28);
  border-radius: 999px;
}

.eva-chat-footer {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid rgba(255,255,255,0.08);
}

@media (max-width: 1100px) {
  .eva-workspace-grid {
    grid-template-columns: 1fr;
  }

  .eva-workspace-chat,
  .eva-workspace-context {
    min-height: 420px;
  }
}
</style>