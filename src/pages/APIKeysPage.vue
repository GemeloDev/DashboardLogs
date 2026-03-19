<template>
  <q-page class="api-keys-page">
    <div class="api-keys-wrap">
      <!-- Header -->
      <section class="api-keys-header">
        <div class="api-keys-header__left">
          <div class="api-keys-header__badge">
            <q-icon name="vpn_key" size="18px" color="cyan" />
            <span>Administración</span>
          </div>

          <h1 class="api-keys-header__title">
            Mis <span class="color-orange-santoro">API Key's</span>
          </h1>

          <p class="api-keys-header__subtitle">
            Gestión y control de accesos
          </p>
        </div>

        <div class="api-keys-header__actions">
          <q-btn
            unelevated
            no-caps
            icon="add"
            label="Nueva API Key"
            class="btn-primary"
            size="md"
            @click="abrirModalCrear"
          />

          <q-btn
            unelevated
            no-caps
            icon="settings"
            label="Rate-limit"
            class="btn-secondary"
            size="md"
            @click="abrirModalRateLimit"
          />
        </div>
      </section>

      <!-- Tabla -->
      <section class="table-shell">
        <q-card flat bordered class="modern-card">
          <q-card-section class="q-pa-none">
            <q-table
              :rows="filteredRows"
              :columns="columns"
              row-key="id"
              class="api-keys-table"
              :pagination="{ rowsPerPage: 10 }"
            >
              <template v-slot:top>
                <div class="row items-center full-width q-px-lg q-py-md">
                  <div>
                    <div class="table-title">Listado de Llaves</div>
                    <div class="table-subtitle">
                      Administra las credenciales disponibles del sistema
                    </div>
                  </div>

                  <q-space />

                  <q-input
                    outlined
                    dense
                    debounce="300"
                    v-model="filter"
                    placeholder="Buscar por nombre, descripción, scope o estado..."
                    class="search-input premium-input"
                    clearable
                  >
                    <template v-slot:prepend>
                      <q-icon name="search" class="input-icon" />
                    </template>
                  </q-input>
                </div>
              </template>

              <template v-slot:header="props">
                <q-tr :props="props" class="header-row">
                  <q-th
                    v-for="col in props.cols"
                    :key="col.name"
                    :props="props"
                    class="text-weight-bold text-uppercase"
                  >
                    {{ col.label }}
                  </q-th>
                </q-tr>
              </template>

              <template v-slot:body="props">
                <q-tr :props="props" class="body-row">
                  <q-td key="nombre" :props="props">
                    <div class="key-main">
                      <div class="key-avatar">
                        <q-icon name="key" size="18px" />
                      </div>

                      <div>
                        <div class="key-name">{{ props.row.name }}</div>
                        <div class="key-description">
                          {{ props.row.descripcion || 'Sin descripción' }}
                        </div>
                      </div>
                    </div>
                  </q-td>

                  <q-td key="scopes" :props="props">
                    <div class="row q-gutter-xs">
                      <q-chip
                        v-for="scope in normalizeScopes(props.row.scopes)"
                        :key="scope"
                        dense
                        class="scope-chip"
                        text-color="white"
                        size="sm"
                      >
                        {{ scope }}
                      </q-chip>
                    </div>
                  </q-td>

                  <q-td key="estado" :props="props">
                    <q-chip
                      dense
                      text-color="white"
                      :icon="apiKeyUi(props.row).icon"
                      :class="statusChipClass(props.row)"
                    >
                      {{ apiKeyUi(props.row).label }}
                    </q-chip>
                  </q-td>

                  <q-td key="creado" :props="props">
                    <div class="table-muted">
                      {{ formatearFecha(props.row.createdAt) }}
                    </div>
                  </q-td>

                  <q-td key="ultimoUso" :props="props">
                    <div class="table-muted">
                      {{ timeAgoIntl(props.row.lastUsedAt) }}
                    </div>
                  </q-td>

                  <q-td key="acciones" :props="props" align="center">
                    <div class="row justify-center q-gutter-x-sm">
                      <q-btn
                        flat
                        round
                        dense
                        icon="autorenew"
                        size="sm"
                        class="action-btn action-btn--renew"
                        @click="renewToken(props.row.id)"
                        :disable="props.row.status !== 'active'"
                      >
                        <q-tooltip class="glass-tooltip">Renovar Token</q-tooltip>
                      </q-btn>

                      <q-btn
                        flat
                        round
                        dense
                        icon="delete"
                        size="sm"
                        class="action-btn action-btn--delete"
                        :disable="props.row.status !== 'active'"
                        @click="abrirModalRevocar(props.row)"
                      >
                        <q-tooltip class="glass-tooltip">Revocar</q-tooltip>
                      </q-btn>
                    </div>
                  </q-td>
                </q-tr>
              </template>

              <template v-slot:no-data>
                <div class="full-width row flex-center q-gutter-sm q-pa-xl empty-state">
                  <q-icon size="2em" name="sentiment_dissatisfied" />
                  <span>No se encontraron API Keys con ese criterio.</span>
                </div>
              </template>
            </q-table>
          </q-card-section>
        </q-card>
      </section>
    </div>

    <!-- Modal crear -->
    <q-dialog v-model="modalOpen" persistent>
      <q-card flat bordered class="modal-card">
        <q-card-section class="dialog-header row items-center justify-between">
          <div class="row items-center q-gutter-md">
            <div class="dialog-icon">
              <q-icon name="vpn_key" size="24px" color="white" />
            </div>
            <div>
              <div class="dialog-title">Nueva API Key</div>
              <div class="dialog-subtitle">Genera una nueva llave de acceso</div>
            </div>
          </div>

          <q-btn icon="close" flat round dense v-close-popup class="dialog-close-btn" />
        </q-card-section>

        <q-card-section class="dialog-body">
          <q-form class="q-gutter-md">
            <div>
              <label class="input-label">Nombre de la llave</label>
              <q-input
                outlined
                dense
                v-model="form.name"
                class="premium-input"
                placeholder="Nombre de la API Key"
                hint="El archivo de credenciales tendrá este nombre"
                :rules="[(val) => !!val || 'El nombre es requerido']"
              >
                <template v-slot:append>
                  <q-btn-dropdown
                    no-caps
                    unelevated
                    class="format-dropdown"
                    :label="'.' + form.formato"
                  >
                    <q-list class="format-dropdown-menu">
                      <q-item clickable v-close-popup @click="form.formato = 'txt'">
                        <q-item-section>
                          <q-item-label class="text-white">.txt</q-item-label>
                        </q-item-section>
                      </q-item>

                      <q-item clickable v-close-popup @click="form.formato = 'json'">
                        <q-item-section>
                          <q-item-label class="text-white">.json</q-item-label>
                        </q-item-section>
                      </q-item>
                    </q-list>
                  </q-btn-dropdown>
                </template>
              </q-input>
            </div>
          </q-form>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="btn-cancel" v-close-popup />
          <q-btn
            no-caps
            unelevated
            label="Generar Llave"
            class="btn-primary"
            @click="crearAPIKey"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <!-- Modal confirmar revocación -->
    <q-dialog v-model="revokeDialog">
      <q-card flat bordered class="modal-card modal-card--danger">
        <q-card-section class="dialog-header row items-center q-gutter-sm">
          <div class="dialog-icon dialog-icon--danger">
            <q-icon name="warning" size="24px" color="white" />
          </div>

          <div>
            <div class="dialog-title">Confirmar revocación</div>
            <div class="dialog-subtitle">Esta acción desactivará el acceso de la llave</div>
          </div>
        </q-card-section>

        <q-card-section class="dialog-body">
          <div class="text-body1 text-white">
            ¿Deseas revocar esta API Key?
          </div>

          <div v-if="selectedApiKey" class="selected-key-box">
            <div class="selected-key-name">
              {{ selectedApiKey.name }}
            </div>
            <div class="selected-key-description">
              {{ selectedApiKey.descripcion || 'Sin descripción' }}
            </div>
          </div>

          <div class="warning-text">
            Esta acción desactivará el acceso de la llave seleccionada.
          </div>
        </q-card-section>

        <q-card-actions align="right" class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="btn-cancel" v-close-popup />
          <q-btn
            no-caps
            unelevated
            label="Sí, revocar"
            icon="delete_forever"
            class="btn-danger"
            :loading="revoking"
            @click="confirmarRevocacion"
          />
        </q-card-actions>
      </q-card>
    </q-dialog>

    <rate-limit-config v-model="rateLimitDialog" />
  </q-page>
