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
          <div class="eva-workspace-title">{{ t('evaWorkspace.workspaceTitle') }}</div>
          <div class="eva-workspace-subtitle">
            {{ t('evaWorkspace.workspaceSubtitle') }}
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
          <div class="eva-workspace-chat">
            <div class="eva-section-title q-mb-md">{{ t('evaWorkspace.conversationTitle') }}</div>

            <div ref="chatScrollRef" class="eva-chat-scroll">
              <EvaMessageBubble
                v-for="msg in messages"
                :key="msg.id"
                :message="msg"
                compact
                @action="handleMessageAction"
              />

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
                  :placeholder="t('evaWorkspace.inputPlaceholder')"
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
import { useI18n } from 'vue-i18n'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import { parseEvaCommand, extractContext } from 'src/services/eva-command-parser'
import { getEvaSuggestions } from 'src/services/eva-suggestions'
import { loadEvaSystems } from 'src/composables/useEvaSystems'
import { useEvaStream } from 'src/services/useEvaStream'
import { buildExecutivePresentation } from 'src/services/eva-summary-presenter'
import {
  buildChartTitle,
  buildChartSummary,
  buildAlertsTitle,
  buildAlertsSummary,
} from 'src/services/eva-context-labels'

import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaContextPanel from './EvaContextPanel.vue'
import EvaSuggestionsBar from './EvaSuggestionsBar.vue'
import EvaTypingIndicator from './EvaTypingIndicator.vue'

const eva = useEvaStore()
const { t } = useI18n()
const chatScrollRef = ref(null)
const input = ref('')
const currentAction = ref(null)
const { streamMessage, isStreaming } = useEvaStream()

onMounted(async () => {
  await loadEvaSystems()
})

const workspaceOpen = computed({
  get: () => eva.isWorkspaceOpen,
  set: (val) => {
    if (!val) eva.closeWorkspace()
  },
})

const messages = computed(() => eva.currentConversation?.messages || [])
const suggestions = computed(() => getEvaSuggestions(input.value))

watch(
  () => messages.value.length,
  async () => {
    await nextTick()
    scrollMessagesToBottom()
  },
  { immediate: true },
)

watch(
  () => eva.loading,
  async () => {
    await nextTick()
    await nextTick()
    scrollMessagesToBottom()
  },
)

function scrollMessagesToBottom() {
  const el = chatScrollRef.value
  if (!el) return
  requestAnimationFrame(() => {
    el.scrollTop = el.scrollHeight
  })
}

function formatRangeLabel(ctx) {
  if (ctx.granularity === 'hourly') {
    return t('evaWorkspace.hoursRange', { count: ctx.hours || 24 })
  }

  const count = ctx.days || 30
  return t(count === 1 ? 'evaWorkspace.daysRangeOne' : 'evaWorkspace.daysRangeOther', { count })
}

async function handleSuggestionSelect(item) {
  if (!item?.prompt) return
  input.value = item.prompt
  await sendMessage()
}

async function sendMessage() {
  const text = input.value.trim()
  if (!text || isStreaming.value) return

  eva.addUserMessage(text)
  input.value = ''

  const command = parseEvaCommand(text, extractContext(eva))

  if (command) {
    if (command.system) eva.setSelectedSystem(command.system)
    if (command.granularity) eva.setSelectedGranularity(command.granularity)
    if (typeof command.days === 'number' && command.days > 0) eva.setSelectedDays(command.days)
    if (typeof command.hours === 'number' && command.hours > 0) eva.setSelectedHours(command.hours)

    eva.setLastContext({
      intent: command.action,
      system: command.system ?? eva.selectedSystem,
      granularity: command.granularity ?? eva.selectedGranularity,
      days: command.days ?? eva.selectedDays,
      hours: command.hours ?? eva.selectedHours,
    })

    if (['daily-summary', 'metrics-chart', 'trends', 'open-alerts'].includes(command.action)) {
      currentAction.value = command.action
      await handleQuickAction({
        key: command.action,
        label: text,
        skipUserMessage: true,
        fromInput: true,
      })
      currentAction.value = null
      await nextTick()
      scrollMessagesToBottom()
      return
    }

    currentAction.value = 'stream'
    try {
      await streamMessage({
        message: text,
        system: eva.selectedSystem,
        granularity: eva.selectedGranularity,
        days: eva.selectedDays,
        hours: eva.selectedHours,
        tz: eva.selectedTz,
        type: 'text',
      })
    } catch (err) {
      console.error('Eva stream error:', err)
    }
    currentAction.value = null

    await nextTick()
    scrollMessagesToBottom()
    return
  }

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
        maxTickets: 5,
        system: eva.selectedSystem || undefined,
      })

      const payload = res?.data?.data || res?.data || {}
      const presentation = buildExecutivePresentation(payload, t('evaWorkspace.noExecutiveSummary'))

