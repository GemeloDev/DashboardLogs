<template>
    <div :class="compact ? 'eva-actions-compact' : 'eva-actions'">
        <q-btn
            v-for="action in eva.quickActions"
            :key="action.key"
            outline
            no-caps
            color="primary"
            class="eva-action-btn"
            @click="$emit('action', action)"
        >
            <q-icon :name="action.icon" class="q-mr-sm" />
            {{ action.label }}
        </q-btn>
    </div>
</template>

<script setup>
import { useEvaStore } from 'src/stores/eva-store'

defineProps({
    compact: {
        type: Boolean,
        default: false
    }
})

defineEmits(['action'])

const eva = useEvaStore()
</script>

<style scoped>
.eva-actions {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
}

.eva-actions-compact {
    display: flex;
    flex-wrap: wrap;
    gap: 8px; 
}

.eva-action-btn {
    border-radius: 12px;
}
</style>