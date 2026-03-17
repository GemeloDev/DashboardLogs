<template>
  <q-page class="bg-dark-page">
    <div class="q-pa-lg text-white">
      <div class="container">
        <div class="row items-center justify-between">
          <div class="col-12 col-md-6">
            <div class="text-h3 diagnostic-title q-mt-md flex items-center">
              <span class="q-mr-sm">🔐</span>
              <span class="text-weight-bold">Mis API Key's</span>
            </div>
            <div class="text-h6 text-blue-3 q-mt-sm">🛠️ Gestión y control de accesos</div>
          </div>
          <div class="col-12 col-md-4 text-right q-mt-md q-mt-md-none">
            <q-btn
              color="primary"
              icon="add"
              label="Nueva API Key"
              class="glossy-btn"
              size="md"
              @click="abrirModalCrear"
            />
          </div>
          <div class="col-12 col-md-2 text-center q-mt-md q-mt-md-none">
            <q-btn
              color="secondary"
              icon="settings"
              label="Rate-limit"
              class="glossy-btn"
              size="md"
              @click="abrirModalRateLimit"
            />
          </div>
        </div>
      </div>
    </div>

    <div class="q-px-lg q-pb-xl">
      <div class="container">
        <q-card class="modern-card">
          <q-card-section class="q-pa-none">
            <q-table
              :rows="rows"
              :columns="columns"
              row-key="id"
              dark
              class="api-keys-table"
              :filter="filter"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:top>
                <div class="row items-center text-h6 text-white q-my-sm q-ml-md">
                  Listado de Llaves
                </div>
                <q-space />
                <q-input
                  dark
                  borderless
                  dense
                  debounce="300"
                  v-model="filter"
                  placeholder="Buscar..."
                  class="search-input q-mr-md"
                >
                  <template v-slot:append>
                    <q-icon name="search" />
                  </template>
                </q-input>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="header-row">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-weight-bold text-uppercase text-blue-2"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="body-row">
                  <q-td key="nombre" :props="props">
                    <div class="text-weight-bold">{{ props.row.name }}</div>
                    <div class="text-caption text-grey-5">{{ props.row.descripcion }}</div>
                  </q-td>

                  <q-td key="prefix" :props="props.row.scopes">
                    <q-chip dense color="grey-7" text-color="white" size="sm" class="log-id-chip">
                      {{ props.row.scopes }}
                    </q-chip>
                  </q-td>

                  <q-td key="estado" :props="props">
                    <q-chip
                      dense
                      :color="apiKeyUi(props.row).color"
                      text-color="white"
                      :icon="apiKeyUi(props.row).icon"
                    >
                      {{ apiKeyUi(props.row).label }}
                    </q-chip>
                  </q-td>

                  <q-td key="creado" :props="props">
                    <div class="text-grey-4">{{ formatearFecha(props.row.createdAt) }}</div>
                  </q-td>

                  <q-td key="ultimoUso" :props="props">
                    <div class="text-grey-4">{{ timeAgoIntl(props.row.lastUsedAt) }}</div>
                  </q-td>

                  <q-td key="acciones" :props="props" align="center">
                    <div class="row justify-center q-gutter-x-sm">
                      <q-btn
                        flat
                        round
                        dense
                        color="cyan-4"
                        icon="autorenew"
                        size="sm"
                        @click="renewToken(props.row.id)"
                        :disable="props.row.status !== 'active'"
                      >
                        <q-tooltip>Recargar Token</q-tooltip>
                      </q-btn>
                      <q-btn
                        flat
                        round
                        dense
                        color="red-4"
                        :disable="props.row.status !== 'active'"
                        icon="delete"
                        size="sm"
                        @click="ApiKeyService.delete(props.row.id)"
                      >
                        <q-tooltip>Revocar</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </div>
    </div>

    <q-dialog v-model="modalOpen" persistent>
      <q-card class="modal-card bg-dark text-white" style="min-width: 500px">
        <q-card-section class="row items-center justify-between header-modal-bg">
          <h6 class="no-padding no-margin">✨ Nueva API Key</h6>
          <q-btn icon="close" flat round dense v-close-popup />
        </q-card-section>

        <q-card-section class="q-pt-lg body-modal-bg">
          <q-form class="q-gutter-md">
            <q-input
              filled
              dark
              v-model="form.name"
              label="Nombre de la llave *"
              hint="El archivo de credenciales tendrá este nombre"
              color="primary"
              :rules="[(val) => !!val || 'El nombre es requerido']"
            >
              <template v-slot:append>
                <div class="row items-center no-wrap">
                  <q-btn-dropdown color="green" :label="'.' + form.formato">
                    <q-list>
                      <q-item clickable v-close-popup @click="form.formato = 'txt'">
                        <q-item-section>
                          <q-item-label>.txt</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup @click="form.formato = 'json'">
                        <q-item-section>
                          <q-item-label>.json</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </div>
              </template>
            </q-input>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="q-pa-md header-modal-bg">
          <q-btn flat label="Cancelar" color="grey-5" v-close-popup />
          <q-btn label="Generar Llave" color="primary" class="q-px-md" @click="crearAPIKey" />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <rate-limit-config v-model="rateLimitDialog" />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import RateLimitConfig from 'src/components/blocks/RateLimitConfig.vue'
