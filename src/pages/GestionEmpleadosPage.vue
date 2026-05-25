<template>
  <q-page class="gestion-empleados-page">
    <!-- Animated background particles -->
    <div class="background-particles">
      <div class="particle particle-1"></div>
      <div class="particle particle-2"></div>
      <div class="particle particle-3"></div>
      <div class="particle particle-4"></div>
    </div>

    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-left">
          <div class="header-badge">
            <q-icon name="group" size="18px" color="cyan" />
            <span>{{ t('common.administration') }}</span>
          </div>

          <div class="header-main">
            <div class="icon-container">
              <q-icon name="group" size="30px" />
            </div>

            <div class="header-text">
              <h1 class="no-padding no-margin">
                {{ t('userManagement.title') }} <span class="gradient-text">{{ t('layout.users') }}</span>
              </h1>
              <p class="no-padding no-margin">{{ t('userManagement.textManagment') }}</p>
            </div>
          </div>
        </div>

        <q-btn
          @click="
            () => {
              mostrarModalInvitacion = true
              saveMode = 'save'
            }
          "
          unelevated
          no-caps
          icon="person_add"
          :label="t('userManagement.sendInvitation')"
          class="btn-primary"
        />
      </div>

      <!-- Stats Cards con animación -->
      <div class="stats-section">
        <q-card flat class="stat-card stat-card-1">
          <div class="stat-icon-container">
            <q-icon name="people" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ t('userManagement.totalUsers') }}</div>
            <div class="stat-value">{{ totalUsers }}</div>
          </div>
          <div class="stat-glow"></div>
        </q-card>

        <q-card flat class="stat-card stat-card-2">
          <div class="stat-icon-container">
            <q-icon name="check_circle" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ t('userManagement.active') }}</div>
            <div class="stat-value">{{ activeUsers }}</div>
          </div>
          <div class="stat-glow"></div>
        </q-card>

        <q-card flat class="stat-card stat-card-3">
          <div class="stat-icon-container">
            <q-icon name="badge" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ t('userManagement.statsRoles') }}</div>
            <div class="stat-value">{{ availableRoles.length }}</div>
          </div>
          <div class="stat-glow"></div>
        </q-card>

        <q-card flat class="stat-card stat-card-4" v-if="selectedRole">
          <div class="stat-icon-container">
            <q-icon name="filter_list" size="32px" />
          </div>
          <div class="stat-content">
            <div class="stat-label">{{ t('userManagement.statsFilter') }}</div>
            <div class="stat-value-text">{{ selectedRole }}</div>
          </div>
          <div class="stat-glow"></div>
        </q-card>
      </div>

      <!-- Filtros y Búsqueda con diseño mejorado -->
      <div class="filters-section">
        <div class="filters-container">
          <!-- Buscador con efecto glow -->
          <q-input
            v-model="searchTerm"
            dark
            filled
            :placeholder="t('userManagement.searchPlaceholder')"
            class="search-input"
            @update:model-value="onSearchChange"
          >
            <template v-slot:prepend>
              <q-icon name="search" color="primary" />
            </template>
            <template v-slot:append v-if="searchTerm">
              <q-icon name="close" @click="clearSearch" class="cursor-pointer" color="grey-5" />
            </template>
          </q-input>

          <!-- Filtro por Rol con diseño oscuro -->
          <q-select
            v-model="selectedRole"
            :options="filteredRoleOptions"
            dark
            filled
            use-input
            input-debounce="300"
            :label="t('userManagement.filterRoleLabel')"
            clearable
            class="role-filter"
            @filter="filterRoles"
            @update:model-value="onRoleChange"
            @new-value="createNewRole"
          >
            <template v-slot:prepend>
              <q-icon name="filter_list" color="secondary" />
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey-5">
                  {{ t('userManagement.noRolesAvailable') }}
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <!-- Tamaño de página -->
          <q-select
            v-model="pageSize"
            :options="pageSizeOptions"
            dark
            filled
            :label="t('userManagement.show')"
            emit-value
            map-options
            class="page-size-select"
            @update:model-value="onPageSizeChange"
          >
            <template v-slot:prepend>
              <q-icon name="view_list" color="accent" />
            </template>
          </q-select>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <q-spinner-dots size="50px" color="primary" />
        <p>{{ t('userManagement.loadingUsers') }}</p>
      </div>

      <!-- Lista de Usuarios (Cards) con diseño mejorado -->
      <div v-else-if="users.length > 0" class="users-grid">
        <q-card v-for="user in users" :key="user.id" class="user-card" flat>
          <!-- Glow effect -->
          <div class="card-glow"></div>

          <q-card-section class="user-card-header">
            <div class="user-avatar">
              <div class="avatar-ring"></div>
              <q-avatar size="68px" class="avatar-gradient">
                <span class="avatar-text">{{ getInitials(user.name) }}</span>
              </q-avatar>
              <q-badge
                v-if="user.status === 'active'"
                color="positive"
                floating
                rounded
                class="status-badge"
              >
                <q-icon name="check" size="12px" />
              </q-badge>
              <q-badge v-else color="negative" floating rounded class="status-badge">
                <q-icon name="close" size="12px" />
              </q-badge>
            </div>
            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p class="user-email">
                <q-icon name="email" size="14px" class="q-mr-xs" />
                {{ user.email }}
              </p>
            </div>
          </q-card-section>

          <div class="divider"></div>

          <q-card-section class="user-card-body">
            <!-- Roles con chips animados -->
            <div class="info-row">
              <div class="info-icon-container">
                <q-icon name="badge" size="20px" />
              </div>
              <div class="info-content">
                <span class="info-label">
                  <q-icon name="star" size="12px" class="q-mr-xs" />
                  {{ t('userManagement.roles') }}
                </span>
                <div class="roles-container">
                  <q-chip
                    v-for="role in user.roles"
                    :key="role"
                    size="sm"
                    class="role-chip"
                    dense
                    icon="workspace_premium"
                  >
                    {{ role }}
                  </q-chip>
                  <span v-if="!user.roles || user.roles.length === 0" class="no-roles">
                    <q-icon name="remove_circle_outline" size="14px" class="q-mr-xs" />
                    {{ t('userManagement.noRolesAssigned') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Status con indicador visual -->
            <div class="info-row">
              <div class="info-icon-container">
                <q-icon name="info" size="20px" />
              </div>
              <div class="info-content">
                <span class="info-label">
                  <q-icon name="toggle_on" size="12px" class="q-mr-xs" />
                  {{ t('userManagement.status') }}
                </span>
                <div class="status-indicator">
                  <div
                    :class="['status-dot', user.status === 'active' ? 'active' : 'inactive']"
                  ></div>
                  <span class="status-text">
                    {{ user.status === 'active' ? t('common.active') : t('common.inactive') }}
                  </span>
                </div>
              </div>
            </div>

            <!-- Fecha de Creación -->
            <div class="info-row">
              <div class="info-icon-container">
                <q-icon name="calendar_today" size="20px" />
              </div>
              <div class="info-content">
                <span class="info-label">
                  <q-icon name="event" size="12px" class="q-mr-xs" />
                  {{ t('userManagement.created') }}
                </span>
                <span class="info-value">
                  <q-icon name="date_range" size="14px" class="q-mr-xs" />
                  {{ formatDate(user.createdAt) }}
                </span>
              </div>
            </div>
          </q-card-section>

          <div class="divider"></div>

          <q-card-actions class="user-card-actions">
            <q-space />
            <q-btn unelevated no-caps icon="more_vert" class="action-btn-menu" size="xs">
              <q-menu dark class="menu-dark">
                <q-list class="menu-list">
                  <q-item clickable v-close-popup class="menu-item" @click="editUsuario(user)">
                    <q-item-section avatar>
                      <q-icon name="edit" color="blue-4" />
                    </q-item-section>
                    <q-item-section>{{ t('userManagement.editData') }}</q-item-section>
                  </q-item>
                  <q-item
                    clickable
                    v-close-popup
                    class="menu-item menu-item-danger"
                    @click="eliminarUsuario(user)"
                  >
                    <q-item-section avatar>
                      <q-icon name="delete" color="red-4" />
                    </q-item-section>
                    <q-item-section>{{ t('userManagement.delete') }}</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- No hay usuarios con diseño mejorado -->
      <div v-else class="empty-state">
        <div class="empty-icon-container">
          <div class="empty-icon-glow"></div>
          <q-icon name="search_off" size="80px" />
        </div>
        <h3>{{ t('userManagement.noUsers') }}</h3>
        <p>{{ t('userManagement.tryAgain') }}</p>
        <div class="empty-actions">
          <q-btn
            @click="resetFilters"
            unelevated
            no-caps
            icon="refresh"
            :label="t('filters.clearFilters')"
            class="empty-btn"
          />
          <q-btn
            @click="mostrarModalInvitacion = true"
            unelevated
            no-caps
            icon="person_add"
            :label="t('userManagement.sendInvitation')"
            class="empty-btn-primary"
          />
        </div>
      </div>

      <!-- Paginación con diseño mejorado -->
      <div v-if="totalPages > 1" class="pagination-container">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          direction-links
          boundary-links
          color="primary"
          active-color="primary"
          active-text-color="white"
          text-color="white"
          @update:model-value="onPageChange"
          class="pagination-control"
        />
        <div class="pagination-info">
          <q-icon name="info" size="16px" class="q-mr-xs" />
          {{ t('userManagement.showing') }}
          <span class="pagination-highlight">{{ startItem }}-{{ endItem }}</span>
          {{ t('userManagement.of') }}
          <span class="pagination-highlight">{{ totalUsers }}</span>
          {{ t('userManagement.users') }}
        </div>
      </div>
    </div>

    <!-- Modal de Invitación -->
    <EnviarInvitacionModal
      v-model="mostrarModalInvitacion"
      :saveMode="saveMode"
      :available-roles="availableRoles"
      :dataUser="dataUser"
      @invitation-sent="onInvitationSent"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { deleteUser, getUsers } from '../services/usersService.js'
import EnviarInvitacionModal from '../components/EnviarInvitacionModal.vue'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const { t, locale } = useI18n()

// State
const users = ref([])
const loading = ref(false)
const searchTerm = ref('')
const selectedRole = ref(null)
const currentPage = ref(1)
const pageSize = ref(12)
const totalUsers = ref(0)
const totalPages = ref(0)
const availableRoles = ref([])
const filteredRoleOptions = ref([])
const mostrarModalInvitacion = ref(false)
const saveMode = ref('save')
const dataUser = ref({})

// Options
const pageSizeOptions = [
  { label: t('userManagement.pageSizeOption6'), value: 6 },
  { label: t('userManagement.pageSizeOption12'), value: 12 },
  { label: t('userManagement.pageSizeOption24'), value: 24 },
  { label: t('userManagement.pageSizeOption48'), value: 48 },
]

const roleOptions = computed(() => {
  const allRoles = [t('userManagement.allRoles'), ...availableRoles.value]
  return allRoles
})

// Computed
const activeUsers = computed(() => {
  return users.value.filter((u) => u.status === 'active').length
})

const startItem = computed(() => {
  return totalUsers.value === 0 ? 0 : (currentPage.value - 1) * pageSize.value + 1
})

const endItem = computed(() => {
  return Math.min(currentPage.value * pageSize.value, totalUsers.value)
})

// Methods
const fetchUsers = async () => {
  try {
    loading.value = true
    const response = await getUsers(
      currentPage.value - 1,
      pageSize.value,
      searchTerm.value,
      selectedRole.value,
    )

    users.value = response.data.data || []
    totalUsers.value = response.data.total || 0
    totalPages.value = Math.ceil(totalUsers.value / pageSize.value)

  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error)
    $q.notify({
      type: 'negative',
      message: t('userManagement.loadUsersError'),
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    // Roles predeterminados del sistema
    const defaultRoles = ['ORG_ADMIN', 'SYSTEM_MANAGER', 'AUDITOR', 'SUPPORT_TI', 'VIEWER']

    // Combinar roles del servidor con predeterminados (sin duplicados)
    const allRoles = [...new Set([...defaultRoles])]

    availableRoles.value = allRoles
    filteredRoleOptions.value = [t('userManagement.allRoles'), ...allRoles]

  } catch (error) {
    console.error('❌ Error al cargar roles:', error)
    // En caso de error, usar solo roles predeterminados
    availableRoles.value = ['ORG_ADMIN', 'SYSTEM_MANAGER', 'AUDITOR', 'SUPPORT_TI', 'VIEWER']
    filteredRoleOptions.value = [t('userManagement.allRoles'), ...availableRoles.value]
  }
}

const clearSearch = () => {
  searchTerm.value = ''
  fetchUsers()
}

const filterRoles = (val, update) => {
  if (val === '') {
    update(() => {
      filteredRoleOptions.value = roleOptions.value
    })
    return
  }

  update(() => {
    const needle = val.toLowerCase()
    filteredRoleOptions.value = roleOptions.value.filter(
      (role) => role.toLowerCase().indexOf(needle) > -1,
    )
  })
}

const createNewRole = (val, done) => {
  if (val.length > 0) {
    const newRole = val.trim().toUpperCase()
    if (!availableRoles.value.includes(newRole)) {
      availableRoles.value.push(newRole)
      $q.notify({
        type: 'positive',
        message: t('userManagement.roleAdded', { role: newRole }),
        position: 'top',
      })
    }
    done(newRole, 'add-unique')
    selectedRole.value = newRole
    onRoleChange()
  }
}

const onSearchChange = () => {
  currentPage.value = 1
  fetchUsers()
}

const onRoleChange = () => {
  currentPage.value = 1
  fetchUsers()
}

const onPageSizeChange = () => {
  currentPage.value = 1
  fetchUsers()
}

const onPageChange = () => {
  fetchUsers()
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

const resetFilters = () => {
  searchTerm.value = ''
  selectedRole.value = null
  currentPage.value = 1
  fetchUsers()
}

const getInitials = (name) => {
  if (!name) return '??'
  const parts = name.split(' ')
  if (parts.length >= 2) {
    return (parts[0][0] + parts[1][0]).toUpperCase()
  }
  return name.substring(0, 2).toUpperCase()
}

const formatDate = (dateString) => {
  if (!dateString) return t('common.unknown')
  const date = new Date(dateString)
  return date.toLocaleDateString(locale.value, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const editUsuario = (user) => {
  dataUser.value = user
  saveMode.value = 'edit'
  mostrarModalInvitacion.value = true
}

const eliminarUsuario = (user) => {
  $q.dialog({
    title: t('userManagement.deleteUserTitle'),
    message: t('userManagement.deleteUserMessage', { name: user.name }),
    cancel: true,
    dark: true,
  }).onOk(async () => {
    const response = await deleteUser(user.id)
    $q.notify({
      message: t('userManagement.deleteUserSuccess', { message: response.data.message }),
      color: 'green',
      position: 'top',
    })

    // Opcional: recargar usuarios
    fetchUsers()
  })
}

const onInvitationSent = (response) => {
  mostrarModalInvitacion.value = false

  $q.notify({
    type: 'positive',
    message: t('userManagement.invitationSentNotify', {
      message: response?.data?.message ?? response?.message,
    }),
    position: 'top',
    timeout: 3000,
  })

  // Opcional: recargar usuarios
  fetchUsers()
}

// Lifecycle
onMounted(() => {
  fetchRoles() // Primero cargar roles
  fetchUsers() // Luego cargar usuarios
})
</script>

<style lang="scss" scoped>
// Variables del sistema oscuro
$bg-dark: #121826;
$bg-card: #1e1e2f;
$bg-card-hover: #232345;
$bg-card-light: #2c2c44;
$text-primary: #ffffff;
$text-secondary: #94a3b8;
$text-muted: #64748b;
$primary: #6366f1;
$primary-dark: #4f46e5;
$primary-light: #818cf8;
$secondary: #10b981;
$accent: #f59e0b;
$success: #10b981;
$warning: #f59e0b;
$error: #ef4444;
$border: rgba(255, 255, 255, 0.1);
$border-hover: rgba(255, 255, 255, 0.2);
.gestion-empleados-page {
  min-height: 100vh;
  padding: 24px;
  position: relative;
  overflow: hidden;
}

// Partículas de fondo animadas
.background-particles {
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;

  .particle {
    position: absolute;
    width: 4px;
    height: 4px;
    background: rgba($primary, 0.3);
    border-radius: 50%;
    animation: float 20s infinite;

    &.particle-1 {
      top: 10%;
      left: 20%;
      animation-delay: 0s;
    }

    &.particle-2 {
      top: 60%;
      left: 80%;
      animation-delay: 5s;
      background: rgba($secondary, 0.3);
    }

    &.particle-3 {
      top: 80%;
      left: 10%;
      animation-delay: 10s;
      background: rgba($accent, 0.3);
    }

    &.particle-4 {
      top: 30%;
      left: 70%;
      animation-delay: 15s;
    }
  }
}

@keyframes float {
  0%,
  100% {
    transform: translateY(0) translateX(0);
  }
  25% {
    transform: translateY(-30px) translateX(30px);
  }
  50% {
    transform: translateY(-60px) translateX(-30px);
  }
  75% {
    transform: translateY(-30px) translateX(60px);
  }
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
  position: relative;
  z-index: 1;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 18px;
  margin-bottom: 24px;
}

.header-left {
  display: flex;
  flex-direction: column;
  align-items: flex-start;
}

.header-badge {
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

.header-badge {
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

.header-main {
  display: flex;
  align-items: center;
  gap: 16px;
}

.icon-container {
  width: 64px;
  height: 64px;
  border-radius: 18px;
  display: grid;
  place-items: center;
  color: white;
  flex-shrink: 0;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 14px 30px rgba(34, 211, 238, 0.18);
}

.header-text {
  h1 {
    margin: 0 0 8px 0;
    color: #ffffff;
    font-size: clamp(2rem, 3.8vw, 3rem);
    line-height: 1.05;
    font-weight: 900;
    letter-spacing: -0.04em;
  }

  p {
    margin: 0;
    color: rgba(255, 255, 255, 0.72);
    font-size: 1rem;
    line-height: 1.6;
  }
}

.gradient-text {
  color: var(--santoro);
}

.btn-primary {
  min-height: 52px;
  padding: 0 20px;
  border-radius: 16px;
  font-weight: 800;
  color: white;
  text-transform: none;
  background: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  box-shadow: 0 18px 38px rgba(34, 211, 238, 0.16);
  transition:
    transform 0.16s ease,
    box-shadow 0.16s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 20px 44px rgba(34, 211, 238, 0.22);
  }
}

@media (max-width: 768px) {
  .page-header {
    flex-direction: column;
    align-items: stretch;
  }

  .header-main {
    align-items: flex-start;
  }

  .header-text {
    h1 {
      font-size: 2rem;
    }

    p {
      font-size: 0.95rem;
    }
  }

  .btn-primary {
    width: 100%;
  }
}

@keyframes shimmer {
  0% {
    transform: translateX(-100%);
  }
  100% {
    transform: translateX(100%);
  }
}

@keyframes pulse {
  0%,
  100% {
    box-shadow: 0 4px 20px rgba(99, 102, 241, 0.5);
  }
  50% {
    box-shadow: 0 4px 30px rgba(99, 102, 241, 0.8);
  }
}

@keyframes rotate {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

@keyframes gradient-shift {
  0%,
  100% {
    background-position: 0% 50%;
  }
  50% {
    background-position: 100% 50%;
  }
}

// Stats Cards
.stats-section {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
  gap: 20px;
  margin-bottom: 28px;

  .stat-card {
    background: rgba(255, 255, 255, 0.04);
    border-radius: 20px;
    padding: 24px;
    display: flex;
    align-items: center;
    gap: 16px;
    position: relative;
    overflow: hidden;
    border: 1px solid $border;
    transition: all 0.4s ease;

    &::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: linear-gradient(135deg, rgba($primary, 0.05), transparent);
      opacity: 0;
      transition: opacity 0.4s;
    }

    &:hover {
      transform: translateY(-5px);
      border-color: $border-hover;
      box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);

      &::before {
        opacity: 1;
      }

      .stat-glow {
        opacity: 1;
      }
    }

    .stat-glow {
      position: absolute;
      top: 0;
      right: 0;
      width: 150px;
      height: 150px;
      border-radius: 50%;
      opacity: 0;
      transition: opacity 0.4s;
    }

    &.stat-card-1 {
      .stat-icon-container {
        background: linear-gradient(135deg, $primary, $primary-dark);
      }
      .stat-glow {
        background: radial-gradient(circle, rgba($primary, 0.2), transparent);
      }
    }

    &.stat-card-2 {
      .stat-icon-container {
        background: linear-gradient(135deg, $secondary, #10b981);
      }
      .stat-glow {
        background: radial-gradient(circle, rgba($secondary, 0.2), transparent);
      }
    }

    &.stat-card-3 {
      .stat-icon-container {
        background: linear-gradient(135deg, $secondary, #10b981);
      }
      .stat-glow {
        background: radial-gradient(circle, rgba($accent, 0.2), transparent);
      }
    }

    &.stat-card-4 {
      .stat-icon-container {
        background: linear-gradient(135deg, #ec4899, #db2777);
      }
      .stat-glow {
        background: radial-gradient(circle, rgba(#ec4899, 0.2), transparent);
      }
    }

    .stat-icon-container {
      width: 56px;
      height: 56px;
      border-radius: 14px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);

      .q-icon {
        color: white;
      }
    }

    .stat-content {
      flex: 1;

      .stat-label {
        font-size: 13px;
        color: $text-secondary;
        font-weight: 500;
        text-transform: uppercase;
        letter-spacing: 0.5px;
        margin-bottom: 6px;
      }

      .stat-value {
        font-size: 32px;
        font-weight: 700;
        color: $text-primary;
        line-height: 1;
      }

      .stat-value-text {
        font-size: 16px;
        font-weight: 600;
        color: $text-primary;
        line-height: 1.2;
      }
    }
  }
}

// Filtros
.filters-section {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 28px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid $border;
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr 1fr 150px;
  gap: 16px;

  :deep(.q-field__control) {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    border: 1px solid $border;
    transition: all 0.3s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.08);
      border-color: $border-hover;
    }
  }

  :deep(.q-field--focused .q-field__control) {
    background: rgba(255, 255, 255, 0.1);
    border-color: $primary;
    box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.2);
  }

  :deep(.q-field__native),
  :deep(.q-field__label) {
    color: $text-primary;
  }

  :deep(.q-field__label) {
    color: $text-secondary;
  }

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 100px 20px;
  color: $text-secondary;

  .q-spinner-dots {
    filter: drop-shadow(0 0 10px rgba($primary, 0.5));
  }

  p {
    margin-top: 20px;
    font-size: 18px;
    font-weight: 500;
    color: $text-primary;
  }
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(360px, 1fr));
  gap: 24px;
  margin-bottom: 36px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.user-card {
  background: rgba(255, 255, 255, 0.04);
  border-radius: 20px;
  overflow: hidden;
  border: 1px solid $border;
  position: relative;
  transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);

  .card-glow {
    position: absolute;
    top: -50%;
    left: -50%;
    width: 200%;
    height: 200%;
    background: conic-gradient(
      from 0deg,
      transparent 0deg,
      rgba($primary, 0.1) 90deg,
      transparent 180deg
    );
    opacity: 0;
    transition: opacity 0.4s;
    animation: rotate 6s linear infinite;
    pointer-events: none;
  }

  &:hover {
    transform: translateY(-8px) scale(1.02);
    border-color: $border-hover;
    box-shadow:
      0 15px 40px rgba(99, 102, 241, 0.3),
      0 0 20px rgba(99, 102, 241, 0.1);

    .card-glow {
      opacity: 1;
    }

    .avatar-ring {
      opacity: 1;
      animation: ring-pulse 2s ease-in-out infinite;
    }
  }
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 18px;
  padding: 24px;
  position: relative;
  z-index: 1;

  .user-avatar {
    position: relative;

    .avatar-ring {
      position: absolute;
      top: -4px;
      left: -4px;
      right: -4px;
      bottom: -4px;
      border-radius: 50%;
      border: 2px solid $primary;
      opacity: 0;
      transition: opacity 0.3s;
    }

    .avatar-gradient {
      background: linear-gradient(135deg, $primary, $secondary);
      box-shadow: 0 4px 16px rgba(99, 102, 241, 0.4);
    }

    .avatar-text {
      font-size: 26px;
      font-weight: 700;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
    }

    .status-badge {
      animation: badge-pulse 2s ease-in-out infinite;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0 0 6px 0;
      font-size: 20px;
      font-weight: 700;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      letter-spacing: -0.3px;
    }

    .user-email {
      margin: 0;
      font-size: 14px;
      color: $text-secondary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
      display: flex;
      align-items: center;

      .q-icon {
        opacity: 0.7;
      }
    }
  }
}

.divider {
  height: 1px;
  background: linear-gradient(90deg, transparent, $border, transparent);
  margin: 0 16px;
}

.user-card-body {
  padding: 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 14px;
  position: relative;
  z-index: 1;
}

@keyframes ring-pulse {
  0%,
  100% {
    transform: scale(1);
    opacity: 0.5;
  }
  50% {
    transform: scale(1.1);
    opacity: 1;
  }
}

@keyframes badge-pulse {
  0%,
  100% {
    transform: scale(1);
  }
  50% {
    transform: scale(1.1);
  }
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 14px;

  .info-icon-container {
    width: 36px;
    height: 36px;
    background: rgba($primary, 0.1);
    border-radius: 10px;
    display: flex;
    align-items: center;
    justify-content: center;
    transition: all 0.3s;

    .q-icon {
      color: $primary;
    }
  }

  &:hover .info-icon-container {
    background: rgba($primary, 0.2);
    transform: scale(1.1);
  }

  .info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 6px;
  }

  .info-label {
    font-size: 11px;
    font-weight: 700;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    display: flex;
    align-items: center;

    .q-icon {
      opacity: 0.6;
    }
  }

  .info-value {
    font-size: 14px;
    color: $text-primary;
    font-weight: 500;
    display: flex;
    align-items: center;

    .q-icon {
      color: $text-secondary;
      opacity: 0.7;
    }
  }

  .roles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
  }

  .role-chip {
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba($secondary, 0.2));
    color: $text-primary;
    border: 1px solid $border;
    font-weight: 600;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, rgba($primary, 0.3), rgba($secondary, 0.3));
      transform: translateY(-2px);
      box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
    }

    :deep(.q-icon) {
      color: $primary-light;
    }
  }

  .no-roles {
    font-size: 13px;
    color: $text-muted;
    font-style: italic;
    display: flex;
    align-items: center;

    .q-icon {
      opacity: 0.5;
    }
  }

  .status-indicator {
    display: flex;
    align-items: center;
    gap: 10px;

    .status-dot {
      width: 10px;
      height: 10px;
      border-radius: 50%;
      position: relative;

      &::before {
        content: '';
        position: absolute;
        top: -2px;
        left: -2px;
        right: -2px;
        bottom: -2px;
        border-radius: 50%;
        opacity: 0.4;
        animation: pulse-ring 2s ease-out infinite;
      }

      &.active {
        background: $secondary;

        &::before {
          background: $secondary;
        }
      }

      &.inactive {
        background: $error;

        &::before {
          background: $error;
        }
      }
    }

    .status-text {
      font-size: 14px;
      font-weight: 600;
      color: $text-primary;
    }
  }
}

@keyframes pulse-ring {
  0% {
    transform: scale(1);
    opacity: 0.4;
  }
  100% {
    transform: scale(1.5);
    opacity: 0;
  }
}

.user-card-actions {
  padding: 16px 24px;
  background: rgba(255, 255, 255, 0.02);
  display: flex;
  align-items: center;
  gap: 12px;
  position: relative;
  z-index: 1;

  .action-btn-primary {
    background: linear-gradient(135deg, rgba($primary, 0.2), rgba($primary, 0.3));
    color: $text-primary;
    border: 1px solid rgba($primary, 0.3);
    font-weight: 600;
    transition: all 0.3s;

    &:hover {
      background: linear-gradient(135deg, rgba($primary, 0.3), rgba($primary, 0.4));
      border-color: $primary;
      transform: translateX(2px);
    }

    .q-icon {
      color: $primary-light;
    }
  }

  .action-btn-menu {
    background: rgba(255, 255, 255, 0.05);
    color: $text-secondary;
    border: 1px solid $border;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: $border-hover;
      color: $text-primary;
    }
  }
}

