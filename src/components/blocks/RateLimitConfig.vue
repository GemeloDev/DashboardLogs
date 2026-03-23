<template>
  <q-dialog
    v-model="RateLimitModal"
    transition-show="scale"
    transition-hide="scale"
  >
    <q-card flat bordered class="rate-limit-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="dialog-icon">
            <q-icon name="tune" size="24px" color="white" />
          </div>

          <div>
            <h2>Configuración de Rate Limit</h2>
            <p>Administra los límites por API Key y por Tenant.</p>
          </div>
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Body -->
      <q-card-section v-if="form" class="modal-top-controls">
        <q-toggle
          v-model="form.enabled"
          label="Rate limit habilitado"
          color="cyan"
          class="toggle-dark"
          keep-color
        />
      </q-card-section>

      <q-separator class="modal-separator" />

      <q-card-section class="modal-body row q-col-gutter-lg">
        <!-- API KEY -->
        <div class="col-12 col-md-6">
          <div class="rate-box">
            <div class="rate-box__title">
              <q-icon name="vpn_key" size="18px" class="q-mr-sm text-cyan" />
              Por API Key
            </div>

            <div class="form-field">
              <label class="input-label">Capacity (burst)</label>
              <q-input
                v-model.number="form.apiKey.capacity"
                type="number"
                min="1"
                outlined
                dense
                class="premium-input"
                placeholder="Capacity"
              />
            </div>

            <div class="form-field">
              <label class="input-label">Refill tokens</label>
              <q-input
                v-model.number="form.apiKey.refillTokens"
                type="number"
                min="1"
                outlined
                dense
                class="premium-input"
                placeholder="Refill tokens"
              />
            </div>

            <div class="form-field">
              <label class="input-label">Refill seconds</label>
              <q-input
                v-model.number="form.apiKey.refillSeconds"
                type="number"
                min="1"
                outlined
                dense
                class="premium-input"
                placeholder="Refill seconds"
              />
            </div>

            <div v-if="apiKeyRate" class="rate-summary">
              ~{{ apiKeyRate.perSec.toFixed(2) }} req/s
              <span class="summary-separator">·</span>
              {{ apiKeyRate.perMin.toFixed(0) }} req/min
              <span class="summary-separator">·</span>
              Burst: {{ apiKeyRate.burst }}
            </div>
          </div>
        </div>

        <!-- TENANT -->
        <div class="col-12 col-md-6">
          <div class="rate-box">
            <div class="rate-box__title">
              <q-icon name="apartment" size="18px" class="q-mr-sm text-purple" />
              Por Tenant
            </div>

            <div class="form-field">
              <label class="input-label">Capacity (burst)</label>
              <q-input
                v-model.number="form.tenant.capacity"
                type="number"
                min="1"
                outlined
                dense
                class="premium-input"
                placeholder="Capacity"
              />
            </div>

            <div class="form-field">
              <label class="input-label">Refill tokens</label>
              <q-input
                v-model.number="form.tenant.refillTokens"
                type="number"
                min="1"
                outlined
                dense
                class="premium-input"
                placeholder="Refill tokens"
              />
            </div>

            <div class="form-field">
              <label class="input-label">Refill seconds</label>
              <q-input
                v-model.number="form.tenant.refillSeconds"
                type="number"
                min="1"
                outlined
                dense
                class="premium-input"
                placeholder="Refill seconds"
              />
            </div>

            <div v-if="tenantRate" class="rate-summary">
              ~{{ tenantRate.perSec.toFixed(2) }} req/s
              <span class="summary-separator">·</span>
              {{ tenantRate.perMin.toFixed(0) }} req/min
              <span class="summary-separator">·</span>
              Burst: {{ tenantRate.burst }}
            </div>
          </div>
        </div>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Actions -->
      <q-card-actions align="right" class="modal-actions">
        <q-btn
          no-caps
          unelevated
          label="Guardar"
          class="btn-primary"
          :loading="loading"
          @click="saveRateLimit"
          :disable="!form"
        />

        <q-btn
          no-caps
          flat
          label="Restaurar default"
          class="btn-secondary"
          :loading="loading"
          @click="resetRateLimit"
          :disable="!canReset"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { RateLimitService } from 'src/services/apiKeys'

const $q = useQuasar()

const loading = ref(false)
const rateLimit = ref(null) // respuesta completa del GET (data.data)
const form = ref(null) // lo que editarás y mandarás al PUT

const canReset = computed(() => rateLimit.value?.source === 'ORG_OVERRIDE')

const calcRate = (bucket) => {
  if (!bucket?.refillTokens || !bucket?.refillSeconds) return null
  const perSec = bucket.refillTokens / bucket.refillSeconds
  const perMin = perSec * 60
  return { perSec, perMin, burst: bucket.capacity }
}

