<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card flat bordered class="invitation-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <div class="dialog-icon" :class="saveMode !== 'save' ? 'dialog-icon--edit' : ''">
            <q-icon :name="saveMode === 'save' ? 'email' : 'edit'" size="24px" color="white" />
          </div>

          <div>
            <h2>{{ saveMode === 'save' ? 'Envíar Invitación' : 'Editar Usuario' }}</h2>
            <p>
              {{
                saveMode === 'save'
                  ? 'Invita a un nuevo usuario al sistema.'
                  : 'Edita los datos del usuario.'
              }}
            </p>
          </div>
        </div>

        <q-btn icon="close" flat round dense class="dialog-close-btn" @click="closeModal" />
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Body -->
      <q-card-section class="modal-body">
        <q-form v-if="saveMode === 'save'" @submit="enviarInvitacion" class="invitation-form">
          <!-- Email -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="alternate_email" size="18px" />
              Correo Electrónico *
            </label>
            <q-input
              v-model="formData.email"
              type="email"
              outlined
              class="premium-input"
              placeholder="usuario@ejemplo.com"
              :rules="[
                (val) => !!val || 'El email es requerido',
                (val) => isValidEmail(val) || 'Email inválido',
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mail" class="input-icon" />
              </template>
            </q-input>
          </div>

          <!-- Roles -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="badge" size="18px" />
              Roles *
            </label>
            <q-select
              v-model="formData.roles"
              :options="roleOptions"
              outlined
              class="premium-input"
              placeholder="Selecciona uno o más roles"
              use-chips
              stack-label
              :rules="[(val) => (val && val.length > 0) || 'Selecciona al menos un rol']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="group_work" class="input-icon" />
              </template>
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  dense
                  class="select-chip select-chip--purple"
                >
                  {{ scope.opt }}
                </q-chip>
              </template>
            </q-select>
          </div>

          <!-- Sistemas -->
          <div
            v-if="formData.roles === 'SYSTEM_MANAGER' || formData.roles === 'VIEWER'"
            class="form-field"
          >
            <label class="field-label">
              <q-icon name="devices" size="18px" />
              Sistemas *
            </label>
            <q-select
              v-model="formData.systems"
              :options="systemOptions"
              multiple
              outlined
              class="premium-input"
              placeholder="Selecciona uno o más sistemas"
              use-chips
              stack-label
              :rules="[(val) => (val && val.length > 0) || 'Selecciona al menos un sistema']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="dashboard" class="input-icon" />
              </template>
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  dense
                  class="select-chip select-chip--warm"
                >
                  {{ scope.opt }}
                </q-chip>
              </template>
            </q-select>
            <div class="field-hint">Puedes seleccionar múltiples sistemas para el usuario.</div>
          </div>

          <!-- Viewer: filtros -->
          <div v-if="formData.roles === 'VIEWER'" class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="form-field">
                <label class="field-label">
                  <q-icon name="insights" size="18px" />
                  Resultados <span class="accent-warm">(outcome)</span> permitidos
                </label>
                <q-select
                  v-model="formData.logFilters.allowedOutcomes"
                  :options="outcomesValues"
                  multiple
                  outlined
                  class="premium-input"
                  placeholder="Selecciona uno o más valores"
                  use-chips
                  stack-label
                  :rules="[
                    (val) => (val && val.length > 0) || 'Selecciona al menos un valor outcome',
                  ]"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="dashboard" class="input-icon" />
                  </template>
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      dense
                      class="select-chip select-chip--green"
                    >
                      {{ scope.opt }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="form-field">
                <label class="field-label">
                  <q-icon name="toggle_on" size="18px" />
                  Resultados <span class="accent-warm">(status)</span> permitidos
                </label>
                <q-select
                  v-model="formData.logFilters.allowedStatuses"
                  :options="statusValues"
                  multiple
                  outlined
                  class="premium-input"
                  placeholder="Selecciona uno o más valores"
                  use-chips
                  stack-label
                  :rules="[
                    (val) => (val && val.length > 0) || 'Selecciona al menos un valor status',
                  ]"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="dashboard" class="input-icon" />
                  </template>
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      dense
                      class="select-chip select-chip--warm"
                    >
                      {{ scope.opt }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>
          </div>

          <div v-if="formData.roles === 'VIEWER'" class="row q-col-gutter-md">
            <div class="col-12 col-md-6">
              <div class="form-field">
                <label class="field-label">
                  <q-icon name="warning" size="18px" />
                  Resultados <span class="accent-warm">(severity)</span> permitidos
                </label>
                <q-select
                  v-model="formData.logFilters.allowedSeverities"
                  :options="severityValues"
                  multiple
                  outlined
                  class="premium-input"
                  placeholder="Selecciona uno o más valores"
                  use-chips
                  stack-label
                  :rules="[
                    (val) => (val && val.length > 0) || 'Selecciona al menos un valor severity',
                  ]"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="dashboard" class="input-icon" />
                  </template>
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      dense
                      class="select-chip select-chip--blue"
                    >
                      {{ scope.opt }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>

            <div class="col-12 col-md-6">
              <div class="form-field">
                <label class="field-label">
                  <q-icon name="bolt" size="18px" />
                  Resultados <span class="accent-warm">(eventType)</span> permitidos
                </label>
                <q-select
                  v-model="formData.logFilters.allowedEventTypes"
                  :options="eventTypesValues"
                  multiple
                  outlined
                  class="premium-input"
                  placeholder="Selecciona uno o más valores"
                  use-chips
                  stack-label
                  :rules="[
                    (val) => (val && val.length > 0) || 'Selecciona al menos un valor eventType',
                  ]"
                  lazy-rules
                >
                  <template v-slot:prepend>
                    <q-icon name="dashboard" class="input-icon" />
                  </template>
                  <template v-slot:selected-item="scope">
                    <q-chip
                      removable
                      @remove="scope.removeAtIndex(scope.index)"
                      :tabindex="scope.tabindex"
                      dense
                      class="select-chip select-chip--purple"
                    >
                      {{ scope.opt }}
                    </q-chip>
                  </template>
                </q-select>
              </div>
            </div>
          </div>

          <!-- TTL Hours -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="schedule" size="18px" />
              Validez de la Invitación (horas)
            </label>
            <q-input
              v-model.number="formData.ttlHours"
              type="number"
              outlined
              class="premium-input"
              placeholder="48"
              :rules="[
                (val) => val > 0 || 'Debe ser mayor a 0',
                (val) => val <= 168 || 'Máximo 7 días (168 horas)',
              ]"
              lazy-rules
              min="1"
              max="168"
            >
              <template v-slot:prepend>
                <q-icon name="timer" class="input-icon" />
              </template>
              <template v-slot:hint> La invitación expirará después de este tiempo </template>
            </q-input>

            <div class="ttl-presets">
              <q-chip
                v-for="preset in ttlPresets"
                :key="preset.value"
                clickable
                @click="formData.ttlHours = preset.value"
                :class="
                  formData.ttlHours === preset.value
                    ? 'preset-chip preset-chip--active'
                    : 'preset-chip'
                "
                size="sm"
              >
                {{ preset.label }}
              </q-chip>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="isFormValid" class="invitation-preview">
            <div class="preview-header">
              <q-icon name="visibility" size="18px" />
              Vista Previa
            </div>

            <div class="preview-content">
              <div class="preview-row">
                <strong>Para:</strong>
                <span>{{ formData.email }}</span>
              </div>

              <div class="preview-row">
                <strong>Rol:</strong>
                <div class="preview-roles">
                  <q-badge class="preview-badge preview-badge--purple">
                    {{ formData.roles }}
                  </q-badge>
                </div>
              </div>

              <div v-if="formData.roles === 'SYSTEM_MANAGER' || formData.roles === 'VIEWER'" class="preview-row">
                <strong>Sistema(s):</strong>
                <div class="preview-roles">
                  <q-badge
                    v-for="system in formData.systems"
                    :key="system"
                    class="preview-badge preview-badge--warm"
                  >
                    {{ system }}
                  </q-badge>
                </div>
              </div>

              <div v-if="formData.roles === 'VIEWER'" class="preview-row">
                <strong>Valores sobre filtros:</strong>
                <div class="preview-roles">
                  <q-badge
                    v-for="system in formData.logFilters"
                    :key="system"
                    class="preview-badge preview-badge--orange"
                  >
                    {{ system }}
                  </q-badge>
                </div>
              </div>

              <div class="preview-row">
                <strong>Expira:</strong>
                <span>{{ formatExpiration(formData.ttlHours) }}</span>
              </div>
            </div>
          </div>
        </q-form>

        <!-- Formulario editar -->
        <q-form v-if="saveMode !== 'save'" @submit="editarUsuario" class="invitation-form">
          <div class="form-field">
            <label class="field-label">
              <q-icon name="account_circle" size="18px" />
              Usuario *
            </label>
            <q-input
              v-model="formData.name"
              type="text"
              outlined
              class="premium-input"
              placeholder="Nombre de la persona"
              :rules="[(val) => !!val || 'El nombre es requerido']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="edit" class="input-icon" />
              </template>
            </q-input>
          </div>

          <div class="form-field">
            <label class="field-label">
              <q-icon name="alternate_email" size="18px" />
              Correo Electrónico *
            </label>
            <q-input
              v-model="formData.email"
              type="email"
              outlined
              class="premium-input"
              placeholder="usuario@ejemplo.com"
              :rules="[
                (val) => !!val || 'El email es requerido',
                (val) => isValidEmail(val) || 'Email inválido',
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mail" class="input-icon" />
              </template>
            </q-input>

            <q-toggle
              v-model="formData.status"
              color="cyan"
              label="Activo"
              keep-color
              class="toggle-dark"
            />
          </div>

          <div class="invitation-preview">
            <div class="preview-header">
              <q-icon name="visibility" size="18px" />
              Vista Previa
            </div>

            <div class="preview-content">
              <div class="preview-row">
                <strong>Nombre (usuario):</strong>
                <span>{{ formData.name }}</span>
              </div>

              <div class="preview-row">
                <strong>Email:</strong>
                <span>{{ formData.email }}</span>
              </div>

              <div class="preview-row">
                <strong>Estatus:</strong>
                <q-badge
                  :class="
                    formData.status
                      ? 'preview-badge preview-badge--green'
                      : 'preview-badge preview-badge--red'
                  "
                >
                  {{ formData.status ? 'Activo' : 'Inactivo' }}
                </q-badge>
              </div>
            </div>
          </div>
        </q-form>
      </q-card-section>

      <q-separator class="modal-separator" />

      <!-- Actions -->
      <q-card-actions class="modal-actions">
        <q-btn
          label="Cancelar"
          flat
          no-caps
          class="btn-cancel"
          @click="closeModal"
          :disable="sending"
        />
        <q-space />
        <q-btn
          :label="saveMode === 'save' ? 'Enviar Invitación' : 'Guardar Cambios'"
          no-caps
          unelevated
          class="btn-primary"
          :icon-right="saveMode === 'save' ? 'send' : 'save'"
          @click="saveMode === 'save' ? enviarInvitacion() : editarUsuario()"
          :loading="sending"
          :disable="!isFormValid"
        />
      </q-card-actions>

      <!-- Success State -->
      <q-card-section v-if="invitationSent && invitationLink" class="success-section">
        <div class="success-header">
          <div class="success-icon-wrap">
            <q-icon name="check_circle" size="42px" color="positive" />
          </div>
          <h3>¡Invitación Enviada!</h3>
          <p>Se ha enviado un correo a {{ formData.email }}</p>
        </div>

        <div class="invitation-link-container">
          <label class="field-label">Link de Invitación:</label>

          <div class="link-display">
            <q-input :model-value="invitationLink" outlined readonly dense class="premium-input" />
            <q-btn icon="content_copy" flat class="copy-btn" @click="copyLink">
              <q-tooltip class="glass-tooltip">Copiar link</q-tooltip>
            </q-btn>
          </div>

          <div class="field-hint">Este link también fue enviado al correo del usuario</div>
        </div>

        <q-btn
          label="Enviar Otra Invitación"
          no-caps
          unelevated
          icon="add"
          class="btn-secondary q-mt-md"
          @click="resetForm"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { sendInvitation } from '../services/invitationsService.js'
