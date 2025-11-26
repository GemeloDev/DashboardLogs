<template>
  <q-dialog v-model="dialogModel" persistent>
    <q-card class="invitation-modal">
      <!-- Header -->
      <q-card-section class="modal-header">
        <div class="header-content">
          <q-icon name="email" size="32px" color="primary" />
          <div>
            <h2>Enviar Invitación</h2>
            <p>Invita a un nuevo usuario al sistema</p>
          </div>
        </div>
        <q-btn icon="close" flat round dense @click="closeModal" />
      </q-card-section>

      <q-separator />

      <!-- Body -->
      <q-card-section class="modal-body">
        <q-form @submit="enviarInvitacion" class="invitation-form">
          <!-- Email -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="alternate_email" size="20px" />
              Correo Electrónico *
            </label>
            <q-input
              v-model="formData.email"
              type="email"
              outlined
              placeholder="usuario@ejemplo.com"
              :rules="[
                (val) => !!val || 'El email es requerido',
                (val) => isValidEmail(val) || 'Email inválido',
              ]"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="mail" />
              </template>
            </q-input>
          </div>

          <!-- Roles -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="badge" size="20px" />
              Roles *
            </label>
            <q-select
              v-model="formData.roles"
              :options="roleOptions"
              multiple
              outlined
              placeholder="Selecciona uno o más roles"
              use-chips
              stack-label
              :rules="[(val) => (val && val.length > 0) || 'Selecciona al menos un rol']"
              lazy-rules
            >
              <template v-slot:prepend>
                <q-icon name="group_work" />
              </template>
              <template v-slot:selected-item="scope">
                <q-chip
                  removable
                  @remove="scope.removeAtIndex(scope.index)"
                  :tabindex="scope.tabindex"
                  color="secondary"
                  text-color="white"
                  dense
                >
                  {{ scope.opt }}
                </q-chip>
              </template>
            </q-select>
            <div class="field-hint">Puedes seleccionar múltiples roles para el usuario</div>
          </div>

          <!-- TTL Hours -->
          <div class="form-field">
            <label class="field-label">
              <q-icon name="schedule" size="20px" />
              Validez de la Invitación (horas)
            </label>
            <q-input
              v-model.number="formData.ttlHours"
              type="number"
              outlined
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
                <q-icon name="timer" />
              </template>
              <template v-slot:hint> La invitación expirará después de este tiempo </template>
            </q-input>
            <div class="ttl-presets">
              <q-chip
                v-for="preset in ttlPresets"
                :key="preset.value"
                clickable
                @click="formData.ttlHours = preset.value"
                :color="formData.ttlHours === preset.value ? 'primary' : 'grey-4'"
                :text-color="formData.ttlHours === preset.value ? 'white' : 'grey-8'"
                size="sm"
              >
                {{ preset.label }}
              </q-chip>
            </div>
          </div>

          <!-- Preview -->
          <div v-if="formData.email && formData.roles.length > 0" class="invitation-preview">
            <div class="preview-header">
              <q-icon name="visibility" size="20px" />
              Vista Previa
            </div>
            <div class="preview-content">
              <div class="preview-row">
                <strong>Para:</strong>
                <span>{{ formData.email }}</span>
              </div>
              <div class="preview-row">
                <strong>Roles:</strong>
                <div class="preview-roles">
                  <q-badge v-for="role in formData.roles" :key="role" color="secondary">
                    {{ role }}
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
      </q-card-section>

      <q-separator />

      <!-- Actions -->
      <q-card-actions class="modal-actions">
        <q-btn label="Cancelar" flat color="grey-7" @click="closeModal" :disable="sending" />
        <q-space />
        <q-btn
          label="Enviar Invitación"
          unelevated
          color="primary"
          icon-right="send"
          @click="enviarInvitacion"
          :loading="sending"
          :disable="!isFormValid"
        />
      </q-card-actions>

      <!-- Success State -->
      <q-card-section v-if="invitationSent && invitationLink" class="success-section">
        <div class="success-header">
          <q-icon name="check_circle" size="48px" color="positive" />
          <h3>¡Invitación Enviada!</h3>
          <p>Se ha enviado un correo a {{ formData.email }}</p>
        </div>

        <div class="invitation-link-container">
          <label class="field-label">Link de Invitación:</label>
          <div class="link-display">
            <q-input :model-value="invitationLink" outlined readonly dense />
            <q-btn icon="content_copy" color="primary" flat @click="copyLink">
              <q-tooltip>Copiar link</q-tooltip>
            </q-btn>
          </div>
          <div class="field-hint">Este link también fue enviado al correo del usuario</div>
        </div>

        <q-btn
          label="Enviar Otra Invitación"
          color="primary"
          flat
          icon="add"
          @click="resetForm"
          class="q-mt-md"
        />
      </q-card-section>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { sendInvitation } from '../services/invitationsService.js'