const apiKeyRate = computed(() => calcRate(form.value?.apiKey))
const tenantRate = computed(() => calcRate(form.value?.tenant))

async function loadRateLimit() {
  loading.value = true
  try {
    const res = await RateLimitService.get()
    rateLimit.value = res.data.data

    // UI: editar siempre desde effective (lo que aplica hoy)
    form.value = JSON.parse(JSON.stringify(rateLimit.value.effective))
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'No se pudo cargar el rate limit' })
  } finally {
    loading.value = false
  }
}

async function saveRateLimit() {
  loading.value = true
  try {
    await RateLimitService.update(form.value)
    $q.notify({ type: 'positive', message: 'Rate limit actualizado' })
    await loadRateLimit()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'No se pudo actualizar el rate limit' })
  } finally {
    loading.value = false
  }
}

async function resetRateLimit() {
  loading.value = true
  try {
    await RateLimitService.clear()
    $q.notify({ type: 'info', message: 'Restaurado a default' })
    await loadRateLimit()
  } catch (e) {
    console.error(e)
    $q.notify({ type: 'negative', message: 'No se pudo restaurar a default' })
  } finally {
    loading.value = false
  }
}

onMounted(loadRateLimit)
</script>

<style lang="scss" scoped>
.rate-limit-modal {
  min-width: 640px;
  max-width: 860px;
  border-radius: 26px;
  background: linear-gradient(160deg, rgb(15, 20, 32), rgb(18, 25, 42));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.48);

  @media (max-width: 768px) {
    min-width: 94vw;
    max-width: 94vw;
  }
}

.modal-header {
  padding: 24px;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;

  h2 {
    margin: 0 0 4px 0;
    font-size: 1.5rem;
    font-weight: 800;
    color: #ffffff;
    line-height: 1.2;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.68);
    line-height: 1.5;
  }
}

.dialog-icon {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, #06b6d4, #7c3aed);
  box-shadow: 0 14px 30px rgba(34, 211, 238, 0.18);
  flex-shrink: 0;
}

.modal-separator {
  background: rgba(255, 255, 255, 0.08);
}

.modal-top-controls {
  padding: 18px 24px;
}

.toggle-dark {
  color: white;
}

.modal-body {
  padding: 24px;
  max-height: 65vh;
  overflow-y: auto;
}

.rate-box {
  height: 100%;
  padding: 18px;
  border-radius: 20px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.rate-box__title {
  display: flex;
  align-items: center;
  font-size: 1rem;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 16px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 14px;
}

.input-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 700;
  color: #ffffff;
}

.premium-input {
  :deep(.q-field__control) {
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.04);
    border: 1px solid rgba(255, 255, 255, 0.08);
    color: white;
    transition:
      border-color 0.2s ease,
      box-shadow 0.2s ease,
      background 0.2s ease;
  }

  :deep(.q-field__native),
  :deep(.q-field__input),
  :deep(.q-field__label),
  :deep(.q-select__dropdown-icon) {
    color: white;
  }

  :deep(input::placeholder) {
    color: rgba(255, 255, 255, 0.35);
  }

  :deep(.q-field__control:hover) {
    border-color: rgba(34, 211, 238, 0.22);
    background: rgba(255, 255, 255, 0.05);
  }

  :deep(.q-field--focused .q-field__control) {
    border-color: rgba(34, 211, 238, 0.55);
    box-shadow: 0 0 0 4px rgba(34, 211, 238, 0.08);
  }

  :deep(.q-field__marginal) {
    color: rgba(255, 255, 255, 0.58);
  }
}

.rate-summary {
  margin-top: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.88rem;
  line-height: 1.5;
}

.summary-separator {
  margin: 0 8px;
  color: rgba(255, 255, 255, 0.3);
}

.modal-actions {
  padding: 18px 24px 24px;
  gap: 12px;
}

.btn-primary {
  min-height: 48px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%);
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
}

.btn-secondary {
  min-height: 48px;
  padding: 0 18px;
  border-radius: 16px;
  font-weight: 700;
  color: #ffb088;
  text-transform: none;
  border: 1px solid rgba(233, 113, 50, 0.22);
  background: rgba(233, 113, 50, 0.08);
}

.text-cyan {
  color: #22d3ee;
}

.text-purple {
  color: #a855f7;
}

@media (max-width: 768px) {
  .modal-header,
  .modal-top-controls,
  .modal-body,
  .modal-actions {
    padding-left: 18px;
    padding-right: 18px;
  }

  .header-content {
    align-items: flex-start;

    h2 {
      font-size: 1.3rem;
    }
  }

  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary {
    width: 100%;
  }
}
</style>
