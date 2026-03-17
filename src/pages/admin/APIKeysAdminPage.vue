<template>
  <q-page class="apikeys-page">
    <div class="apikeys-page__wrap">
      <!-- Header -->
      <section class="apikeys-header">
        <div>
          <div class="apikeys-header__badge">
            <q-icon name="vpn_key" size="18px" color="cyan" />
            <span>Administración</span>
          </div>

          <h1 class="apikeys-header__title">
            Gestión de <span class="color-orange-santoro">API Keys</span>
          </h1>

          <p class="apikeys-header__subtitle">
            Alta, edición, rotación y eliminación de llaves de acceso del sistema.
          </p>
        </div>

        <div class="apikeys-header__actions">
          <q-btn
            unelevated
            no-caps
            icon="add"
            label="Nueva API Key"
            class="btn-primary"
            @click="openCreateDialog"
          />
        </div>
      </section>

      <!-- Toolbar -->
      <section class="apikeys-toolbar">
        <div class="apikeys-toolbar__grid">
          <q-input
            v-model="search"
            outlined
            dense
            clearable
            class="premium-input"
            placeholder="Buscar por nombre, sistema o empresa..."
          >
            <template v-slot:prepend>
              <q-icon name="search" class="input-icon" />
            </template>
          </q-input>

          <q-select
            v-model="filtroEstado"
            outlined
            dense
            emit-value
            map-options
            class="premium-input"
            :options="[
              { label: 'Todos los estados', value: 'todos' },
              { label: 'Activas', value: 'activa' },
              { label: 'Revocadas', value: 'revocada' },
              { label: 'Expiradas', value: 'expirada' }
            ]"
            label="Estado"
          >
            <template v-slot:prepend>
              <q-icon name="filter_alt" class="input-icon" />
            </template>
          </q-select>
        </div>
      </section>

      <!-- Tabla -->
      <section class="apikeys-table-wrap">
        <q-table
          flat
          bordered
          :rows="rowsFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          class="apikeys-table"
          :rows-per-page-options="[5, 10, 15, 20]"
          no-data-label="No se encontraron API Keys"
        >
          <template v-slot:top>
            <div class="table-top">
              <div>
                <div class="table-title">Listado de API Keys</div>
                <div class="table-subtitle">
                  {{ rowsFiltrados.length }} registro(s) encontrado(s)
                </div>
              </div>
            </div>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="key-main">
                <div class="key-avatar">
                  <q-icon name="key" size="18px" />
                </div>
                <div>
                  <div class="key-name">{{ props.row.name }}</div>
                  <div class="key-sub">{{ props.row.system }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-empresa="props">
            <q-td :props="props">
              <q-chip dense class="chip-empresa">
                {{ props.row.empresa }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip dense :class="getStatusChipClass(props.row.status)">
                {{ props.row.status }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template v-slot:body-cell-lastUse="props">
            <q-td :props="props">
              {{ props.row.lastUse || 'Nunca' }}
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="table-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="edit"
                  class="action-btn action-btn--edit"
                  @click="openEditDialog(props.row)"
                >
                  <q-tooltip class="glass-tooltip">Editar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="sync"
                  class="action-btn action-btn--rotate"
                  @click="rotateKey(props.row)"
                >
                  <q-tooltip class="glass-tooltip">Rotar</q-tooltip>
                </q-btn>

                <q-btn
                  flat
                  round
                  dense
                  icon="delete"
                  class="action-btn action-btn--delete"
                  @click="confirmDelete(props.row)"
                >
                  <q-tooltip class="glass-tooltip">Eliminar</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </section>
    </div>

    <!-- Dialog crear / editar -->
    <q-dialog v-model="dialogOpen" persistent>
      <q-card flat bordered class="dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon">
            <q-icon :name="isEdit ? 'edit' : 'vpn_key'" size="24px" color="white" />
          </div>

          <div>
            <div class="dialog-title">
              {{ isEdit ? 'Editar API Key' : 'Nueva API Key' }}
            </div>
            <div class="dialog-subtitle">
              Captura la información principal de la llave.
            </div>
          </div>
        </div>

        <q-card-section class="dialog-body">
          <div class="dialog-grid">
            <div class="field-span-2">
              <label class="input-label">Nombre</label>
              <q-input
                v-model="form.name"
                outlined
                dense
                class="premium-input"
                placeholder="Nombre de la API Key"
              />
            </div>

            <div>
              <label class="input-label">Sistema</label>
              <q-input
                v-model="form.system"
                outlined
                dense
                class="premium-input"
                placeholder="Ej. Ticket-System"
              />
            </div>

            <div>
              <label class="input-label">Empresa</label>
              <q-input
                v-model="form.empresa"
                outlined
                dense
                class="premium-input"
                placeholder="Empresa relacionada"
              />
            </div>

            <div>
              <label class="input-label">Estado</label>
              <q-select
                v-model="form.status"
                outlined
                dense
                class="premium-input"
                :options="['Activa', 'Revocada', 'Expirada']"
              />
            </div>

            <div>
              <label class="input-label">Último uso</label>
              <q-input
                v-model="form.lastUse"
                outlined
                dense
                class="premium-input"
                placeholder="Ej. hace 2 horas"
              />
            </div>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="btn-cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="isEdit ? 'Guardar cambios' : 'Crear API Key'"
            class="btn-primary"
            @click="saveKey"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Dialog eliminar -->
    <q-dialog v-model="deleteDialog">
      <q-card flat bordered class="delete-dialog">
        <div class="delete-icon">
          <q-icon name="delete_forever" size="40px" color="negative" />
        </div>

        <div class="delete-title">Eliminar API Key</div>
        <div class="delete-text">
          ¿Deseas eliminar la llave <strong>{{ selectedKey?.name }}</strong>?
          Esta acción no se puede deshacer.
        </div>

        <div class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="btn-cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Eliminar"
            color="negative"
            class="btn-delete"
            @click="deleteKey"
          />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const search = ref('')
const filtroEstado = ref('todos')
const dialogOpen = ref(false)
const deleteDialog = ref(false)
const isEdit = ref(false)
const selectedKey = ref(null)

const rows = ref([
  {
    id: 1,
    name: 'PRUEBA',
    system: 'Auth-Service',
    empresa: 'Grupo Santoro',
    status: 'Activa',
    createdAt: '2026-03-10',
    lastUse: 'Nunca',
  },
  {
    id: 2,
    name: 'API_PRUEBA_JSON',
    system: 'JSON-Service',
    empresa: 'Santoro Tech',
    status: 'Revocada',
    createdAt: '2026-03-10',
    lastUse: 'Nunca',
  },
  {
    id: 3,
    name: 'Ticket-System',
    system: 'Tickets',
    empresa: 'Grupo Santoro',
    status: 'Activa',
    createdAt: '2026-02-16',
    lastUse: 'hace 22 horas',
  },
  {
    id: 4,
    name: 'TrustValue-ApiKey',
    system: 'TrustValue',
    empresa: 'Logística Santoro',
    status: 'Expirada',
    createdAt: '2026-02-09',
    lastUse: 'el mes pasado',
  },
])

const form = ref(emptyForm())

function emptyForm() {
  return {
    id: null,
    name: '',
    system: '',
    empresa: '',
    status: 'Activa',
    createdAt: null,
    lastUse: 'Nunca',
  }
}

const columns = [
  {
    name: 'name',
    label: 'NOMBRE / APLICACIÓN',
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'empresa',
    label: 'EMPRESA',
    field: 'empresa',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: 'ESTADO',
    field: 'status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: 'CREADO',
    field: 'createdAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'lastUse',
    label: 'ÚLTIMO USO',
    field: 'lastUse',
    align: 'left',
    sortable: true,
  },
  {
    name: 'acciones',
    label: 'ACCIONES',
    field: 'acciones',
    align: 'center',
  },
]

const pagination = ref({
  page: 1,
  rowsPerPage: 10,
})

const rowsFiltrados = computed(() => {
  let result = [...rows.value]

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter((item) =>
      [item.name, item.system, item.empresa].some((v) =>
        String(v || '').toLowerCase().includes(q),
      ),
    )
  }

  if (filtroEstado.value === 'activa') {
    result = result.filter((item) => item.status === 'Activa')
  } else if (filtroEstado.value === 'revocada') {
    result = result.filter((item) => item.status === 'Revocada')
  } else if (filtroEstado.value === 'expirada') {
    result = result.filter((item) => item.status === 'Expirada')
  }

  return result
})

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

const getStatusChipClass = (status) => {
  if (status === 'Activa') return 'chip-active'
  if (status === 'Revocada') return 'chip-revoked'
  return 'chip-expired'
}

const openCreateDialog = () => {
  isEdit.value = false
  form.value = emptyForm()
  dialogOpen.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  form.value = { ...row }
  dialogOpen.value = true
}

const saveKey = () => {
  if (!form.value.name?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'El nombre de la API Key es requerido.',
      position: 'top',
    })
    return
  }

  if (!form.value.system?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'El sistema es requerido.',
      position: 'top',
    })
    return
  }

  if (!form.value.empresa?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'La empresa es requerida.',
      position: 'top',
    })
    return
  }

  if (isEdit.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    if (idx !== -1) rows.value[idx] = { ...form.value }

    $q.notify({
      type: 'positive',
      message: 'API Key actualizada correctamente.',
      position: 'top',
    })
  } else {
    rows.value.unshift({
      ...form.value,
      id: Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    })

    $q.notify({
      type: 'positive',
      message: 'API Key creada correctamente.',
      position: 'top',
    })
  }

  dialogOpen.value = false
}

