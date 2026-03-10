<template>
    <q-page class="eva-page">
        <div class="eva-layaout">
            <aside class="eva-left-panel">
                <EvaConversationList /> 
            </aside>

            <main class="eva-main-panel">
                <EvaChatPanel /> 
            </main>

            <aside class="eva-right-panel">
                <EvaContextPanel />
            </aside>
        </div>
    </q-page>
</template>

<script setup>
import EvaConversationList from 'src/components/ai/EvaConversationList.vue'
import EvaChatPanel from 'src/components/ai/EvaChatPanel.vue'
import EvaContextPanel from 'src/components/ai/EvaContextPanel.vue'
</script>

<style scoped>
.eva-page {
    background: radial-gradient(circle at top, #12303a 0%, #0b1220 60%);
    min-height: 100vh;
    color: #eaf0ff; 
}

.eva-layout {
    display: grid;
    grid-template-columns: 280px 1fr 340px;
    gap: 16px;
    padding: 16px; 
    min-height: calc(100vh - 32px);
}

.eva-left-panel,
.eva-main-panel,
.eva-right-panel {
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    border-radius: 20px;
    overflow: hidden; 
}

@media (max-widht: 1200px) {
    .eva-layout {
        grid-template-columns: 260px 1fr;
    }

    .eva-right-panel {
        display: none; 
    }
}
</style>