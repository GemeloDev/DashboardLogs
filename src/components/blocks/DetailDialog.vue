<template>
  <q-dialog v-model="isOpen" transition-show="scale" transition-hide="scale">
    <q-card
      style="width: 100%; max-width: 800px; min-width: min(600px, 95vw)"
      class="bg-more-info-card no-scroll-visual text-white"
    >
      <q-card-section class="row items-center q-pb-none grey-9">
        <div class="text-h6 row items-center">
          <q-icon name="info" class="q-mx-sm text-primary" />
          Ficha técnica de log
        </div>
        <q-space />
        <q-btn icon="close" flat round dense v-close-popup />
      </q-card-section>

      <!-- Espacio para los campos que no tienen un cuerpo definido e incluso pueden ir nulos -->
      <q-card-section class="q-pa-md scroll">
        <div v-if="log" class="row">
          <!-- Datos del Usuario & Estados -->
          <div class="col-xs-12 col-sm-12 col-md-6 q-gutter-y-md q-px-sm">
            <div class="col-12">
              <div class="row items-center">
                <q-icon name="account_circle" size="xs" class="q-mx-xs text-blue" />
                <div class="text-caption text-blue text-weight-bold text-uppercase">
                  Usuario | Actor
                </div>
              </div>
              <div v-if="log.actor" class="mini-card q-pa-md q-my-sm rounded-borders">
                <div class="row items-center text-white text-weight-bold q-mb-sm ellipsis">
                  <q-icon name="badge" size="xs" class="q-mx-xs text-blue" />
                  {{ log?.actor?.id ?? 'Sin dato' }}
                </div>
                <span class="text-grey-6 ellipsis">
                  {{ log?.actor?.fullName ?? 'Sin dato' }}
                </span>
                <br />
                <span class="text-caption text-grey-6"
                  >👤 {{ log?.actor?.username || 'Sin dato' }}</span
                >
                <div class="row items-center q-mt-xs">
                  <div class="text-caption text-grey-5 q-mr-sm">
                    Tipo:
                    <q-chip dense color="cyan-8" text-color="white" size="sm" class="log-id-chip">
                      {{ log?.actor?.type }}
                    </q-chip>
                  </div>
                </div>
              </div>
              <div
                v-else
                class="mini-card flex justify-center q-pa-md q-my-sm rounded-borders"
                style="font-family: 'Consolas', 'Monaco', 'Courier New', monospace"
              >
                SIN DATOS DEL ACTOR
              </div>
            </div>
            <div class="col-xs-12 col-sm-12 col-md-6">
              <div class="row items-center">
                <q-icon name="rule" size="xs" class="q-mx-xs text-red" />
                <span class="text-caption text-red text-weight-bold text-uppercase"> Estados </span>
              </div>
              <div class="mini-card q-pa-md q-my-sm rounded-borders">
                <q-chip
                  v-if="log.status"
                  :color="getColor(log.status)"
                  text-color="white"
                  icon="flag"
                  class="text-weight-bold"
                >
                  {{ log.status }}
                </q-chip>

                <q-chip
                  v-if="log.outcome"
                  :color="getOutcomeColor(log.outcome)"
                  text-color="white"
                  size="sm"
                >
                  {{ log?.outcome || 'Sin dato' }}
                </q-chip>

                <q-chip
                  v-if="log.severity && log.severity !== 'INFO'"
                  :icon="getSeverityIcon(log.severity)"
                  class="bg-grey-9 text-white"
                  size="sm"
                >
                  {{ log?.severity || 'Sin dato' }}
                </q-chip>

                <q-chip
                  v-if="log.environment"
                  outline
                  color="grey-5"
                  size="sm"
                  class="text-uppercase"
                >
                  ENV: {{ log?.environment || 'Sin dato' }}
                </q-chip>

                <q-chip
                  v-if="log.http?.statusCode"
                  :color="getHttpColor(log.http?.statusCode || '000')"
                  text-color="white"
                  size="sm"
                  icon="http"
                >
                  {{ log.http?.statusCode || 'Sin dato' }}
                </q-chip>

                <q-chip
                  v-if="log.reason?.code"
                  color="deep-orange"
                  text-color="white"
                  size="sm"
                  icon="warning"
                >
                  {{ log.reason?.code || 'Sin dato' }}
                </q-chip>

                <template v-if="log.tags && log.tags.length">
                  <q-chip
                    v-for="tag in log.tags"
                    :key="tag"
                    dense
                    outline
                    color="primary"
                    size="sm"
                    class="q-px-sm"
                  >
                    #{{ tag }}
                  </q-chip>
                </template>
              </div>
            </div>
          </div>

          <!-- Datos del Sistema -->
          <div class="col-xs-12 col-sm-12 col-md-6 row q-pa-sm">
            <div class="row items-center q-mb-xs">
              <q-icon name="computer" size="xs" class="q-mx-xs text-orange" />
              <span class="text-caption text-orange text-weight-bold text-uppercase">
                Sistema
              </span>
            </div>
            <div class="mini-card q-pa-md rounded-borders">
              <div class="flex justify-between items-center">
                <q-chip color="green-9" text-color="white" size="md" class="text-weight-bold">
                  {{ log.system || 'SYSTEM' }}
                </q-chip>
                <small class="text-grey-6 q-mr-sm ellipsis">
                  {{ log?.environment ?? 'Sin dato' }}
                </small>
              </div>
              <div class="row justify-between">
                <div class="col-12 q-mt-md">
                  <span>Software</span>
                </div>
                <div class="col-4">
                  <small class="">App:</small>
                  <q-chip
                    color="cyan-9"
                    text-color="white"
                    size="sm"
                    class="text-weight-bold text-center"
                  >
                    {{ log?.meta?.sourceApp || 'Sin dato' }}
                  </q-chip>
                </div>
                <div class="col-4">
                  <small class="">Versión:</small>
                  <q-chip
                    color="cyan-9"
                    text-color="white"
                    size="sm"
                    class="text-weight-bold text-center"
                  >
                    {{ log.meta?.build || 'Sin dato' }}
                  </q-chip>
                </div>
                <div class="col-4">
                  <small class="">Schema:</small>
                  <q-chip
                    color="cyan-9"
                    text-color="white"
                    size="sm"
                    class="text-weight-bold text-center"
                  >
                    v{{ log?.schemaVersion || 'Sin dato' }}
                  </q-chip>
                </div>
              </div>
              <div class="col-12 q-mt-md">
                <span>Hardware & Red</span>
              </div>
              <div class="col-auto">
                <q-chip outline class="custom-chip" color="white" text-color="white">
                  <span class="text-weight-bold q-mr-xs">Dispositivo</span>
                  <span class="text-orange">{{ log.meta?.deviceId || 'Sin dispositivo' }}</span>
                </q-chip>
                <q-chip outline class="custom-chip" color="white" text-color="white">
                  <span class="text-weight-bold q-mr-xs">IP</span>
                  <span class="text-grey-5">{{ log.meta?.ip || 'Sin IP registrada' }}</span>
                </q-chip>
              </div>
              <div class="col-12 q-mt-md">
                <span>Salud | API</span>
              </div>
              <div class="col-auto">
                <div v-if="log.http" class="http-mini-card q-pa-sm q-my-sm rounded-borders">
                  <div class="row items-center q-mb-xs">
                    <q-icon name="dns" size="xs" class="q-mr-xs text-blue-3" />
                    <div class="text-caption text-blue-3 text-weight-bold text-uppercase">
                      {{ log.http?.method || 'Sin metodo registrado' }}
                    </div>
                  </div>

                  <div
                    class="text-body2 text-white text-weight-bold ellipsis"
                    :title="log.http?.path || 'Sin url'"
                  >
                    {{ log.http?.path || 'Endpoint no localizado' }}
                  </div>

                  <div class="row items-center q-mt-xs">
                    <div class="text-caption text-grey-5 q-mr-sm">
                      Status:
                      <span :class="getHttpColorClass(log.http?.statusCode || '000')">
                        {{ log.http?.statusCode || '###' }}
                      </span>
                    </div>
                    <div class="text-caption text-grey-6">
                      ⏱ {{ log.http?.latencyMs || '0' }}ms
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div v-if="log" class="row q-col-gutter-sm items-stretch q-mt-sm">
          <div class="col-12 col-md-6 flex column">
            <div class="http-mini-card q-pa-sm rounded-borders col flex column">
              <div class="row items-center q-mb-xs">
                <q-icon name="notes" size="xs" class="q-mr-xs text-blue-3" />
                <div class="text-caption text-blue-3 text-weight-bold text-uppercase">PAYLOAD</div>
              </div>

              <div class="json-wrapper relative-position col flex column">
                <q-btn
                  icon="content_copy"
                  flat
                  round
                  dense
                  size="sm"
                  color="grey-5"
                  class="copy-btn"
                  @click="copiarPayload(log.payload)"
                >
                  <q-tooltip>Copiar JSON</q-tooltip>
                </q-btn>
                <pre class="json-content fit scroll">{{
                  JSON.stringify(log.payload, null, 2)
                }}</pre>
              </div>
            </div>
          </div>

          <div class="col-12 col-md-6 flex column q-gutter-y-md">
            <div class="col-auto">
              <div class="http-mini-card q-pa-sm rounded-borders">
                <div class="row items-center q-mb-xs">
                  <q-icon name="notes" size="xs" class="q-mr-xs text-green" />
                  <div class="text-caption text-green-4 text-weight-bold text-uppercase">META</div>
                </div>
                <div class="json-wrapper relative-position">
                  <q-btn
                    v-if="log.meta"
                    icon="content_copy"
                    flat
                    round
                    dense
                    size="sm"
                    color="grey-5"
                    class="copy-btn"
                    @click="copiarPayload(log.meta)"
                  >
                    <q-tooltip>Copiar JSON</q-tooltip>
                  </q-btn>
                  <pre class="json-content">{{ JSON.stringify(log.meta, null, 2) }}</pre>
                </div>
              </div>
            </div>

            <div class="col-auto">
              <div class="http-mini-card q-pa-sm rounded-borders">
                <div class="row items-center q-mb-xs">
                  <q-icon name="notes" size="xs" class="q-mr-xs text-pink-4" />
                  <div class="text-caption text-pink-4 text-weight-bold text-uppercase">
                    CORRELACION
                  </div>
                </div>
                <div class="json-wrapper relative-position">
                  <q-btn
                    v-if="log.correlation"
                    icon="content_copy"
                    flat
                    round
                    dense
                    size="sm"
                    color="grey-5"
                    class="copy-btn"
                    @click="copiarPayload(log.correlation)"
                  >
                    <q-tooltip>Copiar JSON</q-tooltip>
                  </q-btn>
                  <pre class="json-content">{{ JSON.stringify(log.correlation, null, 2) }}</pre>
                </div>
              </div>
            </div>
          </div>

          <div class="col-12">
            <div class="http-mini-card q-pa-sm rounded-borders">
              <div class="row items-center q-mb-xs">
                <q-icon name="data_object" size="xs" class="q-mr-xs text-white" />
                <div class="text-caption text-white text-weight-bold text-uppercase">
                  Objeto Completo
                </div>
              </div>
              <div class="json-wrapper relative-position">
                <q-btn
                  v-if="log"
                  icon="content_copy"
                  flat
                  round
                  dense
                  size="sm"
                  color="grey-5"
                  class="copy-btn"
                  @click="copiarPayload(log)"
                >
                  <q-tooltip>Copiar JSON</q-tooltip>
                </q-btn>
                <pre class="json-content" style="max-height: 200px">{{
                  JSON.stringify(log, null, 2)
                }}</pre>
              </div>
            </div>
          </div>
        </div>
        <div v-else class="text-center text-grey">No hay datos seleccionados</div>
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed } from 'vue'

