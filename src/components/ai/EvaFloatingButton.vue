<template>
    <div class="eva-floating">
        <q-btn
            round
            unelevated
            size="lg"
            icon="auto_awesome"
            class="eva-fab"
            @click="eva.openWorkspace()"
        >
            <q-badge
                v-if="alertCount > 0"
                floating
                color="negative"
                rounded
                :label="alertCount"
            />
        </q-btn>
    </div>
</template>

<script setup>
import { computed } from 'vue';
import { useEvaStore } from 'src/stores/eva-store';

const eva = useEvaStore();

const alertCount = computed(() => 2)
</script>

<style scoped>
.eva-floating {
    position: fixed;
    right: 24px;
    bottom: 24px;
    z-index: 4000;
}

.eva-fab {
    width: 60px;
    height: 60px;
    background: linear-gradient(135deg, #7c4dff, #00d4ff);
    color: white;
    box-shadow:
        0 10px 30px rgba(124, 77, 255, 0.35),
        0 0 24px rgba(0, 212, 255, 0.18);
}
</style>
