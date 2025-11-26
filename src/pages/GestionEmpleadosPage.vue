<template>
  <q-page class="gestion-empleados-page">
    <div class="page-container">
      <!-- Header -->
      <div class="page-header">
        <div class="header-content">
          <q-icon name="group" size="48px" color="primary" />
          <div class="header-text">
            <h1>Gestión de Empleados</h1>
            <p>Administra los usuarios del sistema</p>
          </div>
        </div>
        <q-btn
          @click="mostrarModalInvitacion = true"
          color="primary"
          icon="person_add"
          label="Enviar Invitación"
          unelevated
          size="lg"
          class="invite-btn"
        />
      </div>

      <!-- Filtros y Búsqueda -->
      <div class="filters-section">
        <div class="filters-container">
          <!-- Buscador -->
          <q-input
            v-model="searchTerm"
            outlined
            dense
            placeholder="Buscar por nombre o email..."
            class="search-input"
            @update:model-value="onSearchChange"
          >
            <template v-slot:prepend>
              <q-icon name="search" />
            </template>
            <template v-slot:append v-if="searchTerm">
              <q-icon name="close" @click="clearSearch" class="cursor-pointer" />
            </template>
          </q-input>

          <!-- Filtro por Rol -->
          <q-select
            v-model="selectedRole"
            :options="roleOptions"
            outlined
            dense
            label="Filtrar por rol"
            emit-value
            map-options
            clearable
            class="role-filter"
            @update:model-value="onRoleChange"
          >
            <template v-slot:prepend>
              <q-icon name="filter_list" />
            </template>
          </q-select>

          <!-- Tamaño de página -->
          <q-select
            v-model="pageSize"
            :options="pageSizeOptions"
            outlined
            dense
            label="Mostrar"
            emit-value
            map-options
            class="page-size-select"
            @update:model-value="onPageSizeChange"
          >
            <template v-slot:prepend>
              <q-icon name="view_list" />
            </template>
          </q-select>
        </div>

        <!-- Stats -->
        <div class="stats-bar">
          <q-chip icon="people" color="primary" text-color="white">
            Total: {{ totalUsers }}
          </q-chip>
          <q-chip icon="check_circle" color="positive" text-color="white">
            Activos: {{ activeUsers }}
          </q-chip>
          <q-chip v-if="selectedRole" icon="label" color="secondary" text-color="white">
            Rol: {{ selectedRole }}
          </q-chip>
        </div>
      </div>

      <!-- Loading -->
      <div v-if="loading" class="loading-container">
        <q-spinner-dots size="50px" color="primary" />
        <p>Cargando usuarios...</p>
      </div>

      <!-- Lista de Usuarios (Cards) -->
      <div v-else-if="users.length > 0" class="users-grid">
        <q-card v-for="user in users" :key="user.id" class="user-card" flat bordered>
          <q-card-section class="user-card-header">
            <div class="user-avatar">
              <q-avatar size="64px" color="primary" text-color="white">
                <span class="avatar-text">{{ getInitials(user.name) }}</span>
              </q-avatar>
              <q-badge v-if="user.status === 'active'" color="positive" floating rounded>
                <q-icon name="check" size="12px" />
              </q-badge>
              <q-badge v-else color="negative" floating rounded>
                <q-icon name="close" size="12px" />
              </q-badge>
            </div>
            <div class="user-info">
              <h3>{{ user.name }}</h3>
              <p class="user-email">{{ user.email }}</p>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-section class="user-card-body">
            <!-- Roles -->
            <div class="info-row">
              <q-icon name="badge" size="20px" color="primary" />
              <div class="info-content">
                <span class="info-label">Roles:</span>
                <div class="roles-container">
                  <q-chip
                    v-for="role in user.roles"
                    :key="role"
                    size="sm"
                    color="secondary"
                    text-color="white"
                    dense
                  >
                    {{ role }}
                  </q-chip>
                  <span v-if="!user.roles || user.roles.length === 0" class="no-roles">
                    Sin roles asignados
                  </span>
                </div>
              </div>
            </div>

            <!-- Status -->
            <div class="info-row">
              <q-icon name="info" size="20px" color="primary" />
              <div class="info-content">
                <span class="info-label">Estado:</span>
                <q-badge
                  :color="user.status === 'active' ? 'positive' : 'negative'"
                  :label="user.status === 'active' ? 'Activo' : 'Inactivo'"
                />
              </div>
            </div>

            <!-- Último Login -->
            <div class="info-row">
              <q-icon name="schedule" size="20px" color="primary" />
              <div class="info-content">
                <span class="info-label">Último acceso:</span>
                <span class="info-value">
                  {{ formatLastLogin(user.lastLoginAt) }}
                </span>
              </div>
            </div>

            <!-- Fecha de Creación -->
            <div class="info-row">
              <q-icon name="calendar_today" size="20px" color="primary" />
              <div class="info-content">
                <span class="info-label">Creado:</span>
                <span class="info-value">
                  {{ formatDate(user.createdAt) }}
                </span>
              </div>
            </div>
          </q-card-section>

          <q-separator />

          <q-card-actions class="user-card-actions">
            <q-btn
              flat
              dense
              icon="visibility"
              label="Ver Detalles"
              color="primary"
              size="sm"
              @click="verDetalles(user)"
            />
            <q-space />
            <q-btn flat dense icon="more_vert" color="grey-7" size="sm">
              <q-menu>
                <q-list>
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="edit" color="primary" />
                    </q-item-section>
                    <q-item-section>Editar</q-item-section>
                  </q-item>
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="block" color="warning" />
                    </q-item-section>
                    <q-item-section>Desactivar</q-item-section>
                  </q-item>
                  <q-separator />
                  <q-item clickable v-close-popup>
                    <q-item-section avatar>
                      <q-icon name="delete" color="negative" />
                    </q-item-section>
                    <q-item-section>Eliminar</q-item-section>
                  </q-item>
                </q-list>
              </q-menu>
            </q-btn>
          </q-card-actions>
        </q-card>
      </div>

      <!-- No hay usuarios -->
      <div v-else class="empty-state">
        <q-icon name="group_off" size="80px" color="grey-5" />
        <h3>No se encontraron usuarios</h3>
        <p>Intenta ajustar los filtros de búsqueda</p>
        <q-btn @click="resetFilters" color="primary" label="Limpiar Filtros" flat />
      </div>

      <!-- Paginación -->
      <div v-if="totalPages > 1" class="pagination-container">
        <q-pagination
          v-model="currentPage"
          :max="totalPages"
          :max-pages="7"
          direction-links
          boundary-links
          color="primary"
          @update:model-value="onPageChange"
        />
        <div class="pagination-info">
          Mostrando {{ startItem }}-{{ endItem }} de {{ totalUsers }} usuarios
        </div>
      </div>
    </div>

    <!-- Modal de Invitación -->
    <EnviarInvitacionModal
      v-model="mostrarModalInvitacion"
      :available-roles="availableRoles"
      @invitation-sent="onInvitationSent"
    />
  </q-page>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { getUsers, getAvailableRoles } from '../services/usersService.js'