import { timeAgoIntl, formatearFecha } from 'src/helpers'
import { ApiKeyService } from 'src/services/apiKeys'
import { computed, onMounted, ref } from 'vue'

const $q = useQuasar()

const filter = ref('')
const modalOpen = ref(false)
const rows = ref([])
const rateLimitDialog = ref(false)

const ttlDays = 35
const rotateDays = 30

const form = ref({
  name: '',
  systemId: null,
  environmentId: null,
  scopes: ['LOGS_INGEST'], // "LOGS_INGEST", "INGEST", "ALL"
  ttlDays,
  formato: 'txt',
  rotateDays,
})

const columns = [
  {
    name: 'nombre',
    required: true,
    label: 'Nombre / Aplicación',
    align: 'center',
    field: 'nombre',
    sortable: true,
  },
  { name: 'estado', align: 'center', label: 'Estado', field: 'activo', sortable: true },
  { name: 'creado', align: 'center', label: 'Creado', field: 'creado', sortable: true },
  { name: 'ultimoUso', align: 'center', label: 'Último Uso', field: 'ultimoUso', sortable: true },
  { name: 'acciones', align: 'center', label: 'Acciones' },
]

const MS_DAY = 24 * 60 * 60 * 1000

function toMs(d) {
  if (!d) return null
  const t = new Date(d).getTime()
  return Number.isFinite(t) ? t : null
}

function getApiKeyLifecycleUi(apiKey, opts) {
  const {
    now = new Date(),
    renewWindowDays = 7,
    treatMissingDatesAs = 'active',
    showUnsedHint = true,
    unsedDays = 30,
  } = opts

  const nowMs = now.getTime()

  const status = String(apiKey?.status || '').toLowerCase()

  const expiresMs = toMs(apiKey?.expiresAt)
  const rotatesMs = toMs(apiKey?.rotatesAt)
  const lastUsedMs = toMs(apiKey?.lastUsedAt)

  //  1) Revocada (prioridad máxima)
  if (status == 'revoked' || status === 'disabled' || status === 'blocked') {
    return { state: 'revoked', label: 'Revocada', color: 'negative', icon: 'block' }
  }

  //  2) Expirada
  if (expiresMs !== null && nowMs >= expiresMs) {
    return { state: 'expires', label: 'Expirada', color: 'grey-8', icon: 'event_busy' }
  }

  //  3) Renovación expirada (rotación)
  if (rotatesMs !== null) {
    // días para la fecha de renovación (rotación)
    const diasParaRenovar = Math.ceil((rotatesMs - nowMs) / MS_DAY)

    const renewFromMs = rotatesMs - renewWindowDays * MS_DAY

    const needsRenew = nowMs >= renewFromMs

    if (needsRenew) {
      const label = nowMs >= rotatesMs ? 'Renovar ahora' : `${diasParaRenovar} día(s) para renovar`
      return { state: 'renew', label, color: 'warning', icon: 'autorenew' }
    }
  }

  //  4) Activa (si estatus 'active')
  if (status === 'active') {
    //  Hint opcional: sin uso
    if (showUnsedHint) {
      const isUnsed = lastUsedMs === null || nowMs - lastUsedMs >= unsedDays * MS_DAY

      if (isUnsed) {
        return { state: 'active_unsed', label: 'Activa (sin uso)', color: 'blue', icon: 'info' }
      }
    }

    return { state: 'active', label: 'Activa', color: 'positive', icon: 'check_circle' }
  }

  // 5) Inactiva / desconocida
  if (!status) {
    if (treatMissingDatesAs === 'unknown') {
      return { state: 'unknown', label: 'Estado desconocido', color: 'grey-7', icon: 'help' }
    }
    return { state: 'active', label: 'Activa', color: 'positive', icon: 'check_circle' }
  }

  return { state: 'inactive', label: 'Inactiva', color: 'negative', icon: 'block' }
}

