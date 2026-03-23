<template>
  <q-page class="users-page">
    <div class="users-page__wrap">
      <!-- Header -->
      <section class="users-header">
        <div>
          <div class="users-header__badge">
            <q-icon name="group" size="18px" color="cyan" />
            <span>Administración</span>
          </div>

          <h1 class="users-header__title">
            Gestión de <span class="color-orange-santoro">Usuarios</span>
          </h1>

          <p class="users-header__subtitle">
            Alta, edición y eliminación de usuarios del sistema.
          </p>
        </div>
      </section>

      <!-- Toolbar -->
      <section class="users-toolbar">
        <div class="users-toolbar__grid">
          <q-input
            v-model="search"
            outlined
            dense
            clearable
            class="premium-input"
            placeholder="Buscar por nombre, email o empresa..."
          >
            <template v-slot:prepend>
              <q-icon name="search" class="input-icon" />
            </template>
          </q-input>

          <q-select
            v-model="filtroEmpresa"
            outlined
            dense
            emit-value
            map-options
            class="premium-input"
            :options="opcionesEmpresa"
            label="Empresa"
          >
            <template v-slot:prepend>
              <q-icon name="apartment" class="input-icon" />
            </template>
          </q-select>

          <q-select
            v-model="filtroEstado"
            outlined
            dense
            emit-value
            map-options
            class="premium-input"
            :options="[
              { label: 'Todos los estados', value: 'todos' },
              { label: 'Activos', value: 'activo' },
              { label: 'Inactivos', value: 'inactivo' },
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
      <section class="users-table-wrap">
        <q-table
          flat
          bordered
          :rows="rowsFiltrados"
          :columns="columns"
          row-key="id"
          :pagination="pagination"
          class="users-table"
          :rows-per-page-options="[5, 10, 15, 20]"
          no-data-label="No se encontraron usuarios"
        >
          <template v-slot:top>
            <div class="table-top">
              <div>
                <div class="table-title">Listado de Usuarios</div>
                <div class="table-subtitle">
                  {{ rowsFiltrados.length }} registro(s) encontrado(s)
                </div>
              </div>
            </div>
          </template>

          <template v-slot:body-cell-name="props">
            <q-td :props="props">
              <div class="user-main">
                <div class="user-avatar">
                  {{ getInitials(props.row.name) }}
                </div>
                <div>
                  <div class="user-name">{{ props.row.name }}</div>
                  <div class="user-email">{{ props.row.email }}</div>
                </div>
              </div>
            </q-td>
          </template>

          <template v-slot:body-cell-empresa="props">
            <q-td :props="props">
              <q-chip dense class="chip-role">
                {{ props.row.orgName || 'Sin empresa' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip dense :class="props.row.status ? 'chip-active' : 'chip-inactive'">
                {{ props.row.status ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-fechaCreacion="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template v-slot:body-cell-acciones="props">
            <q-td :props="props">
              <div class="table-actions">
                <q-btn
                  flat
                  round
                  dense
                  icon="info"
                  class="action-btn action-btn--edit"
                  @click="openDetailDialog(props.row)"
                >
                  <q-tooltip class="glass-tooltip">Ver detalles</q-tooltip>
                </q-btn>
              </div>
            </q-td>
          </template>
        </q-table>
      </section>
    </div>

    <!-- Modal detalle de usuario -->
    <q-dialog v-model="detailDialog">
      <q-card flat bordered class="dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon">
            <q-icon name="person" size="24px" color="white" />
          </div>
          <div>
            <div class="dialog-title">Detalle de usuario</div>
            <div class="dialog-subtitle">Información completa del usuario seleccionado.</div>
          </div>
        </div>

        <q-card-section class="dialog-body" v-if="selectedUser">
          <!-- Avatar + nombre -->
          <div class="detail-hero">
            <div class="detail-avatar">
              {{ getInitials(selectedUser.name) }}
              <div
                class="detail-status-dot"
                :class="selectedUser.status ? 'is-active' : 'is-inactive'"
              />
            </div>
            <div>
              <div class="detail-name">{{ selectedUser.name }}</div>
              <div class="detail-email">{{ selectedUser.email }}</div>
              <q-chip
                dense
                :class="selectedUser.status ? 'chip-active' : 'chip-inactive'"
                class="q-mt-xs"
              >
                {{ selectedUser.status ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </div>
          </div>

          <!-- Grid de datos -->
          <div class="detail-grid">
            <div class="detail-field">
              <div class="detail-field__label">
                <q-icon name="apartment" size="14px" class="q-mr-xs" />Empresa
              </div>
              <div class="detail-field__value">{{ selectedUser.orgName || 'Sin empresa' }}</div>
            </div>

            <div class="detail-field">
              <div class="detail-field__label">
                <q-icon name="badge" size="14px" class="q-mr-xs" />ID
              </div>
              <div class="detail-field__value detail-field__value--mono">{{ selectedUser.id }}</div>
            </div>

            <div class="detail-field">
              <div class="detail-field__label">
                <q-icon name="event" size="14px" class="q-mr-xs" />Fecha de creación
              </div>
              <div class="detail-field__value">{{ formatDate(selectedUser.createdAt) }}</div>
            </div>

            <div class="detail-field">
              <div class="detail-field__label">
                <q-icon name="schedule" size="14px" class="q-mr-xs" />Zona horaria
              </div>
              <div class="detail-field__value">{{ selectedUser.timezone || '—' }}</div>
            </div>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat no-caps label="Cerrar" class="btn-cancel" v-close-popup />
        </div>
      </q-card>
    </q-dialog>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { DashboardSantoro } from 'src/services/dashboardSantoro'

const $q = useQuasar()

const search = ref('')
const filtroEstado = ref('todos')
const filtroEmpresa = ref('todas')
const detailDialog = ref(false)
const selectedUser = ref(null)

const rows = ref([])

// ─── Opciones dinámicas de empresa ───────────────────────────────────────────
const opcionesEmpresa = computed(() => {
  const empresas = [...new Set(rows.value.map((u) => u.orgName).filter(Boolean))]
  return [
    { label: 'Todas las empresas', value: 'todas' },
    ...empresas.map((e) => ({ label: e, value: e })),
  ]
})

const columns = [
  { name: 'name', label: 'USUARIO', field: 'name', align: 'left', sortable: true },
  { name: 'empresa', label: 'EMPRESA', field: 'empresa', align: 'left', sortable: true },
  { name: 'activo', label: 'ESTADO', field: 'activo', align: 'left', sortable: true },
  { name: 'fechaCreacion', label: 'FECHA CREACIÓN', field: 'fechaCreacion', align: 'left', sortable: true },
  { name: 'acciones', label: 'ACCIONES', field: 'acciones', align: 'center' },
]

const pagination = ref({ page: 1, rowsPerPage: 10 })

const rowsFiltrados = computed(() => {
  let result = [...rows.value]

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    result = result.filter((item) =>
      [item.name, item.email, item.orgName].some((v) =>
        String(v || '').toLowerCase().includes(q),
      ),
    )
  }

  if (filtroEmpresa.value !== 'todas') {
    result = result.filter((item) => item.orgName === filtroEmpresa.value)
  }

  if (filtroEstado.value === 'activo') {
    result = result.filter((item) => item.status)
  } else if (filtroEstado.value === 'inactivo') {
    result = result.filter((item) => !item.status)
  }

  return result
})

// ─── Helpers ─────────────────────────────────────────────────────────────────
const getInitials = (name) =>
  String(name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((x) => x[0].toUpperCase())
    .join('')

const formatDate = (date) => {
  if (!date) return '—'
  return new Date(date).toLocaleDateString('es-MX', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })
}

// ─── Dialog detalle ───────────────────────────────────────────────────────────
const openDetailDialog = (row) => {
  selectedUser.value = row
  detailDialog.value = true
}

// ─── Carga inicial ────────────────────────────────────────────────────────────
async function loadUsers() {
  const response = await DashboardSantoro.getUsers()

  if (!response.ok) {
    $q.notify({ type: 'negative', position: 'top', message: response.message })
    return
  }

  rows.value = response.data.content
  $q.notify({
    type: 'positive',
    position: 'top',
    message: response.message + ' obtenidos correctamente' || 'Usuarios obtenidos correctamente.',
  })
}

onMounted(() => {
  loadUsers()
})
</script>

<style lang="scss" scoped>
.users-page {
  min-height: 100vh;
  background: transparent;
}

.users-page__wrap {
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
  padding: 24px 20px 36px;
}

.users-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 22px;
}

.users-header__badge {
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

.users-header__title {
  margin: 0 0 10px;
  color: white;
  font-size: clamp(2rem, 3.8vw, 3rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.users-header__subtitle {
  margin: 0;
  color: rgba(255, 255, 255, 0.72);
  font-size: 1rem;
  line-height: 1.7;
}

// ─── Toolbar ─────────────────────────────────────────────────────────────────
.users-toolbar {
  margin-bottom: 20px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
}

.users-toolbar__grid {
  display: grid;
  grid-template-columns: 1.6fr 0.7fr 0.5fr;
  gap: 16px;
}

// ─── Tabla ────────────────────────────────────────────────────────────────────
.users-table-wrap {
  border-radius: 24px;
  overflow: hidden;
}

.users-table {
  background: linear-gradient(
    160deg,
    rgba(255, 255, 255, 0.045),
    rgba(255, 255, 255, 0.02)
  ) !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 24px;
  color: white;
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
}

.users-table :deep(.q-table__top) {
  padding: 22px 24px 14px;
}

.users-table :deep(thead tr th) {
  background: rgba(255, 255, 255, 0.03);
  color: #9fd5ff;
  font-weight: 800;
  font-size: 0.88rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.users-table :deep(tbody tr:hover) {
  background: rgba(255, 255, 255, 0.03);
}

.users-table :deep(td) {
  color: white;
  border-color: rgba(255, 255, 255, 0.08);
}

.users-table :deep(.q-table__bottom) {
  color: rgba(255, 255, 255, 0.72);
  border-top: 1px solid rgba(255, 255, 255, 0.08);
}

.users-table :deep(.q-table__control),
.users-table :deep(.q-field__native),
.users-table :deep(.q-field__input),
.users-table :deep(.q-select__dropdown-icon) {
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

.user-main {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 42px;
  height: 42px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 0.95rem;
  font-weight: 900;
  color: #06121f;
  background: linear-gradient(135deg, #60a5fa, #2dd4bf);
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.18);
}

.user-name {
  color: white;
  font-weight: 800;
  margin-bottom: 2px;
}

.user-email {
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

// ─── Inputs ───────────────────────────────────────────────────────────────────
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

// ─── Chips ────────────────────────────────────────────────────────────────────
.chip-role {
  background: rgba(124, 58, 237, 0.16);
  color: #d8b4fe;
  border: 1px solid rgba(124, 58, 237, 0.26);
}

.chip-active {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.26);
}

.chip-inactive {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.24);
}

// ─── Dialog ───────────────────────────────────────────────────────────────────
.dialog-card {
  width: min(92vw, 520px);
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

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
}

.btn-cancel {
  color: rgba(255, 255, 255, 0.72);
}

// ─── Detail modal ─────────────────────────────────────────────────────────────
.detail-hero {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 16px;
  border-radius: 18px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  margin-bottom: 20px;
}

.detail-avatar {
  width: 64px;
  height: 64px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  font-size: 1.4rem;
  font-weight: 900;
  color: #06121f;
  background: linear-gradient(135deg, #60a5fa, #2dd4bf);
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.2);
  position: relative;
  flex-shrink: 0;
}

.detail-status-dot {
  position: absolute;
  right: -2px;
  top: -2px;
  width: 16px;
  height: 16px;
  border-radius: 999px;
  border: 2px solid #111827;
}

.is-active {
  background: #22c55e;
}

.is-inactive {
  background: #ef4444;
}

.detail-name {
  color: white;
  font-size: 1.2rem;
  font-weight: 800;
  margin-bottom: 2px;
}

.detail-email {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  margin-bottom: 6px;
}

.detail-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}

.detail-field {
  padding: 12px 14px;
  border-radius: 14px;
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.detail-field__label {
  display: flex;
  align-items: center;
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.75rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.detail-field__value {
  color: white;
  font-size: 0.95rem;
  font-weight: 700;
  word-break: break-all;
}

.detail-field__value--mono {
  font-family: monospace;
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.72);
}

// ─── Tooltip ──────────────────────────────────────────────────────────────────
.glass-tooltip {
  background: #121a2a !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

// ─── Responsive ───────────────────────────────────────────────────────────────
@media (max-width: 900px) {
  .users-toolbar__grid {
    grid-template-columns: 1fr 1fr;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 700px) {
  .users-page__wrap {
    padding: 18px 14px 28px;
  }

  .users-toolbar__grid {
    grid-template-columns: 1fr;
  }

  .detail-grid {
    grid-template-columns: 1fr;
  }

  .dialog-actions {
    flex-direction: column;
  }

  .btn-cancel {
    width: 100%;
  }
}
</style>
