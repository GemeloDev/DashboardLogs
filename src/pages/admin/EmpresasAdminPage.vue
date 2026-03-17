<template>
  <div class="empresas-page">
    <div class="empresas-wrapper">
      <!-- HERO -->
      <section class="hero-block">
        <div class="hero-left">
          <h1 class="hero-title">
            <!-- Más titulo -->
            <span class="color-orange-santoro">Empresas</span>
          </h1>

          <p class="hero-subtitle">
            Administra empresas, estado y datos operativos
            desde un panel visual consistente con el dashboard.
          </p>
        </div>

        <div class="hero-right">
          <q-btn
            unelevated
            no-caps
            class="hero-action-btn"
            icon="add_business"
            label="Nueva empresa"
            @click="openCreateDialog"
          />
        </div>
      </section>

      <!-- MÉTRICAS -->
      <section class="stats-grid">
        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--cyan">
            <q-icon name="apartment" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">Total empresas</div>
            <div class="stat-value">{{ empresasFiltradas.length }}</div>
          </div>
        </q-card>

        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--green">
            <q-icon name="check_circle" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">Activas</div>
            <div class="stat-value">{{ totalActivas }}</div>
          </div>
        </q-card>

        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--purple">
            <q-icon name="folder_copy" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">Con proyectos</div>
            <div class="stat-value">{{ totalConProyectos }}</div>
          </div>
        </q-card>

        <q-card flat bordered class="stat-card">
          <div class="stat-icon stat-icon--pink">
            <q-icon name="toggle_off" size="24px" />
          </div>
          <div class="stat-body">
            <div class="stat-label">Inactivas</div>
            <div class="stat-value">{{ totalInactivas }}</div>
          </div>
        </q-card>
      </section>

      <!-- GRID -->
      <section class="empresas-grid">
        <q-card
          v-for="empresa in empresasFiltradas"
          :key="empresa.id"
          flat
          bordered
          class="empresa-card"
        >
          <div class="empresa-top">
            <div class="empresa-avatar">
              {{ getIniciales(empresa.nombre) }}
              <div
                class="empresa-status-dot"
                :class="empresa.activa ? 'is-active' : 'is-inactive'"
              ></div>
            </div>

            <div class="empresa-header-text">
              <div class="empresa-title">{{ empresa.nombre }}</div>
              <div class="empresa-subtitle">
                {{ empresa.razonSocial || 'Sin razón social definida' }}
              </div>
            </div>

            <q-btn
              flat
              round
              dense
              icon="more_vert"
              class="empresa-menu-btn"
            >
              <q-menu class="glass-menu">
                <q-list dense style="min-width: 180px">
                  <q-item clickable v-close-popup @click="openEditDialog(empresa)">
                    <q-item-section avatar>
                      <q-icon name="edit" color="cyan" />
                    </q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="toggleActivo(empresa)">
                    <q-item-section avatar>
                      <q-icon :name="empresa.activa ? 'toggle_off' : 'toggle_on'" color="purple" />
                    </q-item-section>
                    <q-item-section>
                      {{ empresa.activa ? 'Desactivar' : 'Activar' }}
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup @click="confirmDelete(empresa)">
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </div>

          <div class="empresa-contact">
            <div class="contact-row" v-if="empresa.email">
              <q-icon name="mail" size="16px" />
              <span>{{ empresa.email }}</span>
            </div>

            <div class="contact-row" v-if="empresa.telefono">
              <q-icon name="call" size="16px" />
              <span>{{ empresa.telefono }}</span>
            </div>

            <div class="contact-row" v-if="empresa.rfc">
              <q-icon name="badge" size="16px" />
              <span>{{ empresa.rfc }}</span>
            </div>
          </div>

          <div class="empresa-footer">
            <q-btn
              flat
              no-caps
              icon="visibility"
              label="Ver detalle"
              class="ghost-btn"
            />

            <q-btn
              unelevated
              no-caps
              icon="edit"
              label="Editar"
              class="mini-action-btn"
              @click="openEditDialog(empresa)"
            />
          </div>
        </q-card>

        <div v-if="!empresasFiltradas.length" class="empty-state">
          <q-icon name="domain_disabled" size="52px" color="grey-6" />
          <div class="empty-title">No se encontraron empresas</div>
          <div class="empty-subtitle">
            Ajusta los filtros o crea una nueva empresa.
          </div>
        </div>
      </section>
    </div>

    <!-- MODAL CREATE / EDIT -->
    <q-dialog v-model="dialogEmpresa" persistent>
      <q-card flat bordered class="empresa-dialog-card">
        <div class="dialog-header">
          <div class="dialog-icon-box">
            <q-icon :name="modoEdicion ? 'edit' : 'add_business'" size="24px" color="white" />
          </div>

          <div>
            <div class="dialog-title">
              {{ modoEdicion ? 'Editar empresa' : 'Nueva empresa' }}
            </div>
            <div class="dialog-subtitle">
              Completa la información principal de la empresa.
            </div>
          </div>
        </div>

        <q-card-section class="dialog-form">
          <div class="dialog-grid">
            <div class="field-span-2">
              <label class="input-label">Nombre comercial</label>
              <q-input
                v-model="empresaForm.nombre"
                outlined
                dense
                class="premium-input"
                placeholder="Ej. Grupo Santoro"
              />
            </div>

            <div class="field-span-2">
              <label class="input-label">Razón social</label>
              <q-input
                v-model="empresaForm.razonSocial"
                outlined
                dense
                class="premium-input"
                placeholder="Ej. Grupo Santoro S.A. de C.V."
              />
            </div>

            <div>
              <label class="input-label">RFC</label>
              <q-input
                v-model="empresaForm.rfc"
                outlined
                dense
                class="premium-input"
                placeholder="RFC"
              />
            </div>

            <div>
              <label class="input-label">Teléfono</label>
              <q-input
                v-model="empresaForm.telefono"
                outlined
                dense
                class="premium-input"
                placeholder="Teléfono"
              />
            </div>

            <div class="field-span-2">
              <label class="input-label">Correo</label>
              <q-input
                v-model="empresaForm.email"
                outlined
                dense
                class="premium-input"
                placeholder="correo@empresa.com"
              />
            </div>

            <div class="field-span-2">
              <label class="input-label">Dirección</label>
              <q-input
                v-model="empresaForm.direccion"
                outlined
                dense
                class="premium-input"
                placeholder="Dirección fiscal o comercial"
              />
            </div>

            <div class="field-span-2">
              <label class="input-label">Descripción</label>
              <q-input
                v-model="empresaForm.descripcion"
                outlined
                dense
                type="textarea"
                autogrow
                class="premium-input"
                placeholder="Notas o descripción de la empresa"
              />
            </div>

            <div class="field-span-2">
              <q-toggle
                v-model="empresaForm.activa"
                color="cyan"
                label="Empresa activa"
                class="toggle-dark"
              />
            </div>
          </div>
        </q-card-section>

        <div class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="cancel-btn" v-close-popup />
          <q-btn
            unelevated
            no-caps
            :label="modoEdicion ? 'Guardar cambios' : 'Crear empresa'"
            class="save-btn"
            @click="saveEmpresa"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- DIALOG DELETE -->
    <q-dialog v-model="dialogDelete">
      <q-card flat bordered class="delete-dialog-card">
        <div class="delete-icon-wrap">
          <q-icon name="delete_forever" size="40px" color="negative" />
        </div>

        <div class="delete-title">Eliminar empresa</div>
        <div class="delete-text">
          ¿Deseas eliminar a
          <strong>{{ empresaAEliminar?.nombre }}</strong>?
          Esta acción no se puede deshacer.
        </div>

        <div class="dialog-actions">
          <q-btn flat no-caps label="Cancelar" class="cancel-btn" v-close-popup />
          <q-btn
            unelevated
            no-caps
            label="Eliminar"
            color="negative"
            class="delete-btn"
            @click="deleteEmpresa"
          />
        </div>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue'
