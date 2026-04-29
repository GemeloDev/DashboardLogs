<template>
  <q-dialog
    v-model="showModalCreate"
    persistent
    @update:model-value="emit('update:modelValue', $event)"
  >
    <q-card flat bordered class="empresa-dialog-card">
      <div class="dialog-header">
        <div class="dialog-icon-box">
          <q-icon name="add_business" size="24px" color="white" />
        </div>

        <div>
          <div class="dialog-title">{{ t('santoroAdmin.createCompanyTitle') }}</div>
          <div class="dialog-subtitle">{{ t('santoroAdmin.createCompanySubtitle') }}</div>
        </div>
      </div>

      <q-card-section class="dialog-form">
        <div class="dialog-grid">
          <div class="field-span-2">
            <label class="input-label">{{ t('santoroAdmin.organizationNameLabel') }}</label>
            <q-input
              v-model="form.orgName"
              outlined
              dense
              class="premium-input"
              :placeholder="t('santoroAdmin.organizationNamePlaceholder')"
            />
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.domainLabel') }}</label>
            <q-input
              v-model="form.orgDomain"
              outlined
              dense
              class="premium-input"
              :placeholder="t('santoroAdmin.domainPlaceholder')"
            />
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.organizationCodeLabel') }}</label>
            <q-input
              v-model="form.orgCode"
              outlined
              dense
              class="premium-input"
              :placeholder="t('santoroAdmin.organizationCodePlaceholder')"
            />
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.slugLabel') }}</label>
            <q-input
              v-model="form.orgSlug"
              outlined
              dense
              class="premium-input"
              :placeholder="t('santoroAdmin.slugPlaceholder')"
            />
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.timezoneLabel') }}</label>
            <q-input
              v-model="form.timezone"
              outlined
              dense
              class="premium-input"
              :placeholder="t('santoroAdmin.timezonePlaceholder')"
            />
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.retentionDaysLabel') }}</label>
            <q-input
              v-model.number="form.retentionDays"
              outlined
              dense
              type="number"
              class="premium-input"
              placeholder="90"
              min="1"
            />
          </div>

          <div class="field-span-2 section-divider">
            <div class="section-title">{{ t('santoroAdmin.initialAdminSectionTitle') }}</div>
            <div class="section-subtitle">
              {{ t('santoroAdmin.initialAdminSectionSubtitle') }}
            </div>
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.adminNameLabel') }}</label>
            <q-input
              v-model="form.adminName"
              outlined
              dense
              class="premium-input"
              :placeholder="t('santoroAdmin.adminNamePlaceholder')"
            />
          </div>

          <div>
            <label class="input-label">{{ t('santoroAdmin.adminEmailLabel') }}</label>
            <q-input
              v-model="form.adminEmail"
              outlined
              dense
              type="email"
              class="premium-input"
              :placeholder="t('santoroAdmin.adminEmailPlaceholder')"
            />
          </div>

          <div class="field-span-2">
            <label class="input-label">{{ t('santoroAdmin.temporaryPasswordLabel') }}</label>
            <q-input
              v-model="form.temporaryPassword"
              outlined
              dense
              :type="showPassword ? 'text' : 'password'"
              class="premium-input"
              :placeholder="t('santoroAdmin.temporaryPasswordPlaceholder')"
            >
              <template v-slot:prepend>
                <q-icon name="lock" class="input-icon" />
              </template>

              <template v-slot:append>
                <q-btn
                  :icon="showPassword ? 'visibility_off' : 'visibility'"
                  flat
                  dense
                  round
                  size="sm"
                  class="visibility-btn"
                  @click="showPassword = !showPassword"
                />
              </template>
            </q-input>
          </div>
        </div>
      </q-card-section>

      <div class="dialog-actions">
        <q-btn flat no-caps :label="t('common.cancel')" class="cancel-btn" v-close-popup />
        <q-btn
          unelevated
          no-caps
          :label="t('santoroAdmin.createCompanyButton')"
          class="save-btn"
          @click="handleSave"
        />
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { DashboardSantoro } from 'src/services/dashboardSantoro'