</template>

<script setup>
import { useQuasar } from 'quasar'
import { computed, onMounted, ref } from 'vue'
import RateLimitConfig from 'src/components/blocks/RateLimitConfig.vue'
import { timeAgoIntl, formatearFecha } from 'src/helpers'
import { ApiKeyService } from 'src/services/apiKeys'

const $q = useQuasar()

const filter = ref('')
const modalOpen = ref(false)
const rows = ref([])
const rateLimitDialog = ref(false)

const revokeDialog = ref(false)
const selectedApiKey = ref(null)
const revoking = ref(false)

const ttlDays = 35
const rotateDays = 30

const form = ref({
  name: '',
  systemId: null,
  environmentId: null,
  scopes: ['LOGS_INGEST'],
  ttlDays,
  formato: 'txt',
  rotateDays,
})

const columns = [
  {
    name: 'nombre',
    required: true,
    label: 'Nombre / Aplicación',
    align: 'left',
    field: row => row.name || '',
    sortable: true,
  },
  {
    name: 'scopes',
    label: 'Scopes',
    align: 'left',
    field: row => normalizeScopes(row.scopes).join(', '),
    sortable: false,
  },
  {
    name: 'estado',
    align: 'center',
    label: 'Estado',
    field: row => getApiKeyLifecycleUi(row, { renewWindowDays: 7 }).label,
    sortable: true,
  },
  {
    name: 'creado',
    align: 'center',
    label: 'Creado',
    field: row => row.createdAt || '',
    sortable: true,
  },
  {
    name: 'ultimoUso',
    align: 'center',
    label: 'Último Uso',
    field: row => row.lastUsedAt || '',
    sortable: true,
  },
  {
    name: 'acciones',
    align: 'center',
    label: 'Acciones',
    field: 'acciones',
  },
]