.menu-dark {
  background: $bg-card-hover;
  border: 1px solid $border;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.4);

  .menu-list {
    padding: 8px;
  }

  .menu-item {
    border-radius: 8px;
    transition: all 0.2s;
    color: $text-primary;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
    }

    &.menu-item-danger:hover {
      background: rgba($error, 0.2);
    }
  }
}

.empty-state {
  text-align: center;
  padding: 100px 40px;
  color: $text-secondary;

  .empty-icon-container {
    position: relative;
    display: inline-block;
    margin-bottom: 24px;

    .empty-icon-glow {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      width: 120px;
      height: 120px;
      background: radial-gradient(circle, rgba($primary, 0.2), transparent);
      border-radius: 50%;
      animation: pulse 2s ease-in-out infinite;
    }

    .q-icon {
      color: $text-secondary;
      filter: drop-shadow(0 4px 12px rgba($primary, 0.3));
      position: relative;
      z-index: 1;
    }
  }

  h3 {
    margin: 0 0 12px 0;
    font-size: 28px;
    color: $text-primary;
    font-weight: 700;
  }

  p {
    margin: 0 0 32px 0;
    font-size: 16px;
    color: $text-secondary;
    max-width: 500px;
    margin-left: auto;
    margin-right: auto;
  }

  .empty-actions {
    display: flex;
    gap: 12px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .empty-btn {
    background: rgba(255, 255, 255, 0.05);
    color: $text-primary;
    border: 1px solid $border;
    padding: 0 24px;
    height: 44px;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: $border-hover;
      transform: translateY(-2px);
    }
  }

  .empty-btn-primary {
    background: linear-gradient(135deg, $primary, $primary-dark);
    color: white;
    border: none;
    padding: 0 24px;
    height: 44px;
    border-radius: 12px;
    transition: all 0.3s;

    &:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 24px rgba(99, 102, 241, 0.5);
    }
  }
}

.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
  padding: 28px;
  background: $bg-card;
  border-radius: 20px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  border: 1px solid $border;

  .pagination-control {
    :deep(.q-btn) {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid $border;
      transition: all 0.3s;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
        border-color: $border-hover;
      }

      &.q-btn--active {
        background: linear-gradient(135deg, $primary, $primary-dark);
        border-color: $primary;
        box-shadow: 0 4px 12px rgba(99, 102, 241, 0.4);
      }
    }
  }

  .pagination-info {
    font-size: 14px;
    color: $text-secondary;
    display: flex;
    align-items: center;
    gap: 6px;

    .pagination-highlight {
      color: $primary-light;
      font-weight: 700;
      font-size: 16px;
    }
  }
}
</style>
