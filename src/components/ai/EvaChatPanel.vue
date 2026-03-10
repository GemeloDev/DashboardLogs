<template>
    <div class="eva-chat-panel">
        <div class="eva-chat-header q-pa-md">
            <div class="text-h6">{{ eva.currentConversation?.title || 'Eva Workspace' }}</div>
            <div class="text-caption text-grey-5">Asistente Inteligente Operacional</div>
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
                        placeholder="Pregúntale algo a Eva..."
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
import { useEvaStore } from 'src/stores/eva-store'
import { EvaService } from 'src/services/eva.service'
import EvaMessageBubble from './EvaMessageBubble.vue'
import EvaQuickActions from './EvaQuickActions.vue'
import EvaVoiceButton from './EvaVoiceButton.vue'

const eva = useEvaStore()
const input = ref('')

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
        const narrative = pretty?.executiveNarrative || 'No se obtuvo resumen.'
        eva.addAssistantMessage(narrative, 'text', { raw: res })
        eva.setContextPanel('insight', 'Resumen diario', res)
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
            ? `Ya generé la gráfica de ${eva.selectedSystem}.`
            : `No encontré datos para ${eva.selectedSystem}.`,
            'text',
            { raw: res }
        )
        eva.setContextPanel('chart', `Gráfica: ${eva.selectedSystem}`, res)
        } else if (lower.includes('alerta')) {
        const res = await EvaService.getAlerts({
            page: 0,
            size: 5,
            granularity: 'daily',
            tz: eva.selectedTz
        })

        const total = res?.data?.content?.length || 0
        eva.addAssistantMessage(`Encontré ${total} alertas recientes.`, 'text', { raw: res })
        eva.setContextPanel('alert', 'Alertas abiertas', res)
        } else {
        eva.addAssistantMessage(
            'Entendí tu mensaje, pero por ahora usa una acción guiada como resumen, alertas o gráfica.',
            'text'
        )
        }
    } catch (error) {
        console.error('Eva chat error:', error)
        eva.addAssistantMessage('Ocurrió un error al consultar a Eva.', 'text')
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
                (Array.isArray(base?.executiveSummary) ? base.executiveSummary.join(' ') : 'Resumen obtenido.'),
            'text',
            { raw: res }
        )
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

        const total = res?.data?.content?.length || 0
        eva.addAssistantMessage(`Encontré ${total} alertas recientes.`, 'text', { raw: res })
        eva.setContextPanel('alert', 'Alertas abiertas', res)
        return
        }

        if (action.key === 'trends') {
        const res = await EvaService.getHourlyInsights({
            hours: 24,
            tz: eva.selectedTz
        })

        const dto = res?.data
        eva.addAssistantMessage(
            dto?.warnings?.[0] || dto?.highlights?.[0] || 'Tendencias obtenidas.',
            'text',
            { raw: res }
        )
        eva.setContextPanel('trend', 'Tendencias', res)
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

        eva.addAssistantMessage(`Ya preparé la gráfica de ${eva.selectedSystem}.`, 'text', {
            raw: res
        })
        eva.setContextPanel('chart', `Gráfica: ${eva.selectedSystem}`, res)
        return
        }

        eva.addAssistantMessage('Acción todavía no conectada.', 'text')
    } catch (error) {
        console.error(error)
        eva.addAssistantMessage('Ocurrió un error al consultar a Eva.', 'text')
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