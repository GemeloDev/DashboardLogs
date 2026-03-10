<template>
    <div class="eva-card">
        <div class="eva-card-title">Gráfica generada</div>

        <div class="eva-chart-meta">
            <div><strong>System:</strong> {{ system }}</div>
            <div><strong>Puntos:</strong> {{ points }}</div>
        </div>

        <div class="eva-card-text">
        {{ message.content }}
        </div>

        <div v-if="visibleBullets.length" class="eva-card-actions">
            <q-btn 
                v-for="action in visibleBullets"
                :key="action.key"
                outline
                dense
                no-caps
                color="primary"
                :icon="action.icon"
                :label="action.label"
                @click="$emit('action', action)"
            />
        </div>
    </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
    message: {
        type: Object,
        required: true
    }
})

defineEmits(['action'])

const bullets = computed(() => props.message?.meta?.bullets || [])
const system = computed(() => props.message?.meta?.system || 'N/D')
const points = computed(() => props.message?.meta?.points || 0)
//const actions = computed(() => props.message?.meta?.actions || [])

const visibleBullets = computed(() => {
    return props.compact ? bullets.value.slice(0, 2) : bullets.value
})
</script>

<style scoped>
.eva-card {
    display: flex;
    flex-direction: column;
    gap: 10px;
}

.eva-card--compact {
    gap: 8px;
}

.eva-card-title {
    font-size: 13px;
    font-weight: 700;
    color: #9fc3ff;
}

.eva-chart-meta {
    font-size: 13px;
    color: rgba(234,240,255,.86);
    display: flex;
    flex-direction: column;
    gap: 4px;
}

.eva-card-text {
    white-space: pre-line;
}

.eva-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}
</style>