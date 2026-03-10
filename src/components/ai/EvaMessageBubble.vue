<template>
    <div :class="wrapperClass">
        <div :class="bubbleClass">
        <div v-if="isAssistant" class="eva-bubble-header">
            <div class="eva-bubble-avatar">
            <q-icon name="auto_awesome" size="14px" />
            </div>
            <div class="eva-bubble-meta">
            <div class="eva-bubble-name">Eva</div>
            <div v-if="messageLabel" class="eva-bubble-tag">{{ messageLabel }}</div>
            </div>
        </div>

        <eva-message-renderer 
            :message="message" 
            @action="emit('action', $event)"
        />

        <div class="eva-message-time">
            {{ timeLabel }}
        </div>
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'
import EvaMessageRenderer from './EvaMessageRenderer.vue'

const props = defineProps({
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

const isAssistant = computed(() => props.message.role === 'assistant')

const wrapperClass = computed(() =>
    props.message.role === 'user'
        ? 'eva-msg-wrapper user'
        : 'eva-msg-wrapper assistant'
)

const bubbleClass = computed(() =>
    props.message.role === 'user'
        ? 'eva-bubble eva-user-bubble'
        : 'eva-bubble eva-assistant-bubble'
)

const timeLabel = computed(() => {
    if (!props.message.createdAt) return ''
    const d = new Date(props.message.createdAt)
    return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
})

const messageLabel = computed(() => {
    if (props.message?.type === 'chart') return 'Gráfica'
    if (props.message?.type === 'insight') return 'Resumen'
    if (props.message?.type === 'alert') return 'Alerta'
    if (props.message?.type === 'trend') return 'Tendencias'
    return null
})
</script>

<style scoped>
.eva-msg-wrapper {
    display: flex;
    width: 100%;
}

.eva-msg-wrapper.user {
    justify-content: flex-end;
}

.eva-msg-wrapper.assistant {
    justify-content: flex-start;
}

.eva-bubble {
    max-width: min(82%, 560px);
    padding: 12px 14px;
    border-radius: 16px;
    font-size: 14px;
    line-height: 1.45;
    transition: all 0.2s ease;
}

.eva-bubble--compact {
    max-width: min(72%, 460px);
    padding: 10px 12px;
    border-radius: 14px;
}

.eva-user-bubble {
    background: linear-gradient(135deg, #1f8cff, #0066ff);
    color: white;
    border-bottom-right-radius: 6px;
    box-shadow: 0 8px 20px rgba(0, 102, 255, 0.22);
}

.eva-assistant-bubble {
    background: rgba(255, 255, 255, 0.05);
    color: #eaf0ff;
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-bottom-left-radius: 6px;
    backdrop-filter: blur(12px);
}

.eva-bubble-header {
    display: flex;
    align-items: center;
    gap: 10px;
    margin-bottom: 8px;
}

.eva-bubble-avatar {
    width: 26px;
    height: 26px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c4dff, #00d4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.eva-bubble-meta {
    display: flex;
    flex-direction: column;
    gap: 2px;
}

.eva-bubble-name {
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
}

.eva-bubble-tag {
    font-size: 11px;
    color: #8fb7ff;
}

.eva-message-text {
    white-space: pre-line;
    word-break: break-word;
}

.eva-message-time {
    margin-top: 8px;
    font-size: 11px;
    opacity: 0.6;
    text-align: right;
}
</style>