const $q = useQuasar()

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  log: {
    type: Object,
    default: null,
  },
})

const emit = defineEmits(['update:modelValue'])

const isOpen = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const copiarPayload = async (datos) => {
  if (!datos) return

  try {
    const texto = JSON.stringify(datos, null, 2)
    await navigator.clipboard.writeText(texto)

    $q.notify({
      type: 'positive',
      message: 'JSON copiado al portapapeles',
      position: 'top',
      timeout: 2000,
    })
  } catch (err) {
    console.error('Error al copiar: ', err)
    $q.notify({
      type: 'negative',
      message: 'Error al copiar el JSON',
      position: 'top',
    })
  }
}

const getHttpColorClass = (code) => {
  if (code >= 200 && code < 300) return 'text-green-4'
  if (code >= 300 && code < 400) return 'text-cyan-4'
  if (code >= 400) return 'text-red-4'
  return 'text-grey-4'
}

// --- Helpers de Color ---

const getColor = (val) => {
  const v = (val || '').toUpperCase()
  if (['APPROVED', 'SUCCESS', 'COMPLETED', 'VALIDATED'].includes(v)) return 'positive' // Verde
  if (['REJECTED', 'FAILURE', 'FAILED', 'BLOCKED', 'ERROR'].includes(v)) return 'negative' // Rojo
  if (['IN_PROGRESS', 'PENDING'].includes(v)) return 'primary' // Azul
  if (['WARNING', 'WARN'].includes(v)) return 'warning' // Naranja
  return 'grey-7'
}