import { editUser } from 'src/services/usersService.js'

const props = defineProps({
  modelValue: { type: Boolean, required: true },
  availableRoles: { type: Array, default: () => [] },
  saveMode: { type: String, default: 'save', required: true },
  dataUser: { type: Object, required: false },
})

const emit = defineEmits(['update:modelValue', 'invitation-sent'])
const $q = useQuasar()

const sending = ref(false)
const invitationSent = ref(false)
const invitationLink = ref('')

const systemOptions = ref(
  JSON.parse(localStorage.getItem('dashboardLogsSession'))?.user?.authz?.systems || [],
)

const outcomesValues = ref(['SUCCESS', 'APPROVED'])
const statusValues = ref(['OK'])
const severityValues = ref(['INFO'])
const eventTypesValues = ref(['INE', 'PASSPORT', 'SESSION'])

const bodyInvite = () => ({
  email: '',
  roles: null,
  systems: [],
  ttlHours: 48,
  logFilters: {
    allowedOutcomes: [],
    allowedStatuses: [],
    allowedSeverities: [],
    allowedEventTypes: [],
  },
})

const bodyEdit = () => ({
  id: '',
  name: '',
  status: true,
})

// State
const formData = ref({
  ...bodyInvite(),
  ...bodyEdit(),
})

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const roleOptions = computed(() => props.availableRoles)

