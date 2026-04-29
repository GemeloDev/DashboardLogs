<template>
  <div class="eva-message-renderer">
    <!-- TEXTO SIMPLE -->
    <template v-if="messageType === 'text'">
      <div class="eva-message-text">
        <span v-html="formattedContent"></span>
      </div>
    </template>

    <!-- RESUMEN / INSIGHT -->
    <template v-else-if="messageType === 'insight'">
      <div class="eva-block">
        <div class="eva-block-title">Resumen ejecutivo</div>

        <div class="eva-message-text">
          <span v-html="formattedContent"></span>
        </div>

        <div
          v-if="safeArray(message.meta?.highlights).length"
          class="eva-list-block"
        >
          <div class="eva-subtitle">Puntos clave</div>
          <div
            v-for="item in safeArray(message.meta?.highlights)"
            :key="item"
            class="eva-list-item"
          >
            • {{ item }}
          </div>
        </div>

        <div
          v-if="safeArray(message.meta?.recommendations).length"
          class="eva-list-block"
        >
          <div class="eva-subtitle">Acciones sugeridas</div>
          <div
            v-for="item in safeArray(message.meta?.recommendations)"
            :key="item"
            class="eva-list-item"
          >
            • {{ item }}
          </div>
        </div>

        <div
          v-if="safeArray(message.meta?.actions).length"
          class="eva-message-actions"
        >
          <q-btn
            v-for="action in safeArray(message.meta?.actions)"
            :key="action.key"
            outline
            no-caps
            size="sm"
            color="primary"
            :icon="action.icon"
            :label="action.label"
            @click="emit('action', action)"
          />
        </div>
      </div>
    </template>

    <!-- ALERTA -->
    <template v-else-if="messageType === 'alert'">
      <div class="eva-block">
        <div class="eva-block-header">
          <div class="eva-block-title">Alertas recientes</div>
          <q-badge
            v-if="safeArray(message.meta?.items).length"
            color="primary"
            outline
            :label="`${safeArray(message.meta?.items).length}`"
          />
        </div>

        <div class="eva-message-text">
          <span v-html="formattedContent"></span>
        </div>

        <div
          v-if="safeArray(message.meta?.items).length"
          class="eva-alert-list"
        >
          <div
            v-for="item in safeArray(message.meta?.items).slice(0, 3)"
            :key="item.id || `${item.status}-${item.windowFromLocal}`"
            class="eva-alert-item"
          >
            <div class="eva-alert-top">
              <div class="eva-alert-status">
                {{ item.status || 'WARN' }}
              </div>

              <q-badge
                :color="statusColor(item.status)"
                rounded
                :label="item.status || 'WARN'"
              />
            </div>

            <div class="eva-alert-date">
              {{ item.windowFromLocal || 'Sin fecha' }}
            </div>

            <div class="eva-alert-meta">
              {{ item.granularity || 'daily' }}
            </div>
          </div>
        </div>

        <div
          v-if="safeArray(message.meta?.actions).length"
          class="eva-message-actions"
        >
          <q-btn
            v-for="action in safeArray(message.meta?.actions)"
            :key="action.key"
            outline
            no-caps
            size="sm"
            color="primary"
            :icon="action.icon"
            :label="action.label"
            @click="emit('action', action)"
          />
        </div>
      </div>
    </template>

    <!-- TENDENCIAS -->
    <template v-else-if="messageType === 'trend'">
      <div class="eva-block">
        <div class="eva-block-header">
          <div class="eva-block-title">Tendencias detectadas</div>

          <q-badge
            v-if="message.meta?.severity"
            :color="severityColor(message.meta?.severity)"
            rounded
            :label="message.meta?.severity"
          />
        </div>

        <div class="eva-message-text">
          <span v-html="formattedContent"></span>
        </div>

        <div
          v-if="safeArray(message.meta?.recommendations).length"
          class="eva-list-block"
        >
          <div class="eva-subtitle">Recomendaciones</div>
          <div
            v-for="item in safeArray(message.meta?.recommendations)"
            :key="item"
            class="eva-list-item"
          >
            • {{ item }}
          </div>
        </div>

        <div
          v-if="safeArray(message.meta?.actions).length"
          class="eva-message-actions"
        >
          <q-btn
            v-for="action in safeArray(message.meta?.actions)"
            :key="action.key"
            outline
            no-caps
            size="sm"
            color="primary"
            :icon="action.icon"
            :label="action.label"
            @click="emit('action', action)"
          />
        </div>
      </div>
    </template>

    <!-- GRÁFICA -->
    <template v-else-if="messageType === 'chart'">
      <div class="eva-block">
        <div class="eva-block-title">Gráfica generada</div>

        <div class="eva-chart-summary">
          <div v-if="message.meta?.system" class="eva-kv-line">
            <span class="eva-kv-label">System:</span>
            <span class="eva-kv-value">{{ message.meta.system }}</span>
          </div>

          <div v-if="message.meta?.granularity" class="eva-kv-line">
            <span class="eva-kv-label">Granularity:</span>
            <span class="eva-kv-value">{{ message.meta.granularity }}</span>
          </div>

          <div v-if="message.meta?.rangeLabel" class="eva-kv-line">
            <span class="eva-kv-label">Range:</span>
            <span class="eva-kv-value">{{ message.meta.rangeLabel }}</span>
          </div>

          <div v-if="message.meta?.points !== undefined" class="eva-kv-line">
            <span class="eva-kv-label">Puntos:</span>
            <span class="eva-kv-value">{{ message.meta.points }}</span>
          </div>
        </div>

        <div class="eva-message-text q-mt-sm">
          <span v-html="formattedContent"></span>
        </div>

        <div
          v-if="safeArray(message.meta?.actions).length"
          class="eva-message-actions"
        >
          <q-btn
            v-for="action in safeArray(message.meta?.actions)"
            :key="action.key"
            outline
            no-caps
            size="sm"
            color="primary"
            :icon="action.icon"
            :label="action.label"
            @click="emit('action', action)"
          />
        </div>
      </div>
    </template>

    <!-- FALLBACK -->
    <template v-else>
      <div class="eva-message-text">
        <span v-html="formattedContent"></span>
      </div>

      <div
        v-if="safeArray(message.meta?.actions).length"
        class="eva-message-actions"
      >
        <q-btn
          v-for="action in safeArray(message.meta?.actions)"
          :key="action.key"
          outline
          no-caps
          size="sm"
          color="primary"
          :icon="action.icon"
          :label="action.label"
          @click="emit('action', action)"
        />
      </div>
    </template>
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