import { useQuasar } from 'quasar'

const $q = useQuasar()

const search = ref('')
const filtroEstado = ref('todos')
const sortBy = ref('reciente')

const dialogEmpresa = ref(false)
const dialogDelete = ref(false)
const modoEdicion = ref(false)
const empresaAEliminar = ref(null)

const empresas = ref([
  {
    id: 1,
    nombre: 'Grupo Santoro',
    razonSocial: 'Grupo Santoro S.A. de C.V.',
    rfc: 'GSA250101ABC',
    telefono: '722 123 4567',
    email: 'contacto@gruposantoro.com',
    direccion: 'Metepec, Estado de México',
    descripcion: 'Empresa principal del grupo.',
    activa: true,
    proyectos: 12,
    createdAt: '2026-02-04',
  },
  {
    id: 2,
    nombre: 'Santoro Tech',
    razonSocial: 'Santoro Tech Solutions S.A. de C.V.',
    rfc: 'STS250101XYZ',
    telefono: '55 3456 7890',
    email: 'admin@santorotech.com',
    direccion: 'Ciudad de México',
    descripcion: 'Unidad enfocada a desarrollo tecnológico.',
    activa: true,
    proyectos: 7,
    createdAt: '2026-01-16',
  },
  {
    id: 3,
    nombre: 'Logística Santoro',
    razonSocial: 'Logística Santoro Integral S.A. de C.V.',
    rfc: 'LSI250101QWE',
    telefono: '81 9876 5432',
    email: 'operaciones@logisticasantoro.com',
    direccion: 'Monterrey, Nuevo León',
    descripcion: 'Operación y logística.',
    activa: false,
    proyectos: 3,
    createdAt: '2026-02-10',
  },
])