// Methods
const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email || '')

const isFormValid = computed(() => {
  if (props.saveMode !== 'save') {
    return !!formData.value.email && isValidEmail(formData.value.email) && !!formData.value.name
  }

  if (formData.value.roles === 'SYSTEM_MANAGER') {
    return (
      !!formData.value.email &&
      isValidEmail(formData.value.email) &&
      formData.value.roles &&
      formData.value.systems.length > 0 &&
      formData.value.ttlHours > 0 &&
      formData.value.ttlHours <= 168
    )
  }

  if (formData.value.roles === 'VIEWER') {
    return (
      !!formData.value.email &&
      isValidEmail(formData.value.email) &&
      formData.value.roles &&
      formData.value.systems.length > 0 &&
      formData.value.logFilters.allowedEventTypes.length > 0 &&
      formData.value.logFilters.allowedOutcomes.length > 0 &&
      formData.value.logFilters.allowedSeverities.length > 0 &&
      formData.value.logFilters.allowedStatuses.length > 0 &&
      formData.value.ttlHours > 0 &&
      formData.value.ttlHours <= 168
    )
  }

  return (
    !!formData.value.email &&
    isValidEmail(formData.value.email) &&
    formData.value.roles &&
    formData.value.ttlHours > 0 &&
    formData.value.ttlHours <= 168
  )
})