const MS_DAY = 24 * 60 * 60 * 1000

function toMs(d) {
  if (!d) return null
  const t = new Date(d).getTime()
  return Number.isFinite(t) ? t : null
}

function normalizeScopes(scopes) {
  if (!scopes) return []
  if (Array.isArray(scopes)) return scopes
  if (typeof scopes === 'string') {
    return scopes
      .split(',')
      .map(s => s.trim())
      .filter(Boolean)
  }
  return []
}

function getApiKeyLifecycleUi(apiKey, opts = {}) {
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

  if (status === 'revoked' || status === 'disabled' || status === 'blocked') {
    return { state: 'revoked', label: 'Revocada', color: 'negative', icon: 'block' }
  }

  if (expiresMs !== null && nowMs >= expiresMs) {
    return { state: 'expired', label: 'Expirada', color: 'grey-8', icon: 'event_busy' }
  }

  if (rotatesMs !== null) {
    const diasParaRenovar = Math.ceil((rotatesMs - nowMs) / MS_DAY)
    const renewFromMs = rotatesMs - renewWindowDays * MS_DAY
    const needsRenew = nowMs >= renewFromMs

    if (needsRenew) {
      const label = nowMs >= rotatesMs ? 'Renovar ahora' : `${diasParaRenovar} día(s) para renovar`
      return { state: 'renew', label, color: 'warning', icon: 'autorenew' }
    }
  }

  if (status === 'active') {
    if (showUnsedHint) {
      const isUnused = lastUsedMs === null || nowMs - lastUsedMs >= unsedDays * MS_DAY

      if (isUnused) {
        return { state: 'active_unused', label: 'Activa (sin uso)', color: 'blue', icon: 'info' }
      }
    }

    return { state: 'active', label: 'Activa', color: 'positive', icon: 'check_circle' }
  }

  if (!status) {
    if (treatMissingDatesAs === 'unknown') {
      return { state: 'unknown', label: 'Estado desconocido', color: 'grey-7', icon: 'help' }
    }
    return { state: 'active', label: 'Activa', color: 'positive', icon: 'check_circle' }
  }

  return { state: 'inactive', label: 'Inactiva', color: 'negative', icon: 'block' }
}

const apiKeyUi = (row) => getApiKeyLifecycleUi(row, { renewWindowDays: 7 })