import EnviarInvitacionModal from '../components/EnviarInvitacionModal.vue'

const $q = useQuasar()

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
const mostrarModalInvitacion = ref(false)

// Options
const pageSizeOptions = [
  { label: '6 por página', value: 6 },
  { label: '12 por página', value: 12 },
  { label: '24 por página', value: 24 },
  { label: '48 por página', value: 48 },
]

const roleOptions = computed(() => {
  return [
    { label: 'Todos los roles', value: null },
    ...availableRoles.value.map((role) => ({
      label: role,
      value: role,
    })),
  ]
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
      selectedRole.value
    )

    users.value = response.data || []
    totalUsers.value = response.total || 0
    totalPages.value = Math.ceil(totalUsers.value / pageSize.value)

    console.log('✅ Usuarios cargados:', users.value.length)
  } catch (error) {
    console.error('❌ Error al cargar usuarios:', error)
    $q.notify({
      type: 'negative',
      message: 'Error al cargar usuarios',
      position: 'top',
    })
  } finally {
    loading.value = false
  }
}

const fetchRoles = async () => {
  try {
    const roles = await getAvailableRoles()
    availableRoles.value = roles
    console.log('✅ Roles disponibles:', roles)
  } catch (error) {
    console.error('❌ Error al cargar roles:', error)
  }
}

