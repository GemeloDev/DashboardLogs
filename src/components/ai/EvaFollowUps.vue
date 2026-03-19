<template>
    <div v-if="followUps.length" class="eva-followups">
        <div class="eva-followups-label">Continuar con</div>
        <div class="eva-followups-chips">
        <button
            v-for="item in followUps"
            :key="item.id"
            class="eva-followup-chip"
            @click="emit('select', item)"
        >
            <q-icon v-if="item.icon" :name="item.icon" size="12px" class="eva-fu-icon" />
            <span>{{ item.label }}</span>
        </button>
        </div>
    </div>
</template>

<script setup>
defineProps({
    followUps: {
        type: Array,
        default: () => []
    }
})

const emit = defineEmits(['select'])
</script>

<style scoped>
.eva-followups {
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.07);
    display: flex;
    flex-direction: column;
    gap: 7px;
}

.eva-followups-label {
    font-size: 11px;
    color: rgba(234, 240, 255, 0.4);
    font-weight: 500;
    letter-spacing: 0.03em;
}

.eva-followups-chips {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
}

.eva-followup-chip {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    font-size: 12px;
    color: #9fc3ff;
    background: rgba(0, 100, 255, 0.07);
    border: 1px solid rgba(0, 160, 255, 0.2);
    border-radius: 999px;
    padding: 4px 11px;
    cursor: pointer;
    transition: background 0.15s, border-color 0.15s, color 0.15s;
    white-space: nowrap;
}

.eva-followup-chip:hover {
    background: rgba(0, 120, 255, 0.18);
    border-color: rgba(0, 180, 255, 0.45);
    color: #dbeeff;
}

.eva-fu-icon {
    opacity: 0.7;
    flex-shrink: 0;
}
</style>