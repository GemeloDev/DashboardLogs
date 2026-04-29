<template>
    <transition name="eva-typing-fade">
        <div v-if="visible" class="eva-typing-wrapper">
        <div class="eva-typing-bubble">

            <div class="eva-typing-header">
            <div class="eva-typing-avatar">
                <q-icon name="auto_awesome" size="13px" />
            </div>
            <span class="eva-typing-name">Eva</span>
            </div>

            <div class="eva-typing-body">
            <!-- Texto dinámico -->
            <transition name="eva-text-swap" mode="out-in">
                <span :key="currentLabel" class="eva-typing-label">{{ currentLabel }}</span>
            </transition>

            <!-- 3 puntos animados -->
            <span class="eva-dots">
                <span class="eva-dot" />
                <span class="eva-dot" />
                <span class="eva-dot" />
            </span>
            </div>

        </div>
        </div>
    </transition>
</template>

<script setup>
import { ref, watch, onUnmounted } from 'vue'

const props = defineProps({
    // Mostrar u ocultar el indicador
    visible: {
        type: Boolean,
        default: false
    },
    // Acción actual para elegir el mensaje correcto
    // Valores: 'daily-summary' | 'metrics-chart' | 'open-alerts' | 'trends' | 'tickets' | 'stream' | null
    action: {
        type: String,
        default: null
    }
})

// ── Mensajes por acción ────────────────────────────────────────────────────────
const MESSAGES = {
    'daily-summary': [
        'Consultando logs del periodo...',
        'Calculando métricas de errores...',
        'Analizando sistemas activos...',
        'Preparando resumen ejecutivo...',
        'Revisando riesgos y acciones...',
    ],
    'metrics-chart': [
        'Consultando serie histórica...',
        'Agrupando puntos por granularidad...',
        'Calculando error rate...',
        'Preparando datos de la gráfica...',
    ],
    'open-alerts': [
        'Buscando alertas abiertas...',
        'Filtrando por tenant...',
        'Ordenando por severidad...',
    ],
    'trends': [
        'Analizando tendencias horarias...',
        'Detectando patrones en los buckets...',
        'Evaluando señales de riesgo...',
        'Preparando resumen de tendencias...',
    ],
    'tickets': [
        'Buscando errores recurrentes...',
        'Generando borradores de tickets...',
        'Calculando prioridades...',
    ],
    'stream': [
        'Procesando tu solicitud...',
        'Analizando contexto...',
        'Generando respuesta...',
    ],
    default: [
        'Analizando...',
        'Procesando...',
        'Preparando respuesta...',
    ]
}

const currentLabel = ref('')
let intervalId = null
let msgIndex = 0

function getMessages() {
    return MESSAGES[props.action] || MESSAGES.default
}

function startCycle() {
    stopCycle()
    msgIndex = 0
    const msgs = getMessages()
    currentLabel.value = msgs[0]

    intervalId = setInterval(() => {
        msgIndex = (msgIndex + 1) % msgs.length
        currentLabel.value = msgs[msgIndex]
    }, 1800)
}

function stopCycle() {
    if (intervalId) {
        clearInterval(intervalId)
        intervalId = null
    }
}

watch(() => props.visible, (val) => {
    if (val) startCycle()
    else stopCycle()
}, { immediate: true })

// Reiniciar si cambia la acción mientras está visible
watch(() => props.action, () => {
    if (props.visible) startCycle()
})

onUnmounted(stopCycle)
</script>

<style scoped>
.eva-typing-wrapper {
    display: flex;
    justify-content: flex-start;
    width: 100%;
    margin-bottom: 10px;
}

.eva-typing-bubble {
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 16px;
    border-bottom-left-radius: 6px;
    padding: 10px 14px;
    max-width: min(82%, 360px);
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.eva-typing-header {
    display: flex;
    align-items: center;
    gap: 7px;
}

.eva-typing-avatar {
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: linear-gradient(135deg, #7c4dff, #00d4ff);
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    flex-shrink: 0;
}

.eva-typing-name {
    font-size: 12px;
    font-weight: 700;
    color: #ffffff;
}

.eva-typing-body {
    display: flex;
    align-items: center;
    gap: 8px;
}

.eva-typing-label {
    font-size: 13px;
    color: rgba(234, 240, 255, 0.75);
}

/* 3 puntos animados */
.eva-dots {
    display: flex;
    align-items: center;
    gap: 4px;
    flex-shrink: 0;
}

.eva-dot {
    width: 5px;
    height: 5px;
    border-radius: 50%;
    background: #7c9eff;
    animation: eva-dot-bounce 1.2s ease-in-out infinite;
}

.eva-dot:nth-child(1) { animation-delay: 0s;    }
.eva-dot:nth-child(2) { animation-delay: 0.2s;  }
.eva-dot:nth-child(3) { animation-delay: 0.4s;  }

@keyframes eva-dot-bounce {
    0%, 80%, 100% { transform: translateY(0);    opacity: 0.4; }
    40%            { transform: translateY(-5px); opacity: 1;   }
}

/* Transición de entrada/salida del indicador completo */
.eva-typing-fade-enter-active,
.eva-typing-fade-leave-active {
    transition: opacity 0.2s ease, transform 0.2s ease;
}
.eva-typing-fade-enter-from,
.eva-typing-fade-leave-to {
    opacity: 0;
    transform: translateY(6px);
}

/* Transición del texto al cambiar */
.eva-text-swap-enter-active,
.eva-text-swap-leave-active {
    transition: opacity 0.25s ease, transform 0.25s ease;
}
.eva-text-swap-enter-from {
    opacity: 0;
    transform: translateY(4px);
}
.eva-text-swap-leave-to {
    opacity: 0;
    transform: translateY(-4px);
}
</style>