<<<<<<< HEAD
      const narrative = pretty?.executiveNarrative
      const narrativeValida = narrative && narrative !== 'string' && narrative.trim().length > 15

      const summaryText =
        (narrativeValida ? narrative : null) ||
        (Array.isArray(base?.executiveSummary) && base.executiveSummary.length > 0
          ? base.executiveSummary.join('\n')
          : null) ||
        (Array.isArray(pretty?.executiveBullets) && pretty.executiveBullets.length > 0
          ? pretty.executiveBullets.join('\n')
          : null) ||
        'No se obtuvo resumen.'
        pretty?.executiveNarrative ||
        (Array.isArray(base?.executiveSummary) ? base.executiveSummary.join(' ') : null) ||
        t('evaWorkspace.noExecutiveSummary')

      eva.addAssistantMessage(summaryText, 'insight', {
=======
      eva.addAssistantMessage(presentation.narrative, 'insight', {
>>>>>>> dev-jossu
        raw: payload,
        meta: {
          bullets: presentation.bullets,
          highlights: presentation.bullets,
          recommendations: presentation.recommendations,
          actions: [
            { key: 'open-context', label: t('common.seeData'), icon: 'right_panel_open' },
            { key: 'refresh-daily-summary', label: t('common.update'), icon: 'refresh' },
          ],
        },
      })

      eva.setContextPanel('insight', t('evaWorkspace.refreshDailySummary'), payload)

      eva.setLastContext({
        intent: 'daily-summary',
        system: eva.selectedSystem,
        granularity: 'daily',
        days: 1,
        hours: null,
      })

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
        from: last24h,
        tz: eva.selectedTz,
      })

      const payload = res?.data?.data || {}
      const content = payload?.content || []

      const ctx = {
        system: eva.lastContext?.system || eva.selectedSystem || null,
        granularity: eva.lastContext?.granularity || 'daily',
        days: 1,
        hours: 24,
        rangeLabel: t('evaWorkspace.rangeLabelOneDay'),
      }

      const alertBullets = buildAlertsSummary(ctx)
      const latestStatus = content[0]?.status || t('evaWorkspace.notAvailable')

      const text = !content.length
        ? t('evaWorkspace.noOpenAlerts')
        : content.length === 1
          ? t('evaWorkspace.oneRecentAlert', { status: latestStatus })
          : t('evaWorkspace.manyRecentAlerts', { count: content.length, status: latestStatus })

      eva.addAssistantMessage(text, 'alert', {
        raw: payload,
        meta: {
          items: content,
          bullets: alertBullets,
          actions: [
            { key: 'open-context', label: t('common.seeData'), icon: 'right_panel_open' },
            { key: 'go-alerts-module', label: t('evaWorkspace.openAlerts'), icon: 'warning' },
          ],
        },
      })

      eva.setContextPanel('alert', buildAlertsTitle(ctx), {
        ...payload,
        evaContext: ctx,
      })

      eva.setLastContext({
        intent: 'open-alerts',
        system: ctx.system,
        granularity: ctx.granularity,
        days: ctx.days,
        hours: ctx.hours,
      })

      await nextTick()
      scrollMessagesToBottom()
      return
    }

    if (action.key === 'trends') {
      const res = await EvaService.getHourlyInsights({
        hours: 24,
        tz: eva.selectedTz,
        system: eva.selectedSystem || undefined,
      })

      const payload = res?.data?.data || {}
      const scopeSystem = payload?.system || eva.selectedSystem || null
      const bucketCount = payload?.buckets?.length ?? payload?.totalBuckets ?? 0
      const totalEvents = payload?.totalEvents ?? payload?.total ?? 0
      const bucketExpl = bucketCount > 0
        ? t('evaWorkspace.bucketSummary', { count: bucketCount, total: totalEvents })
        : t('evaWorkspace.bucketEmpty')

      const status = payload?.status || 'OK'
      const statusMsg = {
        OK: t('evaWorkspace.statusOk'),
        WARN: t('evaWorkspace.statusWarn'),
        CRIT: t('evaWorkspace.statusCrit'),
      }[status] ?? t('evaWorkspace.statusUnknown')

      const highlights = Array.isArray(payload?.highlights) ? payload.highlights : []
      const warnings = Array.isArray(payload?.warnings) ? payload.warnings : []

      const signalLines = [
        ...warnings.slice(0, 2).map((w) => `• ${w}`),
        ...highlights.slice(0, 2).map((h) => `• ${h}`),
      ]

      const text = [
        scopeSystem
          ? t('evaWorkspace.trendsHeaderSystem', { system: scopeSystem })
          : t('evaWorkspace.trendsHeaderGlobal'),
        '',
        bucketExpl,
        '',
        `**${t('evaWorkspace.overallStatus')}** ${statusMsg}`,
        ...(signalLines.length ? ['', ...signalLines] : []),
        '',
        `_${t('evaWorkspace.trendsFooterHint')}_`,
      ].join('\n')

      eva.addAssistantMessage(text, 'trend', {
        raw: payload,
        meta: {
          severity: status,
          recommendations: payload?.recommendations || [],
          actions: [
            { key: 'open-context', label: t('common.seeData'), icon: 'right_panel_open' },
            { key: 'open-metrics-chart', label: t('evaWorkspace.openMetricsChart'), icon: 'insights' },
          ],
        },
      })

      eva.setContextPanel('trend', t('evaWorkspace.trendsLoaded'), payload)

      eva.setLastContext({
        intent: 'trends',
        system: scopeSystem,
        granularity: 'hourly',
        days: null,
        hours: 24,
      })

      return
    }

    if (action.key === 'metrics-chart') {
      if (!eva.selectedSystem) {
        eva.addAssistantMessage(t('evaWorkspace.noSelectedSystem'), 'text')
        await nextTick()
        scrollMessagesToBottom()
        return
      }

      const res = await EvaService.getMetricsSeries({
        granularity: eva.selectedGranularity,
        system: eva.selectedSystem,
        days: eva.selectedGranularity === 'daily' ? eva.selectedDays : undefined,
        hours: eva.selectedGranularity === 'hourly' ? eva.selectedHours : undefined,
        tz: eva.selectedTz,
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
            : null,
      }

      const contextBullets = buildChartSummary(ctx)
      const text = points.length
        ? t('evaWorkspace.chartReady', { system: ctx.system, points: points.length })
        : t('evaWorkspace.chartEmpty', { system: ctx.system })

      eva.addAssistantMessage(text, 'chart', {
        raw: payload,
        meta: {
          system: ctx.system,
          granularity: ctx.granularity,
          rangeLabel: formatRangeLabel(ctx),
          points: points.length,
          bullets: contextBullets,
          actions: [
            { key: 'open-context', label: t('common.seeData'), icon: 'right_panel_open' },
          ],
        },
      })

      eva.setContextPanel('chart', buildChartTitle(ctx), {
        ...payload,
        evaContext: ctx,
      })

      eva.setLastContext({
        intent: 'metrics-chart',
        system: ctx.system,
        granularity: ctx.granularity,
        days: ctx.granularity === 'daily' ? eva.selectedDays : null,
        hours: ctx.granularity === 'hourly' ? eva.selectedHours : null,
      })

      eva.openWorkspace()

      await nextTick()
      scrollMessagesToBottom()
      return
    }

    eva.addAssistantMessage(t('evaWorkspace.actionNotImplemented'), 'text')
  } catch (error) {
    console.error('EvaWorkspace action error:', error)
    eva.addAssistantMessage(t('evaWorkspace.requestProcessingError'), 'text')
  } finally {
    eva.setLoading(false)
    currentAction.value = null
  }
}