const emit = defineEmits(['action'])

const messageType = computed(() => props.message?.type || 'text')

// Renderiza contenido con markdown básico y saltos de línea
const formattedContent = computed(() => {
  let text = props.message?.content || ''
  // Escapar HTML
  text = text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  // Markdown básico
  text = text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
  // Saltos de línea
  text = text.replace(/\n/g, '<br>')
  return text
})

function safeArray(value) {
  return Array.isArray(value) ? value : []
}

function severityColor(value) {
  const v = String(value || '').toUpperCase()
  if (v === 'CRIT') return 'negative'
  if (v === 'WARN') return 'warning'
  return 'info'
}

function statusColor(value) {
  const v = String(value || '').toUpperCase()
  if (v === 'CRIT') return 'negative'
  if (v === 'WARN') return 'warning'
  if (v === 'OK') return 'positive'
  return 'primary'
}
</script>

<style scoped>
.eva-message-renderer {
  width: 100%;
}

.eva-message-text {
  white-space: normal;
  word-break: break-word;
  line-height: 1.55;
  color: #eaf0ff;
}

.eva-block {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eva-block-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.eva-block-title {
  font-size: 15px;
  font-weight: 700;
  color: #cfe0ff;
}

.eva-subtitle {
  font-size: 12px;
  font-weight: 700;
  color: #8fb7ff;
  margin-bottom: 4px;
}

.eva-list-block {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.eva-list-item {
  font-size: 13px;
  color: rgba(234, 240, 255, 0.88);
  line-height: 1.45;
}

.eva-chart-summary {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.eva-kv-line {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
  font-size: 13px;
}

.eva-kv-label {
  color: rgba(234, 240, 255, 0.62);
  font-weight: 600;
}

.eva-kv-value {
  color: #ffffff;
  font-weight: 700;
}

.eva-alert-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.eva-alert-item {
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.03);
  border-radius: 12px;
  padding: 10px 12px;
}

.eva-alert-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 8px;
}

.eva-alert-status {
  font-size: 14px;
  font-weight: 700;
  color: #ffffff;
}

.eva-alert-date {
  margin-top: 6px;
  font-size: 12px;
  color: rgba(234, 240, 255, 0.75);
  word-break: break-word;
}

.eva-alert-meta {
  margin-top: 4px;
  font-size: 12px;
  color: #9fc3ff;
}

.eva-message-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin-top: 2px;
}
</style>