const emptyForm = () => ({
  id: null,
  nombre: '',
  razonSocial: '',
  rfc: '',
  telefono: '',
  email: '',
  direccion: '',
  descripcion: '',
  activa: true,
  proyectos: 0,
  createdAt: null,
})

const empresaForm = ref(emptyForm())

const totalActivas = computed(() => empresas.value.filter((e) => e.activa).length)
const totalInactivas = computed(() => empresas.value.filter((e) => !e.activa).length)
const totalConProyectos = computed(() => empresas.value.filter((e) => (e.proyectos || 0) > 0).length)

const empresasFiltradas = computed(() => {
  let rows = [...empresas.value]

  if (search.value.trim()) {
    const q = search.value.toLowerCase()
    rows = rows.filter((e) =>
      [e.nombre, e.razonSocial, e.rfc, e.email].some((v) =>
        String(v || '').toLowerCase().includes(q),
      ),
    )
  }

  if (filtroEstado.value === 'activa') {
    rows = rows.filter((e) => e.activa)
  } else if (filtroEstado.value === 'inactiva') {
    rows = rows.filter((e) => !e.activa)
  }

  if (sortBy.value === 'az') {
    rows.sort((a, b) => a.nombre.localeCompare(b.nombre))
  } else if (sortBy.value === 'za') {
    rows.sort((a, b) => b.nombre.localeCompare(a.nombre))
  } else if (sortBy.value === 'proyectos') {
    rows.sort((a, b) => (b.proyectos || 0) - (a.proyectos || 0))
  } else {
    rows.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
  }

  return rows
})