const props = defineProps({
  modelValue: {
    type: Boolean,
    required: true,
  },
  availableRoles: {
    type: Array,
    default: () => [],
  },
})

const emit = defineEmits(['update:modelValue', 'invitation-sent'])

const $q = useQuasar()

// State
const formData = ref({
  email: '',
  roles: [],
  ttlHours: 48,
})

const sending = ref(false)
const invitationSent = ref(false)
const invitationLink = ref('')

// Computed
const dialogModel = computed({
  get: () => props.modelValue,
  set: (val) => emit('update:modelValue', val),
})

const roleOptions = computed(() => {
  return props.availableRoles || []
})

const isFormValid = computed(() => {
  return (
    formData.value.email &&
    isValidEmail(formData.value.email) &&
    formData.value.roles.length > 0 &&
    formData.value.ttlHours > 0 &&
    formData.value.ttlHours <= 168
  )
})

// Data
const ttlPresets = [
  { label: '24h', value: 24 },
  { label: '48h', value: 48 },
  { label: '72h', value: 72 },
  { label: '7 días', value: 168 },
]

// Methods
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

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

  try {
    sending.value = true

    const response = await sendInvitation({
      email: formData.value.email,
      roles: formData.value.roles,
      ttlHours: formData.value.ttlHours,
    })

    console.log('✅ Invitación enviada:', response)

    // Guardar el link si viene en la respuesta
    if (response.invitationLink) {
      invitationLink.value = response.invitationLink
    } else if (response.inviteId) {
      // Construir el link manualmente si solo viene el ID
      invitationLink.value = `${window.location.origin}/accept-invitation?inviteId=${response.inviteId}`
    }

    invitationSent.value = true

    $q.notify({
      type: 'positive',
      message: '✅ Invitación enviada correctamente',
      position: 'top',
      timeout: 3000,
    })

    emit('invitation-sent', response)
  } catch (error) {
    console.error('❌ Error al enviar invitación:', error)
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
    ttlHours: 48,
  }
  invitationSent.value = false
  invitationLink.value = ''
}

const closeModal = () => {
  if (!sending.value) {
    resetForm()
    emit('update:modelValue', false)
  }
}

// Watchers
watch(
  () => props.modelValue,
  (newVal) => {
    if (newVal) {
      resetForm()
    }
  }
)
</script>

<style lang="scss" scoped>
$primary: #6366f1;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border-color: #e2e8f0;
$bg-light: #f8fafc;

.invitation-modal {
  min-width: 600px;
  max-width: 650px;

  @media (max-width: 768px) {
    min-width: 90vw;
  }
}

.modal-header {
  padding: 24px;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;

  .header-content {
    display: flex;
    align-items: center;
    gap: 16px;

    h2 {
      margin: 0 0 4px 0;
      font-size: 24px;
      font-weight: 700;
      color: $text-primary;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: $text-secondary;
    }
  }
}

.modal-body {
  padding: 24px;
  max-height: 60vh;
  overflow-y: auto;
}

.invitation-form {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-field {
  display: flex;
  flex-direction: column;
  gap: 8px;

  .field-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 14px;
    font-weight: 600;
    color: $text-primary;
  }

  .field-hint {
    font-size: 13px;
    color: $text-secondary;
    margin-top: 4px;
  }
}

.ttl-presets {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  margin-top: 8px;
}

.invitation-preview {
  background: $bg-light;
  border: 1px solid $border-color;
  border-radius: 8px;
  padding: 16px;
  margin-top: 8px;

  .preview-header {
    display: flex;
    align-items: center;
    gap: 8px;
    font-weight: 600;
    color: $text-primary;
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
    font-size: 14px;

    strong {
      min-width: 80px;
      color: $text-secondary;
    }

    span {
      color: $text-primary;
    }
  }

  .preview-roles {
    display: flex;
    gap: 6px;
    flex-wrap: wrap;
  }
}

.modal-actions {
  padding: 16px 24px;
  background: $bg-light;
}

.success-section {
  background: #f0fdf4;
  border-top: 3px solid #22c55e;
  padding: 32px 24px;

  .success-header {
    text-align: center;
    margin-bottom: 24px;

    h3 {
      margin: 12px 0 8px 0;
      font-size: 22px;
      font-weight: 700;
      color: $text-primary;
    }

    p {
      margin: 0;
      font-size: 14px;
      color: $text-secondary;
    }
  }
}

.invitation-link-container {
  .link-display {
    display: flex;
    gap: 8px;
    align-items: center;
  }
}
</style>