const boolToStatus = (val) => (val ? 'active' : 'inactive')

function hydrateForm() {
  invitationSent.value = false
  invitationLink.value = ''

  if (props.saveMode === 'edit' && props.dataUser) {
    const statusBool =
      props.dataUser.status === 'active'
        ? true
        : props.dataUser.status === 'inactive'
          ? false
          : !!props.dataUser.status

    formData.value = {
      ...bodyInvite(),
      ...bodyEdit(),
      id: props.dataUser.id ?? '',
      name: props.dataUser.name ?? '',
      email: props.dataUser.email ?? '',
      status: statusBool,
    }
  } else {
    // modo invitar
    formData.value = {
      ...bodyInvite(),
      ...bodyEdit(),
    }
  }
}

// Data
const ttlPresets = [
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '72h', value: 72 },
  { label: '7 días', value: 168 },
]

const formatExpiration = (hours) => {
  if (hours < 24) {
    return `en ${hours} hora${hours !== 1 ? 's' : ''}`
  } else {
    const days = Math.floor(hours / 24)
    return `en ${days} día${days !== 1 ? 's' : ''}`
  }
}

const enviarInvitacion = async () => {
  if (!isFormValid.value) {
    $q.notify({
      type: 'warning',
      message: 'Por favor completa todos los campos requeridos',
      position: 'top',
    })
    return
  }

  console.log('📤 Datos a envíar para la invitación:', {
    email: formData.value.email,
    roles: formData.value.roles,
    systems: formData.value.systems,
    ttlHours: formData.value.ttlHours,
    logFilters: formData.value.logFilters
  })

  try {
    sending.value = true
    const response = await sendInvitation({
      email: formData.value.email,
      roles: [formData.value.roles],
      systems: formData.value.systems,
      ttlHours: formData.value.ttlHours,
      logFilters: formData.value.logFilters
    })

    if (response.invitationLink) invitationLink.value = response.invitationLink
    else if (response.inviteId)
      invitationLink.value = `${window.location.origin}/accept-invitation?inviteId=${response.inviteId}`

    invitationSent.value = true

    emit('invitation-sent', response ?? 'Invitación realizada correctamente!')
    closeModal()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || 'Error al enviar la invitación',
      position: 'top',
      timeout: 5000,
    })
  } finally {
    sending.value = false
  }
}

