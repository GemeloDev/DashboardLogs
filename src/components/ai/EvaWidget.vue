<template>
  <transition name="eva-fade">
    <q-card v-if="eva.isWidgetOpen" class="eva-widget">
      <!-- Header -->
      <q-card-section class="eva-header row items-center no-wrap">
        <div class="eva-avatar">
          <q-icon name="auto_awesome" size="20px" />
        </div>

        <div class="col q-ml-md">
          <div class="eva-title">Eva</div>
          <div class="eva-status">
            <span class="eva-status-dot" />
            En línea
          </div>
        </div>

        <q-btn flat round dense icon="open_in_full" @click="eva.openWorkspace()" />
        <q-btn flat round dense icon="close" @click="eva.closeWidget()" />
      </q-card-section>

      <q-separator dark />

      <div class="eva-widget-content">
        <!-- Body -->
        <q-card-section ref="messagesScrollRef" class="eva-widget-body">
          <EvaQuickActions
            compact
            :actions="widgetQuickActions"
            @action="handleQuickAction"
          />

          <div class="q-mt-md eva-mini-messages">
            <EvaMessageBubble
              v-for="msg in lastMessages"
              :key="msg.id"
              :message="msg"
              compact
              @action="handleMessageAction"
            />
          </div>
        </q-card-section>

        <q-separator dark />

        <!-- Footer -->
        <q-card-section class="eva-input-section">
          <EvaSuggestionsBar
            v-if="widgetSuggestions.length"
            :suggestions="widgetSuggestions"
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
            <EvaVoiceButton />
            <q-btn round color="primary" icon="send" @click="sendMessage" />
          </div>
        </q-card-section>
      </div>
    </q-card>
  </transition>
</template>

<script setup>
import { computed, nextTick, ref, watch, onMounted } from 'vue'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import { parseEvaCommand } from 'src/services/eva-command-parser'
import { getEvaSuggestions } from 'src/services/eva-suggestions'
import { loadEvaSystems } from 'src/composables/useEvaSystems'
import { buildChartTitle, buildChartSummary, buildAlertsSummary, buildAlertsTitle } from 'src/services/eva-context-labels'

import EvaQuickActions from './EvaQuickActions.vue'
import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaVoiceButton from './EvaVoiceButton.vue'
import EvaSuggestionsBar from './EvaSuggestionsBar.vue'

const eva = useEvaStore()
const input = ref('')
const messagesScrollRef = ref(null)

onMounted(async () => {
  await loadEvaSystems()
})

const allMessages = computed(() => eva.currentConversation?.messages || [])

const lastMessages = computed(() => {
  return allMessages.value.slice(-3)
})

const widgetSuggestions = computed(() => {
  const text = input.value.trim()
  if (!text) return []
  return getEvaSuggestions(text).slice(0, 3)
})

const widgetQuickActions = computed(() => [
  { key: 'daily-summary', label: 'Resumen diario', icon: 'summarize' },
  { key: 'open-alerts', label: 'Alertas abiertas', icon: 'warning' },
  { key: 'metrics-chart', label: 'Gráfica por system', icon: 'insights' }
])

watch(
  () => allMessages.value.map(m => m.id).join('|'),
  async () => {
    await nextTick()
    scrollMessagesToBottom()
  },
  { immediate: true }
)