const filteredRows = computed(() => {
  const term = filter.value?.trim().toLowerCase()

  if (!term) return rows.value

  return rows.value.filter((row) => {
    const estado = apiKeyUi(row).label.toLowerCase()
    const scopes = normalizeScopes(row.scopes).join(' ').toLowerCase()

    const searchable = [
      row.name,
      row.descripcion,
      row.status,
      estado,
      scopes,
      formatearFecha(row.createdAt),
      timeAgoIntl(row.lastUsedAt),
    ]
      .filter(Boolean)
      .join(' ')
      .toLowerCase()

    return searchable.includes(term)
  })
})

const cargarKeys = async () => {
  try {
    const { data } = await ApiKeyService.getAll({ page: 0, size: 25 })
    rows.value = data.items || data || []
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
    await cargarKeys()
  } catch (error) {
    console.error('❌ Error al crear una nueva API Key: ', error.message)
    $q.notify({ type: 'negative', message: 'Error creando claves' })
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
      message: 'API Key renovada correctamente.',
    })

    await cargarKeys()
  } catch (error) {
    console.error('❌ Error al renovar API Key: ', error.message)
    $q.notify({
      type: 'negative',
      message: 'Error al renovar la API Key.',
    })
  }
}

const abrirModalCrear = () => {
  modalOpen.value = true
}

const abrirModalRateLimit = () => {
  rateLimitDialog.value = true
}

const abrirModalRevocar = (row) => {
  selectedApiKey.value = row
  revokeDialog.value = true
}

const confirmarRevocacion = async () => {
  if (!selectedApiKey.value?.id) return

  revoking.value = true

  try {
    await ApiKeyService.delete(selectedApiKey.value.id)

    $q.notify({
      type: 'positive',
      message: `API Key "${selectedApiKey.value.name}" revocada correctamente.`,
    })

    revokeDialog.value = false
    selectedApiKey.value = null
    await cargarKeys()
  } catch (error) {
    console.error('❌ Error al revocar API Key: ', error.message)
    $q.notify({
      type: 'negative',
      message: 'Error al revocar la API Key.',
    })
  } finally {
    revoking.value = false
  }
}

const statusChipClass = (row) => {
  const ui = apiKeyUi(row)

  if (ui.color === 'positive' || ui.color === 'green' || row.status === 'active') {
    return 'status-chip-active'
  }

  if (
    ui.color === 'warning' ||
    ui.color === 'orange' ||
    String(ui.label || '').toLowerCase().includes('renovar')
  ) {
    return 'status-chip-warning'
  }

  if (ui.color === 'negative' || ui.color === 'red' || row.status === 'revoked') {
    return 'status-chip-danger'
  }

  return 'status-chip-muted'
}

onMounted(() => {
  cargarKeys()
})
</script>

<style lang="scss" scoped>
.api-keys-page {
  min-height: 100vh;
  background: transparent;
}

.api-keys-wrap {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 36px;
}

/* HEADER */
.api-keys-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 22px;
}

.api-keys-header__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  margin-bottom: 14px;
  color: white;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 0.9rem;
    font-weight: 700;
  }
}

