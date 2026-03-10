<template>
  <q-dialog v-model="RateLimitModal" transition-show="scale" transition-hide="scale">
    <q-card class="q-pa-md shadow-4 rounded-borders" style="min-width: 600px">
      <!-- Body -->
      <q-card-section v-if="form">
        <q-toggle v-model="form.enabled" label="Rate limit habilitado" color="primary" />
      </q-card-section>

      <q-separator color="grey-4" />

      <q-card-section class="row q-col-gutter-md">
        <!-- API KEY -->
        <div class="col-12 col-md-6">
          <div class="text-h6 q-my-xs">Por API Key</div>
          <q-input
            v-model.number="form.apiKey.capacity"
            type="number"
            label="Capacity (burst)"
            min="1"
            outlined
            dense
          />
          <q-input
            v-model.number="form.apiKey.refillTokens"
            type="number"
            label="Refill tokens"
            min="1"
            outlined
            dense
            class="q-mt-sm"
          />
          <q-input
            v-model.number="form.apiKey.refillSeconds"
            type="number"
            label="Refill seconds"
            min="1"
            outlined
            dense
            class="q-mt-sm"
          />

          <div v-if="apiKeyRate" class="text-caption text-grey-6 q-mt-sm">
            ~{{ apiKeyRate.perSec.toFixed(2) }} req/s ({{ apiKeyRate.perMin.toFixed(0) }} req/min) ·
            Burst: {{ apiKeyRate.burst }}
          </div>
        </div>

        <!-- TENANT -->
        <div class="col-12 col-md-6">
          <div class="text-h6 q-my-xs">Por Tenant</div>
          <q-input
            v-model.number="form.tenant.capacity"
            type="number"
            label="Capacity (burst)"
            min="1"
            outlined
            dense
          />
          <q-input
            v-model.number="form.tenant.refillTokens"
            type="number"
            label="Refill tokens"
            min="1"
            outlined
            dense
            class="q-mt-sm"
          />
          <q-input
            v-model.number="form.tenant.refillSeconds"
            type="number"
            label="Refill seconds"
            min="1"
            outlined
            dense
            class="q-mt-sm"
          />

          <div v-if="tenantRate" class="text-caption text-grey-6 q-mt-sm">
            ~{{ tenantRate.perSec.toFixed(2) }} req/s ({{ tenantRate.perMin.toFixed(0) }} req/min) ·
            Burst: {{ tenantRate.burst }}
          </div>
        </div>
      </q-card-section>
      <q-separator color="grey-4" />
      <q-card-section align="right" class="q-pt-sm">
        <!-- Header -->
        <q-toolbar>
          <q-btn
            label="Guardar"
            color="primary"
            :loading="loading"
            @click="saveRateLimit"
            :disable="!form"
            class="q-mr-sm"
          />
          <q-btn
            label="Restaurar default"
            color="negative"
            flat
            :loading="loading"
            @click="resetRateLimit"
            :disable="!canReset"
          />
        </q-toolbar>
      </q-card-section>
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
.rounded-borders {
  border-radius: 12px;
}
</style>
