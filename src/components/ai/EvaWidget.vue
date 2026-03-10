<template>
  <transition name="eva-fade">
    <q-card v-if="eva.isWidgetOpen" class="eva-widget">
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
        <q-card-section class="eva-widget-body">
          <EvaQuickActions compact @action="handleQuickAction" />

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

        <q-card-section class="eva-input-section">
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
            <EvaVoiceButton />
            <q-btn round color="primary" icon="send" @click="sendMessage" />
          </div>
        </q-card-section>
      </div>
    </q-card>
  </transition>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import { parseEvaCommand } from 'src/services/eva-command-parser'
import { getEvaSuggestions } from 'src/services/eva-suggestions'

import EvaQuickActions from './EvaQuickActions.vue'
import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaVoiceButton from './EvaVoiceButton.vue'
import EvaSuggestionsBar from './EvaSuggestionsBar.vue'

const eva = useEvaStore()
const input = ref('')

const lastMessages = computed(() => {
  const msgs = eva.currentConversation?.messages || []
  return msgs.slice(-3)
})

const suggestions = computed(() => getEvaSuggestions(input.value))

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
  console.log('Eva -> action clicked:', action)

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
    console.error('Eva action error:', error)
    eva.addAssistantMessage('Lo siento, ocurrió un error al procesar tu solicitud.', 'text')
  } finally {
    eva.setLoading(false)
  }
}

function handleMessageAction(action) {
  console.log('Eva -> card action:', action)

  if (!action?.key) return

  if (action.key === 'open-context') {
    eva.openWorkspace()
    return
  }

  if (action.key === 'refresh-daily-summary') {
    handleQuickAction({ key: 'daily-summary', label: 'Resumen diario' })
    return
  }

  if (action.key === 'open-metrics-chart') {
    handleQuickAction({ key: 'metrics-chart', label: 'Gráfica por system' })
    return
  }

  if (action.key === 'refresh-chart') {
    handleQuickAction({ key: 'metrics-chart', label: 'Gráfica por system' })
    return
  }

  if (action.key === 'go-alerts-module') {
    handleQuickAction({ key: 'open-alerts', label: 'Alertas abiertas' })
    return
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
}

.eva-mini-messages {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eva-input-section {
  flex-shrink: 0;
  padding-top: 10px;
  background: rgba(8, 15, 28, 0.96);
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