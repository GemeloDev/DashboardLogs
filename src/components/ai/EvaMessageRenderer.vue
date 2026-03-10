<template>
    <div>
        <EvaInsightCard
        v-if="message.type === 'insight'"
        :message="message"
        @action="emit('action', $event)"
        />

        <EvaTrendCard
        v-else-if="message.type === 'trend'"
        :message="message"
        @action="emit('action', $event)"
        />

        <EvaAlertCard
        v-else-if="message.type === 'alert'"
        :message="message"
        @action="emit('action', $event)"
        />

        <EvaChartCard
        v-else-if="message.type === 'chart'"
        :message="message"
        @action="emit('action', $event)"
        />

        <div v-else class="eva-message-text-default">
        {{ message.content }}
        </div>
    </div>
</template>

<script setup>
import EvaInsightCard from './cards/EvaInsightCard.vue'
import EvaTrendCard from './cards/EvaTrendCard.vue'
import EvaAlertCard from './cards/EvaAlertCard.vue'
import EvaChartCard from './cards/EvaChartCard.vue'

defineProps({
    message: {
        type: Object,
        required: true
    },
    compact: {
        type: Boolean,
        default: false
    }
})

const emit = defineEmits(['action'])
</script>

<style scoped>
.eva-message-text-default {
    white-space: pre-line;
    word-break: break-word;
}
</style>