function scrollMessagesToBottom() {
  const el = messagesScrollRef.value
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
  if (!text) return

  eva.addUserMessage(text)

  const command = parseEvaCommand(text, {
    availableSystems: eva.availableSystems,
    lastContext: eva.lastContext
  })

  if (command) {
    if (command.system) {
      eva.setSelectedSystem(command.system)
    }

    if (command.granularity) {
      eva.setSelectedGranularity(command.granularity)
    }

    if (typeof command.days === 'number' && command.days > 0) {
      eva.setSelectedDays(command.days)
    }

    if (typeof command.hours === 'number' && command.hours > 0) {
      eva.setSelectedHours(command.hours)
    }

    await handleQuickAction({
      key: command.action,
      label: text,
      skipUserMessage: true,
      fromInput: true
    })

    input.value = ''
    await nextTick()
    scrollMessagesToBottom()
    return
  }

  eva.addAssistantMessage(
    'No entendí la solicitud. Puedes pedir: resumen diario, alertas abiertas o una gráfica por system.',
    'text'
  )

  input.value = ''
  await nextTick()
  scrollMessagesToBottom()
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
        maxTickets: 5,
        system: eva.selectedSystem || undefined   // ← filtrar por sistema del usuario
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
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' }
          ]
        }
      })

      eva.setContextPanel('insight', 'Resumen diario', payload)
      await nextTick()
      scrollMessagesToBottom()
      return
    }

    if (action.key === 'open-alerts') {
      const last24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString()
      const res = await EvaService.getAlerts({
        page: 0,
        size: 10,
        state: 'OPEN',
        granularity: 'daily',
        from: last24h,        // ← últimas 24h
        tz: eva.selectedTz
      })

      const payload = res?.data?.data || {}
      const content = payload?.content || []

      const ctx = {
        system: eva.lastContext?.system || eva.selectedSystem || null,
        granularity: eva.lastContext?.granularity || 'daily',
        days: 1,
        hours: 24,
        rangeLabel: '1 día'  // ← singular explícito
      }

      const alertBullets = buildAlertsSummary(ctx)

      const text = !content.length
        ? 'No encontré alertas abiertas para este tenant.'
        : `Encontré ${content.length} ${content.length === 1 ? 'alerta reciente' : 'alertas recientes'}. La más nueva está en estado ${content[0].status}.`

      eva.addAssistantMessage(text, 'alert', {
        raw: payload,
        meta: {
          items: content,
          bullets: alertBullets,
          actions: [
            { key: 'open-context', label: 'Ver panel', icon: 'right_panel_open' },
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
          system: ctx.system,
          granularity: ctx.granularity,
          rangeLabel: ctx.granularity === 'hourly'
            ? `${ctx.hours || 24} horas`
            : `${ctx.days || 30} días`,
          points: points.length,
          bullets: contextBullets,
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
    await nextTick()
    scrollMessagesToBottom()
  } catch (error) {
    console.error('Eva action error:', error)
    eva.addAssistantMessage('Lo siento, ocurrió un error al procesar tu solicitud.', 'text')
    await nextTick()
    scrollMessagesToBottom()
  } finally {
    eva.setLoading(false)
  }
}

function handleMessageAction(action) {
  if (!action?.key) return

  if (action.key === 'open-context') {
    eva.openWorkspace()
    return
  }

  if (action.key === 'go-alerts-module') {
    // NO repetir el mensaje: solo abrir workspace con el contexto actual
    eva.setContextPanel(
      'alert',
      eva.contextPanel?.title || 'Alertas abiertas',
      eva.contextPanel?.payload || null
    )
    eva.openWorkspace()
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
  }
}
</script>

<style scoped>
.eva-widget {
  position: fixed;
  right: 24px;
  bottom: 96px;
  width: 400px;
  height: 620px;
  z-index: 3999;
  background: linear-gradient(180deg, #0f1b2d 0%, #0b1220 100%);
  color: #eaf0ff;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 20px;
  box-shadow:
    0 20px 60px rgba(0, 0, 0, 0.4),
    0 0 30px rgba(124, 77, 255, 0.15);
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.eva-header {
  min-height: 68px;
  flex-shrink: 0;
}

.eva-widget-content {
  display: flex;
  flex-direction: column;
  min-height: 0;
  flex: 1;
}

.eva-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #7c4dff, #00d4ff);
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
}

.eva-title {
  font-size: 16px;
  font-weight: 700;
}

.eva-status {
  font-size: 12px;
  color: rgba(234, 240, 255, 0.7);
  display: flex;
  align-items: center;
  gap: 6px;
}

.eva-status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: #35d07f;
  display: inline-block;
}

.eva-widget-body {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding-bottom: 8px;
}

.eva-mini-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eva-input-section {
  flex-shrink: 0;
  padding-top: 10px;
  background: rgba(8, 15, 28, 0.98);
}

.eva-fade-enter-active,
.eva-fade-leave-active {
  transition: all 0.25s ease;
}

.eva-fade-enter-from,
.eva-fade-leave-to {
  opacity: 0;
  transform: translateY(12px);
}
</style>
