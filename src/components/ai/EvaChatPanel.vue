<template>
    <div class="eva-chat-panel">
        <div class="eva-chat-header q-pa-md">
            <div class="text-h6">{{ eva.currentConversation?.title || t('evaWorkspace.currentConversationFallback') }}</div>
            <div class="text-caption text-grey-5">{{ t('evaWorkspace.chatSubtitle') }}</div>
        </div>

        <q-separator dark />

        <div class="eva-chat-messages q-pa-md">
            <EvaMessageBubble
                v-for="msg in eva.currentConversation?.messages || []"
                :key="msg.id"
                :message="msg"
            />
        </div>

        <q-separator dark /> 

        <div class="q-pa-md">
            <EvaQuickActions @action="handleQuickAction" />


            <div class="row q-col-gutter-sm q-mt-md items-center">
                <div class="col">
                    <q-input
                        v-model="input"
                        dark
                        outlined
                        :placeholder="t('evaWorkspace.askPlaceholder')"
                        @keyup.enter="sendMessage"
                    />
                </div>

                <div>
                    <EvaVoiceButton />
                </div>

                <div>
                    <q-btn color="primary" icon="send" round @click="sendMessage" /> 
                </div>
            </div>
        </div>
    </div>
</template>

<script setup>
import { ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaQuickActions from './EvaQuickActions.vue'
import EvaVoiceButton from './EvaVoiceButton.vue'

const eva = useEvaStore()
const input = ref('')
const { t } = useI18n()

async function sendMessage() {
    if (!input.value?.trim()) return

    const text = input.value.trim()
    eva.addUserMessage(text)

    try {
        eva.setLoading(true)

        const lower = text.toLowerCase()

        if (lower.includes('resumen')) {
        const res = await EvaService.getDailyPretty({
            days: 1,
            tz: eva.selectedTz,
            maxTickets: 5
        })

        const pretty = res?.data?.pretty || res?.pretty
        const narrative = pretty?.executiveNarrative || t('evaWorkspace.noExecutiveSummary')
        eva.addAssistantMessage(narrative, 'text', { raw: res })
        eva.setContextPanel('insight', t('evaWorkspace.refreshDailySummary'), res)
        } else if (lower.includes('gráfica') || lower.includes('grafica')) {
        const res = await EvaService.getMetricsSeries({
            granularity: eva.selectedGranularity,
            system: eva.selectedSystem,
            days: eva.selectedGranularity === 'daily' ? eva.selectedDays : undefined,
            hours: eva.selectedGranularity === 'hourly' ? eva.selectedHours : undefined,
            tz: eva.selectedTz
        })

        const points = res?.data?.points || []
        eva.addAssistantMessage(
            points.length
            ? t('evaWorkspace.chartGenerated', { system: eva.selectedSystem })
            : t('evaWorkspace.noDataForSystem', { system: eva.selectedSystem }),
            'text',
            { raw: res }
        )
        eva.setContextPanel('chart', t('evaWorkspace.chartTitle', { system: eva.selectedSystem }), res)
        } else if (lower.includes('alerta')) {
        const res = await EvaService.getAlerts({
            page: 0,
            size: 5,
            granularity: 'daily',
            tz: eva.selectedTz
        })

        const total = res?.data?.content?.length || 0
        eva.addAssistantMessage(t('evaWorkspace.recentAlertsFound', { count: total }), 'text', { raw: res })
        eva.setContextPanel('alert', t('evaWorkspace.openAlerts'), res)
        } else {
        eva.addAssistantMessage(
            t('evaWorkspace.fallbackGuidedAction'),
            'text'
        )
        }
    } catch (error) {
        console.error('Eva chat error:', error)
        eva.addAssistantMessage(t('evaWorkspace.queryError'), 'text')
    } finally {
        eva.setLoading(false)
        input.value = ''
    }
}

async function handleQuickAction(action) {
    eva.addUserMessage(action.label)

    try {
        eva.setLoading(true)

        if (action.key === 'daily-summary') {
        const res = await EvaService.getDailyPretty({
            days: 1,
            tz: eva.selectedTz,
            maxTickets: 5
        })

        console.log('EvaChatPanel -> daily-summary response:', res)

        const payload = res?.data || {}
        const pretty = payload?.pretty || null
        const base = payload?.base || null

        eva.addAssistantMessage(
            pretty?.executiveNarrative || 
                (Array.isArray(base?.executiveSummary) ? base.executiveSummary.join(' ') : t('evaWorkspace.summaryObtained')),
            'text',
            { raw: res }
        )
        eva.setContextPanel('insight', t('evaWorkspace.refreshDailySummary'), payload)
        return
        }

        if (action.key === 'open-alerts') {
        const res = await EvaService.getAlerts({
            page: 0,
            size: 5,
            granularity: 'daily',
            tz: eva.selectedTz
        })

        const total = res?.data?.content?.length || 0
        eva.addAssistantMessage(t('evaWorkspace.recentAlertsFound', { count: total }), 'text', { raw: res })
        eva.setContextPanel('alert', t('evaWorkspace.openAlerts'), res)
        return
        }

        if (action.key === 'trends') {
        const res = await EvaService.getHourlyInsights({
            hours: 24,
            tz: eva.selectedTz
        })

        const dto = res?.data
        eva.addAssistantMessage(
            dto?.warnings?.[0] || dto?.highlights?.[0] || t('evaWorkspace.trendsLoaded'),
            'text',
            { raw: res }
        )
        eva.setContextPanel('trend', t('evaWorkspace.trendsLoaded'), res)
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

        eva.addAssistantMessage(t('evaWorkspace.chartReady', { system: eva.selectedSystem, points: res?.data?.points?.length || 0 }), 'text', {
            raw: res
        })
        eva.setContextPanel('chart', t('evaWorkspace.chartTitle', { system: eva.selectedSystem }), res)
        return
        }

        eva.addAssistantMessage(t('evaWorkspace.actionNotConnected'), 'text')
    } catch (error) {
        console.error(error)
        eva.addAssistantMessage(t('evaWorkspace.queryError'), 'text')
    } finally {
        eva.setLoading(false)
    }
}
</script>


<style scoped>
.eva-chat-panel {
    height: 100%;
    display: flex;
    flex-direction: column;
}

.eva-chat-messages {
    flex: 1;
    overflow: auto;
    display: flex;
    flex-direction: column;
    gap: 12px;
}
</style>