.api-keys-header__title {
  margin: 0 0 10px;
  color: white;
  font-size: clamp(2rem, 3.8vw, 3rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.api-keys-header__subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.api-keys-header__actions {
  display: flex;
  gap: 12px;
  align-items: center;
  flex-wrap: wrap;
}

/* TABLE CARD */
.table-shell {
  border-radius: 24px;
  overflow: hidden;
}

.modern-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border-radius: 24px;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  overflow: hidden;
}

.api-keys-table {
  background: transparent;
  color: white;
}

.api-keys-table :deep(.q-table__top) {
  padding: 0;
}

.api-keys-table :deep(thead tr th) {
  background: rgba(255, 255, 255, 0.03);
  color: #9fd5ff;
  font-size: 0.85rem;
  padding: 16px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.api-keys-table :deep(tbody tr) {
  background: transparent;
}

.api-keys-table :deep(tbody tr:hover) {
  background: rgba(255, 255, 255, 0.03) !important;
}

.api-keys-table :deep(td) {
  color: white;
  border-color: rgba(255, 255, 255, 0.08);
}

.api-keys-table :deep(.q-table__bottom) {
  color: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.table-title {
  color: white;
  font-size: 1.35rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.table-subtitle {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.9rem;
}

.header-row {
  backdrop-filter: blur(8px);
}

.body-row {
  transition: background-color 0.2s ease;
}

.key-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.key-avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  color: #06121f;
  background: linear-gradient(135deg, #60a5fa, #2dd4bf);
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.18);
}

.key-name {
  color: white;
  font-weight: 800;
  margin-bottom: 2px;
}

.key-description {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.88rem;
}

.scope-chip {
  background: rgba(124, 58, 237, 0.16);
  color: #d8b4fe;
  border: 1px solid rgba(124, 58, 237, 0.26);
}

.table-muted {
  color: rgba(255, 255, 255, 0.7);
}

/* STATUS CHIPS */
.status-chip-active {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac !important;
  border: 1px solid rgba(34, 197, 94, 0.26);
}

.status-chip-warning {
  background: rgba(233, 113, 50, 0.14);
  color: #ffb088 !important;
  border: 1px solid rgba(233, 113, 50, 0.25);
}

.status-chip-danger {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5 !important;
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.status-chip-muted {
  background: rgba(156, 163, 175, 0.16);
  color: #d1d5db !important;
  border: 1px solid rgba(156, 163, 175, 0.24);
}

/* SEARCH INPUT */
.search-input {
  min-width: 320px;
}

/* INPUTS */
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

.input-icon {
  color: rgba(255, 255, 255, 0.58);
}

/* ACTION BUTTONS */
.action-btn--renew {
  color: #22d3ee;
}

.action-btn--delete {
  color: #f87171;
}

/* MAIN BUTTONS */
.btn-primary {
  min-height: 52px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  color: white;
  text-transform: none;
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));;
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
}

.btn-secondary {
  min-height: 52px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 18px 38px rgba(233, 113, 50, 0.18);
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.72);
}

.btn-danger {
  min-height: 46px;
  padding: 0 18px;
  border-radius: 14px;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #dc2626 0%, #ef4444 100%);
}

/* MODALS */
.modal-card {
  width: min(92vw, 520px);
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(15, 20, 32, 0.96), rgba(18, 25, 42, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.48);
}

.modal-card--danger {
  width: min(92vw, 480px);
}

.dialog-header {
  padding: 22px 22px 10px;
}

.dialog-icon {
  width: 54px;
  height: 54px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));;
  box-shadow: 0 14px 30px rgba(34, 211, 238, 0.18);
  flex-shrink: 0;
}

.dialog-icon--danger {
  background: linear-gradient(135deg, #e97132, #ef4444);
  box-shadow: 0 14px 30px rgba(233, 113, 50, 0.2);
}

.dialog-title {
  color: white;
  font-size: 1.3rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.dialog-subtitle {
  color: rgba(255, 255, 255, 0.68);
  font-size: 0.92rem;
}

.dialog-body {
  padding: 10px 22px 18px;
}

.dialog-actions {
  padding: 0 22px 22px;
  gap: 12px;
}

.dialog-close-btn {
  color: rgba(255, 255, 255, 0.72);
}

.selected-key-box {
  margin-top: 16px;
  padding: 14px 16px;
  border-radius: 16px;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.selected-key-name {
  color: #9fd5ff;
  font-weight: 800;
  margin-bottom: 4px;
}

.selected-key-description {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.9rem;
}

.warning-text {
  margin-top: 16px;
  color: #ffb088;
}

/* EMPTY STATE */
.empty-state {
  color: rgba(255, 255, 255, 0.58);
}

/* DROPDOWN */
.format-dropdown {
  border-radius: 12px;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #16a34a 0%, #22c55e 100%);
}

.format-dropdown-menu {
  background: linear-gradient(160deg, rgba(15, 20, 32, 0.98), rgba(18, 25, 42, 0.96));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
}

/* TOOLTIP */
.glass-tooltip {
  background: #121a2a !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .api-keys-header {
    flex-direction: column;
    align-items: stretch;
  }

  .api-keys-header__actions {
    justify-content: flex-start;
  }

  .search-input {
    min-width: 100%;
    margin-top: 12px;
  }
}

@media (max-width: 700px) {
  .api-keys-wrap {
    padding: 18px 14px 28px;
  }

  .api-keys-header__actions {
    flex-direction: column;
    align-items: stretch;
  }

  .btn-primary,
  .btn-secondary,
  .btn-danger,
  .btn-cancel {
    width: 100%;
  }
}
</style>