const clearSearch = () => {
  searchTerm.value = ''
  fetchUsers()
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
  if (!dateString) return 'N/A'
  const date = new Date(dateString)
  return date.toLocaleDateString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

const formatLastLogin = (dateString) => {
  if (!dateString) return 'Nunca'
  const date = new Date(dateString)
  const now = new Date()
  const diff = now - date
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))

  if (days === 0) return 'Hoy'
  if (days === 1) return 'Ayer'
  if (days < 7) return `Hace ${days} días`
  if (days < 30) return `Hace ${Math.floor(days / 7)} semanas`
  return formatDate(dateString)
}

const verDetalles = (user) => {
  $q.dialog({
    title: 'Detalles del Usuario',
    message: `
      Nombre: ${user.name}
      Email: ${user.email}
      ID: ${user.id}
      Tenant: ${user.tenantId}
      Estado: ${user.status}
      Roles: ${user.roles?.join(', ') || 'Sin roles'}
    `,
    html: true,
  })
}

const onInvitationSent = () => {
  $q.notify({
    type: 'positive',
    message: '✅ Invitación enviada correctamente',
    position: 'top',
    timeout: 3000,
  })
  // Opcional: recargar usuarios
  fetchUsers()
}

// Lifecycle
onMounted(() => {
  fetchUsers()
  fetchRoles()
})
</script>

<style lang="scss" scoped>
$primary: #6366f1;
$primary-dark: #4f46e5;
$text-primary: #1e293b;
$text-secondary: #64748b;
$border-color: #e2e8f0;
$bg-light: #f8fafc;

.gestion-empleados-page {
  background: $bg-light;
  min-height: 100vh;
  padding: 24px;
}

.page-container {
  max-width: 1400px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
  flex-wrap: wrap;
  gap: 20px;

  .header-content {
    display: flex;
    align-items: center;
    gap: 20px;
  }

  .header-text {
    h1 {
      margin: 0 0 4px 0;
      font-size: 32px;
      font-weight: 700;
      color: $text-primary;
    }

    p {
      margin: 0;
      font-size: 16px;
      color: $text-secondary;
    }
  }

  .invite-btn {
    height: 48px;
    padding: 0 24px;
    font-size: 16px;
  }
}

.filters-section {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 24px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.filters-container {
  display: grid;
  grid-template-columns: 2fr 1fr 150px;
  gap: 16px;
  margin-bottom: 16px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.stats-bar {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80px 20px;
  color: $text-secondary;
}

.users-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 24px;
  margin-bottom: 32px;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
}

.user-card {
  transition: all 0.3s ease;
  border: 1px solid $border-color;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(99, 102, 241, 0.15);
  }
}

.user-card-header {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 20px;

  .user-avatar {
    position: relative;

    .avatar-text {
      font-size: 24px;
      font-weight: 600;
    }
  }

  .user-info {
    flex: 1;
    min-width: 0;

    h3 {
      margin: 0 0 4px 0;
      font-size: 18px;
      font-weight: 600;
      color: $text-primary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .user-email {
      margin: 0;
      font-size: 14px;
      color: $text-secondary;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }
}

.user-card-body {
  padding: 16px 20px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.info-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;

  .info-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .info-label {
    font-size: 13px;
    font-weight: 600;
    color: $text-secondary;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .info-value {
    font-size: 14px;
    color: $text-primary;
  }

  .roles-container {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
  }

  .no-roles {
    font-size: 14px;
    color: $text-secondary;
    font-style: italic;
  }
}

.user-card-actions {
  padding: 12px 20px;
  background: $bg-light;
}

.empty-state {
  text-align: center;
  padding: 80px 20px;
  color: $text-secondary;

  h3 {
    margin: 16px 0 8px 0;
    font-size: 24px;
    color: $text-primary;
  }

  p {
    margin: 0 0 24px 0;
    font-size: 16px;
  }
}

.pagination-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
  padding: 20px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

  .pagination-info {
    font-size: 14px;
    color: $text-secondary;
  }
}
</style>