const getOutcomeColor = (val) => {
  return val === 'SUCCESS' ? 'green-5' : val === 'FAILURE' ? 'red-5' : 'grey'
}

const getHttpColor = (code) => {
  if (code >= 200 && code < 300) return 'green'
  if (code >= 400 && code < 500) return 'orange'
  if (code >= 500) return 'red'
  return 'grey'
}

const getSeverityIcon = (val) => {
  const v = (val || '').toUpperCase()
  if (v === 'CRITICAL' || v === 'FATAL') return 'gpp_bad'
  if (v === 'ERROR') return 'error'
  if (v === 'WARN') return 'warning_amber'
  return 'info'
}
</script>

<style lang="scss" scoped>
.bg-more-info-card {
  background-color: #2b2b3d;
  border-radius: 12px;
}

.mini-card {
  background-color: #0f162a;
  border-radius: 12px;
  transition: background-color 0.2 ease;

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

.payload-container {
  // Asegura que el contenedor no se desborde
  max-width: 100%;
}

.json-wrapper {
  background: rgba(0, 0, 0, 0.3); // Fondo oscuro para el bloque de código
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: hidden; // Para que el botón no se salga en las esquinas redondeadas

  &:hover {
    .copy-btn {
      opacity: 1; // Mostrar botón al hacer hover
    }
  }
}

.json-content {
  margin: 0;
  padding: 16px;
  color: #e0e0e0; // Texto claro
  font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
  font-size: 0.85rem;
  white-space: pre-wrap; // Mantiene formato pero permite saltos
  word-wrap: break-word; // Rompe palabras largas
  overflow-x: auto; // Scroll horizontal si es necesario
}

.copy-btn {
  position: absolute;
  top: 8px;
  right: 8px;
  opacity: 0; // Oculto por defecto
  transition:
    opacity 0.2s ease,
    background-color 0.2s ease;
  z-index: 1; // Asegura que esté sobre el texto

  &:hover {
    background-color: rgba(255, 255, 255, 0.1); // Fondo al hacer hover en el botón
  }
}

// En dispositivos táctiles, mostrar siempre el botón
@media (hover: none) {
  .copy-btn {
    opacity: 1;
  }
}

.http-mini-card {
  border-radius: 8px;
  transition: background-color 0.2 ease;

  .ellipsis {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
    max-width: 100%;
  }
}

/* Estilos personalizados para el chip */
.custom-chip.q-chip--outline {
  background-color: #2e3045 !important; /* Fondo oscuro del chip */
  border-color: #43455c !important; /* Color del borde */
}

.no-scroll-visual {
  /* Ocultar en Chrome, Safari y Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Ocultar en Firefox, IE y Edge */
  -ms-overflow-style: none;  /* IE y Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
