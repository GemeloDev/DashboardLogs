<template>
    <div class="eva-card">
        <div class="eva-card-title">Alertas recientes</div>

        <div v-if="visibleBullets.length" class="eva-alert-list">
            <div
                v-for="item in visibleBullets.slice(0, 3)"
                :key="item.id"
                class="eva-alert-row"
            >
                <div class="eva-alert-top">
                <span class="eva-alert-status">{{ item.status }}</span>
                <span class="eva-alert-time">{{ item.windowFromLocal }}</span>
                </div>
            </div>
        </div>

        <div v-else class="eva-card-text">
        {{ message.content }}
        </div>

        <div v-if="actions.length" class="eva-card-actions">
            <q-btn 
                v-for="action in actions"
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

//const items = computed(() => props.message?.meta?.items || [])
const bullets = computed(() => props.message?.meta?.bullets || [])
const actions = computed(() => props.message?.meta?.actions || [])

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

.eva-card-text {
    white-space: pre-line;
}

.eva-alert-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
}

.eva-alert-row {
    padding: 10px;
    border-radius: 10px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.06);
}

.eva-alert-top {
    display: flex;
    justify-content: space-between;
    gap: 10px;
    font-size: 12px;
}

.eva-alert-status {
    font-weight: 700;
    color: #ffffff;
}

.eva-alert-time {
    color: rgba(234,240,255,0.65);
}

.eva-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}
</style>