const apiKeyUi = computed(() => {
  const opts = { renewWindowDays: 7 }
  return (row) => getApiKeyLifecycleUi(row, opts)
})

const cargarKeys = async () => {
  try {
    const { data } = await ApiKeyService.getAll({ page: 0, size: 25 })
    rows.value = data.items || data
  } catch (err) {
    console.log('❌ Error al cargar las API Keys: ', err.message)
    $q.notify({ type: 'negative', message: 'Error cargando llaves' })
  }
}

const crearAPIKey = async () => {
  try {
    const payload = { ...form.value }
    await ApiKeyService.create(payload, form.value.formato)
    $q.notify({
      type: 'positive',
      message: 'Llave creada. La descarga comenzará automáticamente.',
    })

    form.value.name = ''
    modalOpen.value = false
    cargarKeys()
  } catch (error) {
    console.error('❌ Error al crear una nueva API Key: ', error.message)
    $q.notify({ type: 'negative', message: 'Error creando claves' })
    return
  }
}

const renewToken = async (id) => {
  try {
    const payload = {
      ttlDays,
      rotateDays,
    }

    await ApiKeyService.renew(id, payload)

    $q.notify({
      type: 'positive',
      message: 'API Key renovada correctamente!',
    })

    cargarKeys()
  } catch (error) {
    console.error('❌ Error al renovar API Key: ', error.message)
    $q.notify({
      type: 'negative',
      message: 'Llave creada. La descarga comenzará automáticamente.',
    })
  }
}

const abrirModalCrear = () => {
  modalOpen.value = true
}

const abrirModalRateLimit = () => {
  rateLimitDialog.value = true
}

onMounted(() => {
  cargarKeys()
})
</script>

<style lang="scss" scoped>
// Fondo general oscuro
.bg-dark-page {
  min-height: 100vh;
}

// Contenedor centrado (si usas bootstrap grid o similar, esto ayuda)
.container {
  max-width: 1400px;
  margin: 0 auto;
}

// Tarjeta moderna con efecto glassmorphism o solido
.modern-card {
  background: #1e1e2f;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3);
  overflow: hidden;
}

// Estilos de la Tabla
.api-keys-table {
  background: transparent;

  /* Header de la tabla */
  :deep(thead tr:first-child th) {
    background-color: #2b2b3d; // Un poco más claro que el fondo de la tarjeta
    font-size: 0.85rem;
    padding: 16px;
  }

  /* Filas del cuerpo */
  .body-row {
    transition: background-color 0.2s ease;

    &:hover {
      background-color: rgba(255, 255, 255, 0.03) !important;
    }
  }
}

.header-modal-bg {
  background-color: #252b37;
}

.body-modal-bg {
  background-color: #333c4d;
}

// Input de búsqueda personalizado
.search-input {
  background: rgba(0, 0, 0, 0.2);
  border-radius: 8px;
  padding: 0 12px;
  min-width: 250px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  transition: all 0.3s ease;

  &:focus-within {
    border-color: var(--q-primary);
    background: rgba(0, 0, 0, 0.3);
  }
}

// Botón "Glossy" del header
.glossy-btn {
  background: linear-gradient(135deg, #1976d2 0%, #1565c0 100%);
  box-shadow: 0 4px 15px rgba(25, 118, 210, 0.4);
  font-weight: 600;
}

// Fuente monoespaciada para las llaves
.font-mono {
  font-family: 'Consolas', 'Monaco', monospace;
  font-size: 0.9em;
  letter-spacing: 0.5px;
}

// Estilos del Modal
.modal-card {
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 20px 50px rgba(0, 0, 0, 0.5);
  border-radius: 12px;
}
</style>