const editarUsuario = async () => {
  try {
    console.log('✏️ Enviando datos a editar: ', {
      id: formData.value.id,
      email: formData.value.email,
      name: formData.value.name,
      status: boolToStatus(formData.value.status),
    })

    const response = await editUser({
      id: formData.value.id,
      email: formData.value.email,
      name: formData.value.name,
      status: boolToStatus(formData.value.status), // 👈 aquí
    })

    emit('invitation-sent', response)
    closeModal()
  } catch (error) {
    $q.notify({
      type: 'negative',
      message: error.response?.data?.message || error.message,
      position: 'top',
    })
  }
}

const copyLink = () => {
  navigator.clipboard.writeText(invitationLink.value).then(() => {
    $q.notify({
      type: 'positive',
      message: 'Link copiado al portapapeles',
      position: 'top',
      icon: 'content_copy',
      timeout: 2000,
    })
  })
}

const resetForm = () => {
  formData.value = {
    email: '',
    roles: [],
    systems: [],
    ttlHours: 48,
    name: '',
    id: '',
    status: true,
  }
  invitationSent.value = false
  invitationLink.value = ''
}

const closeModal = () => {
  if (!sending.value) emit('update:modelValue', false)
}

// Watchers
watch(
  () => [props.modelValue, props.saveMode, props.dataUser],
  ([open]) => {
    if (open) hydrateForm()
  },
  { deep: true },
)
</script>