const getIniciales = (nombre) => {
  return String(nombre || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const openCreateDialog = () => {
  modoEdicion.value = false
  empresaForm.value = emptyForm()
  dialogEmpresa.value = true
}

const openEditDialog = (empresa) => {
  modoEdicion.value = true
  empresaForm.value = { ...empresa }
  dialogEmpresa.value = true
}

const saveEmpresa = () => {
  if (!empresaForm.value.nombre?.trim()) {
    $q.notify({
      type: 'negative',
      message: 'El nombre de la empresa es requerido.',
      position: 'top',
    })
    return
  }

  if (modoEdicion.value) {
    const idx = empresas.value.findIndex((e) => e.id === empresaForm.value.id)
    if (idx !== -1) empresas.value[idx] = { ...empresaForm.value }
    $q.notify({
      type: 'positive',
      message: 'Empresa actualizada correctamente.',
      position: 'top',
    })
  } else {
    empresas.value.unshift({
      ...empresaForm.value,
      id: Date.now(),
      createdAt: new Date().toISOString().slice(0, 10),
    })
    $q.notify({
      type: 'positive',
      message: 'Empresa creada correctamente.',
      position: 'top',
    })
  }

  dialogEmpresa.value = false
}

const toggleActivo = (empresa) => {
  empresa.activa = !empresa.activa
  $q.notify({
    type: 'positive',
    message: `Empresa ${empresa.activa ? 'activada' : 'desactivada'} correctamente.`,
    position: 'top',
  })
}

const confirmDelete = (empresa) => {
  empresaAEliminar.value = empresa
  dialogDelete.value = true
}

const deleteEmpresa = () => {
  if (!empresaAEliminar.value) return
  empresas.value = empresas.value.filter((e) => e.id !== empresaAEliminar.value.id)
  dialogDelete.value = false
  $q.notify({
    type: 'positive',
    message: 'Empresa eliminada correctamente.',
    position: 'top',
  })
  empresaAEliminar.value = null
}
</script>

<style lang="scss" scoped>
$bg-1: #070b14;
$bg-2: #0b1220;
$bg-3: #111827;

$text-main: #ffffff;
$text-soft: rgba(255, 255, 255, 0.72);
$text-muted: rgba(255, 255, 255, 0.5);

$cyan: #22d3ee;
$cyan-strong: #06b6d4;
$purple: #7c3aed;
$pink: #ec4899;
$green: #22c55e;
$red: #ef4444;

$gradient-warm: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);

.empresas-page {
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at top left, rgba(34, 211, 238, 0.08), transparent 24%),
    radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.08), transparent 24%),
    linear-gradient(135deg, $bg-1 0%, $bg-2 45%, $bg-3 100%);
  padding: 28px 22px 34px;
}

.page-bg {
  position: absolute;
  inset: 0;
  overflow: hidden;
  pointer-events: none;
}

.bg-grid {
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(rgba(255, 255, 255, 0.02) 1px, transparent 1px),
    linear-gradient(90deg, rgba(255, 255, 255, 0.02) 1px, transparent 1px);
  background-size: 38px 38px;
  mask-image: linear-gradient(to bottom, rgba(0, 0, 0, 0.65), transparent 95%);
}

.bg-blur {
  position: absolute;
  border-radius: 999px;
  filter: blur(90px);
  opacity: 0.2;
}

.bg-blur--cyan {
  width: 320px;
  height: 320px;
  background: $cyan;
  top: -60px;
  left: -60px;
}

.bg-blur--purple {
  width: 360px;
  height: 360px;
  background: $purple;
  right: -100px;
  bottom: -90px;
}

.bg-orb {
  position: absolute;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
  animation: floatY 9s ease-in-out infinite;
}

.orb-1 {
  width: 78px;
  height: 78px;
  top: 14%;
  left: 10%;
}

.orb-2 {
  width: 58px;
  height: 58px;
  top: 24%;
  right: 12%;
  animation-delay: -2s;
}

.orb-3 {
  width: 92px;
  height: 92px;
  bottom: 12%;
  left: 18%;
  animation-delay: -5s;
}

.empresas-wrapper {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 1440px;
  margin: 0 auto;
}

.hero-block {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 24px;
}

.hero-left {
  max-width: 760px;
}

.hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border-radius: 999px;
  margin-bottom: 14px;
  color: $text-main;
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);

  span {
    font-size: 0.9rem;
    font-weight: 600;
  }
}

.hero-title {
  margin: 24px 0 12px;
  color: $text-main;
  font-size: clamp(2rem, 4vw, 3.2rem);
  line-height: 1.05;
  font-weight: 900;
  letter-spacing: -0.04em;
}