const props = defineProps({
  modelValue: {
    type: Boolean,
    default: false,
  },
})

const emit = defineEmits(['update:modelValue', 'created'])

const $q = useQuasar()
const { t } = useI18n()
const showPassword = ref(false)
const showModalCreate = ref(props.modelValue)

const emptyForm = () => ({
  orgName: '',
  orgDomain: '',
  orgCode: '',
  orgSlug: '',
  timezone: 'America/Mexico_City',
  retentionDays: 90,
  adminName: '',
  adminEmail: '',
  temporaryPassword: '',
})

const form = ref(emptyForm())

watch(
  () => props.modelValue,
  (val) => {
    showModalCreate.value = val
    if (val) {
      form.value = emptyForm()
      showPassword.value = false
    }
  },
)

const validate = () => {
  const rules = [
    { field: 'orgName', message: t('santoroAdmin.organizationNameRequired') },
    { field: 'orgDomain', message: t('santoroAdmin.domainRequired') },
    { field: 'orgCode', message: t('santoroAdmin.codeRequired') },
    { field: 'orgSlug', message: t('santoroAdmin.slugRequired') },
    { field: 'adminName', message: t('santoroAdmin.adminNameRequired') },
    { field: 'adminEmail', message: t('santoroAdmin.adminEmailRequired') },
  ]

  for (const rule of rules) {
    if (!form.value[rule.field]?.trim()) {
      $q.notify({ type: 'negative', message: rule.message, position: 'top' })
      return false
    }
  }

  return true
}

const handleSave = async () => {
  if (!validate()) return

  const payload = {
    orgName: form.value.orgName,
    orgDomain: form.value.orgDomain,
    orgCode: form.value.orgCode,
    orgSlug: form.value.orgSlug,
    timezone: form.value.timezone,
    retentionDays: form.value.retentionDays,
    adminName: form.value.adminName,
    adminEmail: form.value.adminEmail,
    temporaryPassword: form.value.temporaryPassword,
  }

  try {
    const respuesta = await DashboardSantoro.createEmpresas(payload)
    $q.notify({
      type: 'positive',
      message: respuesta.message || t('santoroAdmin.companyCreated'),
      position: 'top',
    })
  } catch (error) {
    console.error('Error al generar empresa:', error.message)
    $q.notify({
      type: 'negative',
      message: error.message || t('santoroAdmin.companyCreateError'),
      position: 'top',
    })
    return
  }

  emit('created', payload)
  emit('update:modelValue', false)
}
</script>

<style lang="scss" scoped>
$bg-1: #070b14;
$bg-2: #0b1220;
$bg-3: #111827;

$text-main: #ffffff;
$text-soft: rgba(255, 255, 255, 0.72);

$cyan-strong: #06b6d4;
$purple: #7c3aed;
$pink: #ec4899;

.empresa-dialog-card {
  width: min(92vw, 760px);
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

.input-label {
  display: block;
  color: rgba(255, 255, 255, 0.72);
  font-size: 0.84rem;
  font-weight: 700;
  margin-bottom: 6px;
}

.section-divider {
  padding-top: 8px;
  border-top: 1px solid rgba(255, 255, 255, 0.07);
}

.section-title {
  color: $text-main;
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 4px;
}

.section-subtitle {
  color: $text-soft;
  font-size: 0.88rem;
}

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
  :deep(.q-field__label) {
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
}

.input-icon {
  color: rgba(255, 255, 255, 0.58);
}

.visibility-btn {
  color: rgba(255, 255, 255, 0.58);
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

@media (max-width: 700px) {
  .empresa-dialog-card {
    width: min(94vw, 760px);
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

  .save-btn,
  .cancel-btn {
    width: 100%;
  }
}
</style>
