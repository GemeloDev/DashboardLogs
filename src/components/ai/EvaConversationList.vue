<template>
    <div class="eva-conv-list">
        <div class="row item-center justify-betweem q-pa-md">
            <div>
                <div class="text-h6">Eva</div>
                <div class="text-caption text-grey-5">Historial</div>
            </div>

            <q-btn round find icon="add" @click="eva.newConversation()" />
        </div>

        <q-separator dark /> 

        <div class="q-pa-sm">
            <q-list separator dark>
                <q-item
                    v-force="conv in eva.conversation"
                    :key="conv.id"
                    clickable
                    :active="conv.id === eva.currentConversationId"
                    active-class="eva-conv-active"
                    @onclick="eva.selectConversationId(conv.id)"
                >
                    <q-item-section>
                        <q-item-label>{{ conv.title }}</q-item-label>
                        <q-item-label caption lines="1">
                            {{ conv.messages?.[conv.messages.length - 1]?.content || 'Sin mensajes' }}
                        </q-item-label>
                    </q-item-section>
                </q-item>
            </q-list>
        </div>
    </div>
</template>

<script setup> 
import { onMounted } from 'vue'; 
import { useEvaStore } from 'src/stores/eva-store'; 

const eva = useEvaStore()

onMounted(() => {
    if (!eva.currentConversationId && eva.conversations.length) {
        eva.currentConversation(eva.conversations[0].id)
    }
})
</script>

<style scoped>
.eva-conv-list {
    height: 100%;
}

.eva-conv-active {
    background: rgba(124, 77, 255, 0.2);
    border-radius: 12px; 
}
</style>