const rotateKey = (row) => {
  $q.notify({
    type: 'positive',
    message: `La API Key "${row.name}" fue rotada correctamente.`,
    position: 'top',
  })
}

const confirmDelete = (row) => {
  selectedKey.value = row
  deleteDialog.value = true
}

const deleteKey = () => {
  if (!selectedKey.value) return

  rows.value = rows.value.filter((r) => r.id !== selectedKey.value.id)
  deleteDialog.value = false
  selectedKey.value = null

  $q.notify({
    type: 'positive',
    message: 'API Key eliminada correctamente.',
    position: 'top',
  })
}
</script>

<style lang="scss" scoped>
.apikeys-page {
  min-height: 100vh;
  background: transparent;
}

.apikeys-page__wrap {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 36px;
}

/* HEADER */
.apikeys-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 22px;
}

.apikeys-header__badge {
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

.apikeys-header__title {
  margin: 0 0 10px;
  color: white;
  font-size: clamp(2rem, 3.8vw, 3rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.apikeys-header__subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

.apikeys-header__actions {
  display: flex;
  align-items: center;
}

/* TOOLBAR */
.apikeys-toolbar {
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
}

.apikeys-toolbar__grid {
  display: grid;
  grid-template-columns: 1.4fr 0.5fr;
  gap: 16px;
}

/* TABLE */
.apikeys-table-wrap {
  border-radius: 24px;
  overflow: hidden;
}

.apikeys-table {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  color: white;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.apikeys-table :deep(.q-table__top) {
  padding: 22px 24px 14px;
}

.apikeys-table :deep(thead tr th) {
  background: rgba(255, 255, 255, 0.03);
  color: #9fd5ff;
  font-weight: 800;
  font-size: 0.88rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.apikeys-table :deep(tbody tr:hover) {
  background: rgba(255, 255, 255, 0.03);
}

.apikeys-table :deep(td) {
  color: white;
  border-color: rgba(255, 255, 255, 0.08);
}

.apikeys-table :deep(.q-table__bottom) {
  color: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.apikeys-table :deep(.q-table__control),
.apikeys-table :deep(.q-field__native),
.apikeys-table :deep(.q-field__input),
.apikeys-table :deep(.q-select__dropdown-icon) {
  color: white !important;
}

.table-top {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}

.table-title {
  color: white;
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.table-subtitle {
  color: rgba(255, 255, 255, 0.58);
  font-size: 0.92rem;
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
  font-size: 0.95rem;
  color: #06121f;
  background: #e97132;
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.18);
}

.key-name {
  color: white;
  font-weight: 800;
  margin-bottom: 2px;
}

.key-sub {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.88rem;
}

.table-actions {
  display: flex;
  justify-content: center;
  gap: 8px;
}

.action-btn--edit {
  color: #22d3ee;
}

.action-btn--rotate {
  color: #e97132;
}

.action-btn--delete {
  color: #f87171;
}

/* INPUTS */
.premium-input {
  :deep(.q-field__control) {
    min-height: 56px;
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

/* CHIPS */
.chip-empresa {
  background: rgba(124, 58, 237, 0.16);
  color: #d8b4fe;
  border: 1px solid rgba(124, 58, 237, 0.26);
}

.chip-active {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.26);
}

.chip-revoked {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.24);
}

.chip-expired {
  background: rgba(156, 163, 175, 0.16);
  color: #d1d5db;
  border: 1px solid rgba(156, 163, 175, 0.25);
}

/* BUTTONS */
.btn-primary {
  min-height: 52px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%);
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.72);
}

.btn-delete {
  border-radius: 14px;
  min-height: 46px;
  padding: 0 18px;
  text-transform: none;
}

/* DIALOG */
.dialog-card,
.delete-dialog {
  width: min(92vw, 720px);
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(15, 20, 32, 0.96), rgba(18, 25, 42, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.48);
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 10px;
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

.dialog-title {
  color: white;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.dialog-subtitle {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.94rem;
}

.dialog-body {
  padding: 8px 24px 18px;
}

.dialog-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
}

.field-span-2 {
  grid-column: span 2;
}

.input-label {
  display: block;
  margin-bottom: 10px;
  color: white;
  font-size: 0.94rem;
  font-weight: 700;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
}

.delete-dialog {
  width: min(92vw, 480px);
  padding: 28px 24px 22px;
  text-align: center;
}

.delete-icon {
  width: 78px;
  height: 78px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  margin: 0 auto 16px;
  background: rgba(239, 68, 68, 0.12);
  border: 1px solid rgba(239, 68, 68, 0.18);
}

.delete-title {
  color: white;
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.delete-text {
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.98rem;
  line-height: 1.65;
  margin-bottom: 22px;
}

/* TOOLTIPS */
.glass-tooltip {
  background: #121a2a !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

/* RESPONSIVE */
@media (max-width: 900px) {
  .apikeys-toolbar__grid {
    grid-template-columns: 1fr;
  }

  .apikeys-header {
    flex-direction: column;
    align-items: stretch;
  }

  .apikeys-header__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .apikeys-page__wrap {
    padding: 18px 14px 28px;
  }

  .dialog-grid {
    grid-template-columns: 1fr;
  }

  .field-span-2 {
    grid-column: span 1;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .btn-primary,
  .btn-delete,
  .btn-cancel {
    width: 100%;
  }
}
</style>
