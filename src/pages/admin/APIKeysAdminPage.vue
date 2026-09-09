<template>
  <q-page class="apikeys-page">
    <div class="apikeys-page__wrap">
      <section class="apikeys-header">
        <div>
          <div class="apikeys-header__badge">
            <q-icon name="vpn_key" size="18px" color="cyan" />
            <span>{{ t('santoroAdmin.administrationBadge') }}</span>
          </div>

          <h1 class="apikeys-header__title">
            {{ t('userManagement.title') }} <span class="color-orange-santoro">API Keys</span>
          </h1>

          <p class="apikeys-header__subtitle">
            {{ t('santoroAdmin.apiKeysSubtitle') }}
          </p>
        </div>
      </section>

      <section class="apikeys-toolbar">
        <div class="apikeys-toolbar__grid">
          <q-input
            v-model="search"
            outlined
            dense
            clearable
            class="premium-input"
            :placeholder="t('santoroAdmin.apiKeysSearchPlaceholder')"
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
            :label="t('santoroAdmin.companyFilterLabel')"
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
            :options="statusOptions"
            :label="t('santoroAdmin.statusFilterLabel')"
          > 
            <template v-slot:prepend>
              <q-icon name="filter_alt" class="input-icon" />
            </template>
          </q-select>
        </div>
      </section>

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
          :no-data-label="t('santoroAdmin.noApiKeysFound')"
        >
          <template v-slot:top>
            <div class="table-top">
              <div>
                <div class="table-title">{{ t('santoroAdmin.apiKeysListTitle') }}</div>
                <div class="table-subtitle">{{ rowsFoundLabel }}</div>
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
                {{ props.row.orgName || t('santoroAdmin.noCompany') }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-status="props">
            <q-td :props="props">
              <q-chip dense :class="getStatusChipClass(props.row.status)">
                {{ getStatusLabel(props.row.status) }}
              </q-chip>
            </q-td>
          </template>

          <template v-slot:body-cell-createdAt="props">
            <q-td :props="props">
              {{ formatDate(props.row.createdAt) }}
            </q-td>
          </template>

          <template v-slot:body-cell-lastUsedAt="props">
            <q-td :props="props">
              {{ formatLastUse(props.row.lastUsedAt) }}
            </q-td>
          </template>

          <template v-slot:body-cell-toggle="props">
            <q-td :props="props">
              <div class="toggle-wrap">
                <q-toggle
                  :model-value="props.row.status === 'active'"
                  :disable="props.row.status === 'expired'"
                  color="cyan"
                  keep-color
                  class="key-toggle"
                  @update:model-value="
                    (val) => toggleStatus(props.row, val, props.row.tenantId, props.row.id)
                  "
                >
                  <q-tooltip class="glass-tooltip">
                    {{
                      props.row.status === 'expired'
                        ? t('santoroAdmin.expiredKeyTooltip')
                        : props.row.status === 'active'
                          ? t('santoroAdmin.deactivateKeyTooltip')
                          : t('santoroAdmin.activateKeyTooltip')
                    }}
                  </q-tooltip>
                </q-toggle>
              </div>
            </q-td>
          </template>
        </q-table>
      </section>
    </div>
  </q-page>
</template>

<script setup>
import { computed, onMounted, ref } from 'vue'
import { useQuasar } from 'quasar'
import { useI18n } from 'vue-i18n'
import { DashboardSantoro } from 'src/services/dashboardSantoro'
import { timeAgoIntl } from 'src/helpers'

const $q = useQuasar()
const { t, locale } = useI18n()

const search = ref('')
const filtroEstado = ref('todos')
const filtroEmpresa = ref('todas')
const rows = ref([])

const opcionesEmpresa = computed(() => {
  const empresas = [...new Set(rows.value.map((k) => k.orgName).filter(Boolean))]
  return [
    { label: t('santoroAdmin.allCompanies'), value: 'todas' },
    ...empresas.map((empresa) => ({ label: empresa, value: empresa })),
  ]
})

const statusOptions = computed(() => [
  { label: t('santoroAdmin.allStatuses'), value: 'todos' },
  { label: t('santoroAdmin.activeKeysFilter'), value: 'active' },
  { label: t('santoroAdmin.disabledKeysFilter'), value: 'revoked' },
])

const columns = computed(() => [
  {
    name: 'name',
    label: t('santoroAdmin.nameApplicationColumn'),
    field: 'name',
    align: 'left',
    sortable: true,
  },
  {
    name: 'empresa',
    label: t('santoroAdmin.companyColumn'),
    field: 'empresa',
    align: 'left',
    sortable: true,
  },
  {
    name: 'status',
    label: t('santoroAdmin.statusColumn'),
    field: 'status',
    align: 'left',
    sortable: true,
  },
  {
    name: 'createdAt',
    label: t('santoroAdmin.createdColumn'),
    field: 'createdAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'lastUsedAt',
    label: t('santoroAdmin.lastUseColumn'),
    field: 'lastUsedAt',
    align: 'left',
    sortable: true,
  },
  {
    name: 'toggle',
    label: t('santoroAdmin.enabledColumn'),
    field: 'toggle',
    align: 'center',
  },
])

const pagination = ref({ page: 1, rowsPerPage: 10 })

const rowsFiltrados = computed(() => {
  let result = [...rows.value]

  if (search.value.trim()) {
    const query = search.value.toLowerCase()
    result = result.filter((item) =>
      [item.name, item.system, item.orgName].some((value) =>
        String(value || '')
          .toLowerCase()
          .includes(query),
      ),
    )
  }

  if (filtroEmpresa.value !== 'todas') {
    result = result.filter((item) => item.orgName === filtroEmpresa.value)
  }

  if (filtroEstado.value !== 'todos') {
    result = result.filter((item) => item.status === filtroEstado.value)
  }

  return result
})

const rowsFoundLabel = computed(() =>
  t(
    rowsFiltrados.value.length === 1
      ? 'santoroAdmin.recordsFoundSingular'
      : 'santoroAdmin.recordsFoundPlural',
    { count: rowsFiltrados.value.length },
  ),
)

const toggleStatus = async (row, isActive, tenant, id) => {
  const nuevoEstado = isActive ? 'active' : 'revoked'
  const previousStatus = row.status
  const idx = rows.value.findIndex((item) => item.id === row.id)
  if (idx === -1) return

  rows.value[idx] = { ...rows.value[idx], status: nuevoEstado }

  const response = await DashboardSantoro.changeStatusApiKey(tenant, id, nuevoEstado)

  if (!response.ok) {
    rows.value[idx] = { ...rows.value[idx], status: previousStatus }
    $q.notify({
      type: 'negative',
      position: 'top',
      message: response.message || t('santoroAdmin.apiKeyStatusError'),
    })
    return
  }

  $q.notify({
    type: 'positive',
    position: 'top',
    message: t(isActive ? 'santoroAdmin.apiKeyActivated' : 'santoroAdmin.apiKeyDeactivated', {
      name: row.name,
    }),
  })
}

const formatDate = (date) => {
  if (!date) return t('santoroAdmin.unavailable')
  return new Intl.DateTimeFormat(locale.value, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  }).format(new Date(date))
}

