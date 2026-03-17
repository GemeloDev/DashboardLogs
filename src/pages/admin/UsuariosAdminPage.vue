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

        <div class="users-header__actions">
          <q-btn
            unelevated
            no-caps
            icon="person_add"
            label="Nuevo usuario"
            class="btn-primary"
            @click="openCreateDialog"
          />
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
            v-model="filtroEstado"
            outlined
            dense
            emit-value
            map-options
            class="premium-input"
            :options="[
              { label: 'Todos los estados', value: 'todos' },
              { label: 'Activos', value: 'activo' },
              { label: 'Inactivos', value: 'inactivo' }
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
                {{ props.row.empresa || 'Sin empresa' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-activo="props">
            <q-td :props="props">
              <q-chip
                dense
                :class="props.row.activo ? 'chip-active' : 'chip-inactive'"
              >
                {{ props.row.activo ? 'Activo' : 'Inactivo' }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-fechaCreacion="props">
            <q-td :props="props">
              {{ formatDate(props.row.fechaCreacion) }}
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
            <q-icon :name="isEdit ? 'edit' : 'person_add'" size="24px" color="white" />
          </div>

          <div>
            <div class="dialog-title">
              {{ isEdit ? 'Editar usuario' : 'Nuevo usuario' }}
            </div>
            <div class="dialog-subtitle">
              Captura la información principal del usuario.
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
                placeholder="Nombre completo"
              />
            </div>

            <div class="field-span-2">
              <label class="input-label">Correo electrónico</label>
              <q-input
                v-model="form.email"
                outlined
                dense
                type="email"
                class="premium-input"
                placeholder="correo@empresa.com"
              />
            </div>

            <div class="field-span-2">
              <label class="input-label">
                {{ isEdit ? 'Nueva contraseña (opcional)' : 'Contraseña' }}
              </label>
              <q-input
                v-model="form.password"
                outlined
                dense
                :type="mostrarPassword ? 'text' : 'password'"
                class="premium-input"
                :placeholder="isEdit ? 'Deja vacío para no cambiarla' : 'Mínimo 8 caracteres'"
              >
                <template v-slot:prepend>
                  <q-icon name="lock" class="input-icon" />
                </template>

                <template v-slot:append>
                  <q-btn
                    :icon="mostrarPassword ? 'visibility_off' : 'visibility'"
                    flat
                    dense
                    round
                    size="sm"
                    class="visibility-btn"
                    @click="mostrarPassword = !mostrarPassword"
                  />
                </template>
              </q-input>
            </div>

            <div class="field-span-2">
              <q-toggle
                v-model="form.activo"
                color="cyan"
                label="Usuario activo"
                class="toggle-dark"
              />
            </div>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="btn-cancel" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="isEdit ? 'Guardar cambios' : 'Crear usuario'"
            class="btn-primary"
            @click="saveUser"
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

        <div class="delete-title">Eliminar usuario</div>
        <div class="delete-text">
          ¿Deseas eliminar a <strong>{{ selectedUser?.name }}</strong>?
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
            @click="deleteUser"
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
const selectedUser = ref(null)
const mostrarPassword = ref(false)

const rows = ref([
  {
    id: 1,
    name: 'Alan Ortega',
    email: 'alan@admin.com',
    empresa: 'Grupo Santoro',
    activo: true,
    fechaCreacion: '2026-02-04',
  },
  {
    id: 2,
    name: 'Ana López',
    email: 'ana@empresa.com',
    empresa: 'Santoro Tech',
    activo: true,
    fechaCreacion: '2026-02-10',
  },
  {
    id: 3,
    name: 'Carlos Méndez',
    email: 'carlos@auditoria.com',
    empresa: 'Logística Santoro',
    activo: false,
    fechaCreacion: '2026-01-28',
  },
  {
    id: 4,
    name: 'María Ruiz',
    email: 'maria@cliente.com',
    empresa: 'Grupo Santoro',
    activo: true,
    fechaCreacion: '2026-03-01',
  },
])

const form = ref(emptyForm())

function emptyForm() {
  return {
    id: null,
    name: '',
    email: '',
    password: '',
    activo: true,
    empresa: '',
    fechaCreacion: null,
  }
}

const columns = [
  {
    name: 'name',
    label: 'USUARIO',
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
    name: 'activo',
    label: 'ESTADO',
    field: 'activo',
    align: 'left',
    sortable: true,
  },
  {
    name: 'fechaCreacion',
    label: 'FECHA CREACIÓN',
    field: 'fechaCreacion',
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
      [item.name, item.email, item.empresa].some((v) =>
        String(v || '').toLowerCase().includes(q),
      ),
    )
  }

  if (filtroEstado.value === 'activo') {
    result = result.filter((item) => item.activo)
  } else if (filtroEstado.value === 'inactivo') {
    result = result.filter((item) => !item.activo)
  }

  return result
})

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

const openCreateDialog = () => {
  isEdit.value = false
  mostrarPassword.value = false
  form.value = emptyForm()
  dialogOpen.value = true
}

const openEditDialog = (row) => {
  isEdit.value = true
  mostrarPassword.value = false
  form.value = {
    id: row.id,
    name: row.name,
    email: row.email,
    password: '',
    activo: row.activo,
    empresa: row.empresa,
    fechaCreacion: row.fechaCreacion,
  }
  dialogOpen.value = true
}

const saveUser = () => {
  if (!form.value.name?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'El nombre es requerido.',
      position: 'top',
    })
    return
  }

  if (!form.value.email?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'El email es requerido.',
      position: 'top',
    })
    return
  }

  if (!isEdit.value && !form.value.password?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'La contraseña es requerida.',
      position: 'top',
    })
    return
  }

  if (!isEdit.value && form.value.password.length < 8) {
    $q.notify({
      type: 'negative',
      message: 'La contraseña debe tener al menos 8 caracteres.',
      position: 'top',
    })
    return
  }

  if (isEdit.value && form.value.password && form.value.password.length < 8) {
    $q.notify({
      type: 'negative',
      message: 'La nueva contraseña debe tener al menos 8 caracteres.',
      position: 'top',
    })
    return
  }

  if (isEdit.value) {
    const idx = rows.value.findIndex((r) => r.id === form.value.id)
    if (idx !== -1) {
      rows.value[idx] = {
        ...rows.value[idx],
        name: form.value.name,
        email: form.value.email,
        activo: form.value.activo,
        // password solo la enviarías al backend, no la guardes en la tabla local
      }
    }

    $q.notify({
      type: 'positive',
      message: 'Usuario actualizado correctamente.',
      position: 'top',
    })
  } else {
    rows.value.unshift({
      id: Date.now(),
      name: form.value.name,
      email: form.value.email,
      activo: form.value.activo,
      empresa: 'Sin empresa',
      fechaCreacion: new Date().toISOString().slice(0, 10),
    })

    $q.notify({
      type: 'positive',
      message: 'Usuario creado correctamente.',
      position: 'top',
    })
  }

  dialogOpen.value = false
}

const confirmDelete = (row) => {
  selectedUser.value = row
  deleteDialog.value = true
}

const deleteUser = () => {
  if (!selectedUser.value) return

  rows.value = rows.value.filter((r) => r.id !== selectedUser.value.id)

  deleteDialog.value = false
  selectedUser.value = null

  $q.notify({
    type: 'positive',
    message: 'Usuario eliminado correctamente.',
    position: 'top',
  })
}
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

.users-header__actions {
  display: flex;
  align-items: center;
}

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
  grid-template-columns: 1.4fr 0.5fr;
  gap: 16px;
}

.users-table-wrap {
  border-radius: 24px;
  overflow: hidden;
}

.users-table {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02)) !important;
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

.action-btn--delete {
  color: #f87171;
}

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

.input-icon,
.visibility-btn {
  color: rgba(255, 255, 255, 0.58);
}

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

.toggle-dark {
  color: white;
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

.glass-tooltip {
  background: #121a2a !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

@media (max-width: 900px) {
  .users-toolbar__grid {
    grid-template-columns: 1fr;
  }

  .users-header {
    flex-direction: column;
    align-items: stretch;
  }

  .users-header__actions {
    justify-content: flex-start;
  }
}

@media (max-width: 700px) {
  .users-page__wrap {
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
