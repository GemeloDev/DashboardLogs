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
                  @keyup.enter="sendMessage"
                />
                <q-btn
                  round
                  color="primary"
                  icon="send"
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
import { computed, nextTick, ref, watch } from 'vue'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import { parseEvaCommand } from 'src/services/eva-command-parser'
import { getEvaSuggestions } from 'src/services/eva-suggestions'

import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaContextPanel from './EvaContextPanel.vue'
import EvaSuggestionsBar from './EvaSuggestionsBar.vue'

const eva = useEvaStore()
const chatScrollRef = ref(null)
const input = ref('')

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
    const el = chatScrollRef.value
    if (!el) return
    el.scrollTop = el.scrollHeight
  },
  { immediate: true }
)

async function handleSuggestionSelect(item) {
  if (!item?.prompt) return
  input.value = item.prompt
  await sendMessage()
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text) return

  eva.addUserMessage(text)

  const command = parseEvaCommand(text)

  if (command) {
    if (command.system) {
      eva.setSelectedSystem(command.system)
    }

    if (command.days) {
      eva.setSelectedDays(command.days)
      eva.setSelectedGranularity('daily')
    }

    if (command.hours) {
      eva.setSelectedHours(command.hours)
      eva.setSelectedGranularity('hourly')
    }

    await handleQuickAction({
      key: command.action,
      label: text,
      skipUserMessage: true
    })

    input.value = ''
    return
  }

  eva.addAssistantMessage(
    'No entendí la solicitud. Puedes pedir: resumen diario, alertas abiertas, tendencias o una gráfica.',
    'text'
  )

  input.value = ''
}

async function handleQuickAction(action) {
  if (!action?.key) return

  try {
    if (!action?.skipUserMessage && action?.label) {
      eva.addUserMessage(action.label)
    }

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
          bullets: pretty?.executiveBullets || base?.executiveSummary || [],
          actions: [
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' },
            { key: 'refresh-daily-summary', label: 'Actualizar', icon: 'refresh' }
          ]
        }
      })

      eva.setContextPanel('insight', 'Resumen diario', payload)
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

      const text = !content.length
        ? 'No encontré alertas abiertas para este tenant.'
        : `Encontré ${content.length} alertas recientes. La más nueva está en estado ${content[0].status}.`

      eva.addAssistantMessage(text, 'alert', {
        raw: payload,
        meta: {
          items: content,
          actions: [
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' },
            { key: 'go-alerts-module', label: 'Ir a alertas', icon: 'warning' }
          ]
        }
      })

      eva.setContextPanel('alert', 'Alertas abiertas', payload)
      return
    }

    if (action.key === 'trends') {
      const res = await EvaService.getHourlyInsights({
        hours: 24,
        tz: eva.selectedTz
      })

      const payload = res?.data?.data || {}
      const text =
        payload?.warnings?.[0] ||
        payload?.highlights?.[0] ||
        'Ya consulté las tendencias de las últimas 24 horas.'

      eva.addAssistantMessage(text, 'trend', {
        raw: payload,
        meta: {
          severity: payload?.status || 'INFO',
          recommendations: payload?.recommendations || [],
          actions: [
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' },
            { key: 'open-metrics-chart', label: 'Abrir gráfica', icon: 'insights' }
          ]
        }
      })

      eva.setContextPanel('trend', 'Tendencias', payload)
      return
    }

    if (action.key === 'metrics-chart') {
      const res = await EvaService.getMetricsSeries({
        granularity: eva.selectedGranularity,
        system: eva.selectedSystem,
        days: eva.selectedGranularity === 'daily' ? eva.selectedDays : undefined,
        hours: eva.selectedGranularity === 'hourly' ? eva.selectedHours : undefined,
        tz: eva.selectedTz
      })

      const payload = res?.data?.data || {}
      const points = payload?.points || []

      const text = points.length
        ? `Ya preparé la gráfica de ${payload.system || eva.selectedSystem} con ${points.length} puntos.`
        : `No encontré puntos para ${eva.selectedSystem} en el rango solicitado.`

      eva.addAssistantMessage(text, 'chart', {
        raw: payload,
        meta: {
          system: payload?.system || eva.selectedSystem,
          points: points.length,
          actions: [
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' },
            { key: 'refresh-chart', label: 'Actualizar', icon: 'refresh' }
          ]
        }
      })

      eva.setContextPanel('chart', `Gráfica: ${payload.system || eva.selectedSystem}`, payload)
      return
    }

    eva.addAssistantMessage('Acción no implementada.', 'text')
  } catch (error) {
    console.error('EvaWorkspace action error:', error)
    eva.addAssistantMessage('Ocurrió un error al procesar la solicitud.', 'text')
  } finally {
    eva.setLoading(false)
  }
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