function handleMessageAction(action) {
  if (!action?.key) return

  if (action.key === 'open-context') return

  if (action.key === 'refresh-daily-summary') {
    handleQuickAction({
      key: 'daily-summary',
      label: t('evaWorkspace.refreshDailySummary'),
    })
    return
  }

  if (action.key === 'open-metrics-chart' || action.key === 'refresh-chart') {
    handleQuickAction({
      key: 'metrics-chart',
      label: t('evaWorkspace.openMetricsChart'),
    })
    return
  }

  if (action.key === 'go-alerts-module') {
    handleQuickAction({
      key: 'open-alerts',
      label: t('evaWorkspace.openAlerts'),
    })
  }
}
</script>

<style scoped>
.eva-workspace {
  background: linear-gradient(180deg, #08111f 0%, #0b1526 100%);
  color: #eaf0ff;
  height: 100dvh;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.eva-workspace-header {
  flex: 0 0 auto;
  min-height: 72px;
  background: rgba(255,255,255,0.03);
  padding-top: calc(16px + env(safe-area-inset-top, 0px));
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
  flex: 1 1 auto;
  min-height: 0;
  padding: 16px;
  overflow: hidden;
  padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px));
}

.eva-workspace-grid {
  display: grid;
  grid-template-columns: minmax(380px, 0.78fr) minmax(640px, 1.55fr);
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
<<<<<<< HEAD
</style>
=======

@media (max-width: 599px) {
  .eva-workspace-header {
    align-items: flex-start;
    min-height: calc(86px + env(safe-area-inset-top, 0px));
  }

  .eva-workspace-title {
    font-size: 20px;
    line-height: 1.15;
  }

  .eva-workspace-body {
    padding: 14px;
    padding-bottom: calc(14px + env(safe-area-inset-bottom, 0px));
    overflow-y: auto;
  }

  .eva-workspace-chat,
  .eva-workspace-context {
    min-height: min(520px, calc(100dvh - 160px));
    padding: 14px;
  }
}
</style>
>>>>>>> dev-jossu