const formatLastUse = (value) => timeAgoIntl(value, locale.value, t('santoroAdmin.neverUsed'))

const getStatusChipClass = (status) => {
  if (status === 'active') return 'chip-active'
  if (status === 'revoked' || status === 'disabled') return 'chip-revoked'
  return 'chip-expired'
}

const getStatusLabel = (status) => {
  if (status === 'active') return t('santoroAdmin.apiKeyActive')
  if (status === 'revoked' || status === 'disabled') return t('santoroAdmin.apiKeyDisabled')
  return t('santoroAdmin.apiKeyExpired')
}

const loadAPIKeys = async () => {
  const response = await DashboardSantoro.getAPIKeys()

  if (!response.ok) {
    $q.notify({
      type: 'negative',
      position: 'top',
      message: response.message || t('santoroAdmin.apiKeysLoadError'),
    })
    return
  }

  rows.value = response.data.items || response.data.content || []
  $q.notify({
    type: 'positive',
    position: 'top',
    message: response.message || t('santoroAdmin.apiKeysLoaded'),
  })
}

onMounted(() => {
  loadAPIKeys()
})
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
  grid-template-columns: 1.6fr 0.7fr 0.5fr;
  gap: 16px;
}

/* TABLE */
.apikeys-table-wrap {
  border-radius: 24px;
  overflow: hidden;
}

.apikeys-table {
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
  color: #06121f;
  background: #e97132;
  box-shadow: 0 0 24px rgba(233, 113, 50, 0.22);
  flex-shrink: 0;
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

/* TOGGLE */
.toggle-wrap {
  display: flex;
  justify-content: center;
}

.key-toggle {
  :deep(.q-toggle__track) {
    opacity: 1;
  }
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
    grid-template-columns: 1fr 1fr;
  }

  .apikeys-header {
    flex-direction: column;
    align-items: stretch;
  }
}

@media (max-width: 700px) {
  .apikeys-page__wrap {
    padding: 18px 14px 28px;
  }

  .apikeys-toolbar__grid {
    grid-template-columns: 1fr;
  }
}
</style>