.hero-title--accent {
  background: $gradient-warm;
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.hero-subtitle {
  margin: 0;
  color: $text-soft;
  font-size: 1rem;
  line-height: 1.7;
  max-width: 720px;
}

.hero-right {
  display: flex;
  justify-content: flex-end;
  align-items: flex-start;
}

.hero-action-btn {
  height: 52px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  font-size: 0.98rem;
  color: white;
  text-transform: none;
  background: $gradient-warm;
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.15);
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 18px;
  margin-bottom: 22px;
}

.stat-card {
  display: flex;
  align-items: center;
  gap: 16px;
  min-height: 114px;
  padding: 18px 22px;
  border-radius: 22px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
}

.stat-icon {
  width: 56px;
  height: 56px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  flex-shrink: 0;
}

.stat-icon--cyan {
  background: linear-gradient(135deg, rgba(34, 211, 238, 0.95), rgba(6, 182, 212, 0.8));
}

.stat-icon--green {
  background: linear-gradient(135deg, rgba(34, 197, 94, 0.95), rgba(16, 185, 129, 0.8));
}

.stat-icon--purple {
  background: linear-gradient(135deg, rgba(124, 58, 237, 0.95), rgba(168, 85, 247, 0.8));
}

.stat-icon--pink {
  background: linear-gradient(135deg, rgba(236, 72, 153, 0.95), rgba(219, 39, 119, 0.82));
}

.stat-body {
  min-width: 0;
}

.stat-label {
  color: rgba(255, 255, 255, 0.55);
  font-size: 0.86rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 6px;
}

.stat-value {
  color: $text-main;
  font-size: 2.1rem;
  font-weight: 900;
  line-height: 1;
}

.filters-card {
  margin-bottom: 26px;
  padding: 18px;
  border-radius: 24px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 16px 38px rgba(0, 0, 0, 0.28);
}

.filters-grid {
  display: grid;
  grid-template-columns: 1.5fr 0.8fr 0.65fr;
  gap: 16px;
}

.premium-input {
  :deep(.q-field__control) {
    min-height: 58px;
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
    background: rgba(255, 255, 255, 0.055);
  }

  :deep(.q-field__marginal) {
    color: rgba(255, 255, 255, 0.58);
  }

  :deep(.q-menu) {
    background: #141b2c;
  }
}

.input-icon {
  color: rgba(255, 255, 255, 0.58);
}

.empresas-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 22px;
}

.empresa-card {
  border-radius: 24px;
  overflow: hidden;
  padding: 24px 24px 18px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 42px rgba(0, 0, 0, 0.32);
  transition:
    transform 0.15s ease,
    box-shadow 0.15s ease,
    border-color 0.15s ease;
}

.empresa-card:hover {
  transform: translateY(-2px);
  border-color: rgba(34, 211, 238, 0.18);
  box-shadow: 0 22px 48px rgba(0, 0, 0, 0.36);
}

.empresa-top {
  display: flex;
  align-items: flex-start;
  gap: 14px;
  margin-bottom: 18px;
}