<style lang="scss" scoped>
.invitation-modal {
  min-width: 640px;
  max-width: 760px;
  border-radius: 26px;
  background: linear-gradient(160deg, rgba(15, 20, 32, 0.96), rgba(18, 25, 42, 0.94));
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
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.header-content {
  display: flex;
  align-items: center;
  gap: 16px;

  h2 {
    margin: 0 0 4px 0;
    font-size: 1.55rem;
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
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 14px 30px rgba(34, 211, 238, 0.18);
  flex-shrink: 0;
}

.dialog-icon--edit {
  background: linear-gradient(135deg, #7c3aed, #ec4899);
}

.dialog-close-btn {
  color: rgba(255, 255, 255, 0.72);
}

.modal-separator {
  background: rgba(255, 255, 255, 0.08);
}

.modal-body {
  padding: 24px;
  max-height: 62vh;
  overflow-y: auto;
}

.invitation-form {
  display: flex;
  flex-direction: column;
  gap: 22px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.field-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.92rem;
  font-weight: 700;
  color: #ffffff;
}

.field-hint {
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.58);
  line-height: 1.5;
}

.accent-warm {
  color: #e97132;
}

/* INPUTS */
.premium-input {
  :deep(.q-field__control) {
    min-height: 54px;
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

  :deep(input::placeholder),
  :deep(textarea::placeholder) {
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

  :deep(.q-field__bottom) {
    color: rgba(255, 255, 255, 0.52);
  }
}

.input-icon {
  color: rgba(255, 255, 255, 0.58);
}

.toggle-dark {
  color: white;
  margin-top: 8px;
}

/* CHIPS */
.select-chip {
  border-radius: 999px;
  color: white;
  font-weight: 700;
  border: 1px solid transparent;
}

.select-chip--purple {
  background: rgba(124, 58, 237, 0.16);
  color: #d8b4fe;
  border-color: rgba(124, 58, 237, 0.26);
}

.select-chip--warm {
  background: rgba(233, 113, 50, 0.14);
  color: #ffb088;
  border-color: rgba(233, 113, 50, 0.25);
}

.select-chip--green {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
  border-color: rgba(34, 197, 94, 0.26);
}

.select-chip--blue {
  background: rgba(56, 189, 248, 0.14);
  color: #7dd3fc;
  border-color: rgba(56, 189, 248, 0.24);
}

/* TTL PRESETS */
.ttl-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.preset-chip {
  background: rgba(255, 255, 255, 0.05);
  color: rgba(255, 255, 255, 0.72);
  border: 1px solid rgba(255, 255, 255, 0.08);
  font-weight: 700;
}

.preset-chip--active {
  background: linear-gradient(90deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%);
  color: white;
  border-color: transparent;
}

/* PREVIEW */
.invitation-preview {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 18px;
  padding: 16px;
  margin-top: 4px;
}

.preview-header {
  display: flex;
  align-items: center;
  gap: 8px;
  font-weight: 800;
  color: #ffffff;
  margin-bottom: 12px;
}

.preview-content {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.preview-row {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 0.92rem;
  flex-wrap: wrap;

  strong {
    min-width: 110px;
    color: rgba(255, 255, 255, 0.58);
  }

  span {
    color: #ffffff;
  }
}

.preview-roles {
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
}

.preview-badge {
  font-weight: 700;
  border-radius: 999px;
  padding: 6px 10px;
}

.preview-badge--purple {
  background: rgba(124, 58, 237, 0.16);
  color: #d8b4fe;
  border: 1px solid rgba(124, 58, 237, 0.26);
}

.preview-badge--warm {
  background: rgba(233, 113, 50, 0.14);
  color: #ffb088;
  border: 1px solid rgba(233, 113, 50, 0.25);
}

.preview-badge--orange {
  background: rgba(233, 114, 50, 0.37);
  color: #ffb088;
  border: 1px solid rgba(233, 113, 50, 0.25);
}

.preview-badge--green {
  background: rgba(34, 197, 94, 0.16);
  color: #86efac;
  border: 1px solid rgba(34, 197, 94, 0.26);
}

.preview-badge--red {
  background: rgba(239, 68, 68, 0.14);
  color: #fca5a5;
  border: 1px solid rgba(239, 68, 68, 0.24);
}

/* ACTIONS */
.modal-actions {
  padding: 16px 24px;
}

.btn-primary {
  min-height: 50px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
}

.btn-secondary {
  min-height: 50px;
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

/* SUCCESS */
.success-section {
  border-top: 1px solid rgba(255, 255, 255, 0.08);
  padding: 28px 24px 24px;
  background: linear-gradient(160deg, rgba(34, 197, 94, 0.08), rgba(255, 255, 255, 0.02));
}

.success-header {
  text-align: center;
  margin-bottom: 24px;

  h3 {
    margin: 12px 0 8px 0;
    font-size: 1.35rem;
    font-weight: 800;
    color: #ffffff;
  }

  p {
    margin: 0;
    font-size: 0.92rem;
    color: rgba(255, 255, 255, 0.68);
  }
}

.success-icon-wrap {
  width: 72px;
  height: 72px;
  border-radius: 22px;
  display: grid;
  place-items: center;
  margin: 0 auto;
  background: rgba(34, 197, 94, 0.12);
  border: 1px solid rgba(34, 197, 94, 0.18);
}

.invitation-link-container {
  .link-display {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}

.copy-btn {
  color: #22d3ee;
}

/* TOOLTIP */
.glass-tooltip {
  background: #121a2a !important;
  color: white !important;
  border: 1px solid rgba(255, 255, 255, 0.08);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

@media (max-width: 768px) {
  .modal-header,
  .modal-body,
  .modal-actions,
  .success-section {
    padding-left: 18px;
    padding-right: 18px;
  }

  .header-content {
    align-items: flex-start;

    h2 {
      font-size: 1.3rem;
    }
  }

  .preview-row {
    strong {
      min-width: 100%;
    }
  }

  .link-display {
    flex-direction: column;
    align-items: stretch !important;
  }

  .btn-primary,
  .btn-secondary,
  .btn-cancel {
    width: 100%;
  }

  .modal-actions {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
