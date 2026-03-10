<template>
    <div class="eva-card">
        <div class="row items-center q-col-gutter-sm">
            <div class="col">
                <div class="eva-card-title">Tendencias detectadas</div>
            </div>
            <div class="col-auto">
                <q-chip
                dense
                :color="severityColor"
                text-color="white"
                size="sm"
                >
                {{ severity }}
                </q-chip>
            </div>
        </div>

        <div class="eva-card-text">
        {{ message.content }}
        </div>

        <div v-if="visibleBullets.length" class="eva-card-list">
            <div
                v-for="item in visibleBullets"
                :key="item"
                class="eva-card-item"
            >
                • {{ item }}
            </div>
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

const severity = computed(() => props.message?.meta?.severity || 'INFO')

const severityColor = computed(() => {
    if (severity.value === 'CRIT') return 'negative'
    if (severity.value === 'WARN') return 'warning'
    return 'primary'
})

//const recommendations = computed(() => props.message?.meta?.recommendations || [])
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

.eva-card-list {
    display: flex;
    flex-direction: column;
    gap: 6px;
}

.eva-card-item {
    font-size: 13px;
    color: rgba(234, 240, 255, 0.88);
}

.eva-card-actions {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-top: 4px;
}
</style>