.empresa-avatar {
  width: 68px;
  height: 68px;
  border-radius: 999px;
  flex-shrink: 0;
  display: grid;
  place-items: center;
  font-size: 1.55rem;
  font-weight: 900;
  color: #06121f;
  background: linear-gradient(135deg, #60a5fa, #2dd4bf);
  box-shadow: 0 0 24px rgba(96, 165, 250, 0.18);
  position: relative;
}

.empresa-status-dot {
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

.empresa-header-text {
  min-width: 0;
  flex: 1;
  padding-top: 4px;
}

.empresa-title {
  color: $text-main;
  font-size: 1.35rem;
  font-weight: 800;
  line-height: 1.2;
  word-break: break-word;
  margin-bottom: 8px;
}

.empresa-subtitle {
  color: $text-soft;
  font-size: 0.95rem;
  line-height: 1.45;
  word-break: break-word;
}

.empresa-menu-btn {
  color: rgba(255, 255, 255, 0.62);
}

.empresa-contact {
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding-bottom: 18px;
}

.contact-row {
  display: flex;
  align-items: center;
  gap: 9px;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.93rem;
  word-break: break-word;
}

.empresa-meta {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.meta-block {
  display: flex;
  align-items: center;
  gap: 12px;
}

.meta-icon {
  width: 38px;
  height: 38px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  color: #7c83ff;
  background: rgba(124, 131, 255, 0.14);
  flex-shrink: 0;
}

.meta-label {
  color: rgba(255, 255, 255, 0.52);
  font-size: 0.8rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.04em;
  margin-bottom: 3px;
}

.meta-value {
  color: $text-main;
  font-size: 0.98rem;
  font-weight: 700;
}

.estado-chip {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 26px;
  padding: 4px 10px;
  border-radius: 999px;
  font-size: 0.78rem;
  font-weight: 800;
  letter-spacing: 0.02em;
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

.empresa-footer {
  padding-top: 16px;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.ghost-btn {
  color: rgba(255, 255, 255, 0.76);
}

.mini-action-btn {
  border-radius: 12px;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, $cyan-strong 0%, $purple 58%, $pink 100%);
}

.empty-state {
  grid-column: 1 / -1;
  min-height: 260px;
  border-radius: 24px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 10px;
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.035), rgba(255, 255, 255, 0.018));
  border: 1px dashed rgba(255, 255, 255, 0.12);
}

.empty-title {
  color: $text-main;
  font-size: 1.2rem;
  font-weight: 800;
}

.empty-subtitle {
  color: $text-soft;
  font-size: 0.95rem;
}

.empresa-dialog-card,
.delete-dialog-card {
  width: min(92vw, 760px);
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(15, 20, 32, 0.96), rgba(18, 25, 42, 0.94));
  border: 1px solid rgba(255, 255, 255, 0.08);
  color: white;
  box-shadow: 0 28px 64px rgba(0, 0, 0, 0.48);
}

.delete-dialog-card {
  width: min(92vw, 480px);
  padding: 28px 24px 22px;
  text-align: center;
}

.dialog-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 24px 24px 10px;
}

.dialog-icon-box {
  width: 58px;
  height: 58px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  background: linear-gradient(135deg, $cyan-strong, $purple);
  box-shadow: 0 14px 30px rgba(34, 211, 238, 0.18);
  flex-shrink: 0;
}

.dialog-title {
  color: $text-main;
  font-size: 1.4rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.dialog-subtitle {
  color: $text-soft;
  font-size: 0.94rem;
}

.dialog-form {
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

.toggle-dark {
  color: white;
}

.dialog-actions {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 0 24px 24px;
}

.cancel-btn {
  color: rgba(255, 255, 255, 0.72);
}

.save-btn {
  border-radius: 14px;
  min-height: 46px;
  padding: 0 18px;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, $cyan-strong 0%, $purple 58%, $pink 100%);
}

.delete-icon-wrap {
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
  color: $text-main;
  font-size: 1.45rem;
  font-weight: 800;
  margin-bottom: 10px;
}

.delete-text {
  color: $text-soft;
  font-size: 0.98rem;
  line-height: 1.65;
  margin-bottom: 22px;
}

.delete-btn {
  border-radius: 14px;
  min-height: 46px;
  padding: 0 18px;
  text-transform: none;
}

.glass-menu {
  background: #121a2a;
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 18px 38px rgba(0, 0, 0, 0.34);
}

@keyframes floatY {
  0%, 100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-12px);
  }
}

@media (max-width: 1200px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .empresas-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 900px) {
  .hero-block {
    flex-direction: column;
    align-items: stretch;
  }

  .hero-right {
    justify-content: flex-start;
  }

  .filters-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 700px) {
  .empresas-page {
    padding: 18px 14px 28px;
  }

  .stats-grid,
  .empresas-grid,
  .dialog-grid {
    grid-template-columns: 1fr;
  }

  .field-span-2 {
    grid-column: span 1;
  }

  .empresa-dialog-card {
    width: min(94vw, 760px);
  }

  .login-left,
  .login-right {
    padding: 28px 20px;
  }

  .empresa-footer,
  .dialog-actions {
    flex-direction: column;
  }

  .hero-action-btn,
  .save-btn,
  .delete-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>
