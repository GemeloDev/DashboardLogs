<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ENCABEZADO -->
    <q-header
      elevated
      style="background-color: #1e1e2f; color: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4)"
    >
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title>Consola Logs</q-toolbar-title>

        <!-- Información del usuario y logout -->
        <div class="row items-center q-gutter-sm">
          <q-chip
            :icon="selectedFlow === 'escritorio' ? 'desktop_windows' : 'smartphone'"
            :label="selectedFlow === 'escritorio' ? 'Escritorio' : 'Mobile'"
            outline
            color="white"
            text-color="white"
            size="sm"
          />

          <!-- Menú de usuario -->
          <q-btn-dropdown
            flat
            dense
            no-caps
            :label="userInfo.nombre"
            icon="account_circle"
            dropdown-icon="expand_more"
          >
            <q-list>
              <q-item>
                <q-item-section avatar>
                  <q-icon name="email" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption>{{ userInfo.email }}</q-item-label>
                </q-item-section>
              </q-item>

              <q-separator />

              <q-item clickable v-close-popup @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="red" />
                </q-item-section>
                <q-item-section>
                  <q-item-label>Cerrar Sesión</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>
        </div>
      </q-toolbar>
    </q-header>

    <!-- SIDEBAR ESCRITORIO -->
    <q-drawer
      v-if="selectedFlow === 'escritorio'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="500"
      class="app-drawer desktop-drawer"
      style="
        background: linear-gradient(135deg, #1e1e2f 0%, #1976d2 100%);
        box-shadow: 0 4px 24px rgba(25, 118, 210, 0.2);
        border-right: 2px solid #1976d2;
      "
    >
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item>
            <q-item-section>
              <q-btn-toggle
                v-model="selectedFlow"
                spread
                no-caps
                rounded
                unelevated
                :options="[
                  { label: 'Mobile', value: 'mobile', icon: 'smartphone' },
                  { label: 'Escritorio', value: 'escritorio', icon: 'desktop_windows' },
                ]"
                class="full-width"
              />
            </q-item-section>
          </q-item>
          <q-separator dark spaced />
          <q-item clickable v-ripple to="/logs" exact>
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Dashboard</span></q-item-section>
          </q-item>
          <template v-if="selectedFlow !== 'escritorio'">
            <q-item clickable v-ripple to="/estadisticas">
              <q-item-section avatar>
                <q-icon name="insert_chart" color="blue" />
              </q-item-section>
              <q-item-section><span style="font-weight: 600">Estadísticas</span></q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/eventos">
              <q-item-section avatar>
                <q-icon name="event" color="green" />
              </q-item-section>
              <q-item-section><span style="font-weight: 600">Eventos</span></q-item-section>
            </q-item>
            <q-item clickable v-ripple to="/eventos-fallidos">
              <q-item-section avatar>
                <q-icon name="report_problem" color="red" />
              </q-item-section>
              <q-item-section
                ><span style="font-weight: 600">Eventos Fallidos</span></q-item-section
              >
            </q-item>
          </template>
          <q-separator dark spaced />
          <q-item-label header class="text-grey-4">Herramientas</q-item-label>
          <q-item clickable v-ripple @click="showFilters = true">
            <q-item-section avatar>
              <q-icon name="filter_list" color="orange" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Filtros Avanzados</span></q-item-section>
          </q-item>
          <q-item clickable v-ripple @click="openConsole">
            <q-item-section avatar>
              <q-icon name="terminal" color="purple" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Consola</span></q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/diagnostico">
            <q-item-section avatar>
              <q-icon name="bug_report" color="red" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Diagnóstico</span></q-item-section>
          </q-item>
        </q-list>
        <div style="margin-top: 32px; text-align: center">
          <q-avatar size="64px" icon="desktop_windows" color="primary" text-color="white" />
          <div class="text-h6 q-mt-sm" style="color: #fff; font-weight: 700">
            Santoro Escritorio
          </div>
          <div class="text-caption" style="color: #cfd8dc">
            Panel avanzado para gestión de logs y eventos
          </div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- SIDEBAR MOBILE -->
    <q-drawer
      v-if="selectedFlow === 'mobile'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="220"
      :breakpoint="500"
      class="app-drawer mobile-drawer"
      style="
        background: linear-gradient(135deg, #1e1e2f 0%, #43cea2 100%);
        box-shadow: 0 4px 24px rgba(67, 206, 162, 0.2);
        border-right: 2px solid #43cea2;
      "
    >
      <q-scroll-area class="fit">
        <q-list padding class="menu-list">
          <q-item>
            <q-item-section>
              <q-btn-toggle
                v-model="selectedFlow"
                spread
                no-caps
                rounded
                unelevated
                :options="[
                  { label: 'Mobile', value: 'mobile', icon: 'smartphone' },
                  { label: 'Escritorio', value: 'escritorio', icon: 'desktop_windows' },
                ]"
                class="full-width"
              />
            </q-item-section>
          </q-item>
          <q-separator dark spaced />
          <q-item clickable v-ripple to="/logs" exact>
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Dashboard</span></q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/estadisticas">
            <q-item-section avatar>
              <q-icon name="insert_chart" color="blue" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Estadísticas</span></q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/eventos">
            <q-item-section avatar>
              <q-icon name="event" color="green" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Eventos</span></q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/eventos-fallidos">
            <q-item-section avatar>
              <q-icon name="report_problem" color="red" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Eventos Fallidos</span></q-item-section>
          </q-item>
        </q-list>
        <div style="margin-top: 32px; text-align: center">
          <q-avatar size="64px" icon="smartphone" color="primary" text-color="white" />
          <div class="text-h6 q-mt-sm" style="color: #fff; font-weight: 700">Santoro Mobile</div>
          <div class="text-caption" style="color: #cfd8dc">Panel rápido para gestión móvil</div>
        </div>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div v-if="selectedFlow === 'mobile'" class="flow-container mobile-flow">
          <router-view />
        </div>
        <div v-else class="flow-container desktop-flow">
          <q-dialog v-model="showFilters" persistent>
            <q-card style="min-width: 350px; background: #1e1e2f">
              <!-- <q-card-section>
                <div class="text-h6">Filtros Avanzados</div>
              </q-card-section> -->
              <q-card-section>
                <EscritorioFiltros @filtrar="onFiltrar" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

          <div class="row q-col-gutter-md">
            <div class="col-12">
              <EscritorioGraficasEnhanced :filtros="filtros" />
            </div>
          </div>

          <!-- Componente de consola que se abre como modal -->
          <EscritorioConsolaSimple ref="consolaRef" />

          <EscritorioDetalleModal
            :model-value="modalVisible"
            :detalle="detalleModal"
            @update:model-value="modalVisible = $event"
          />
        </div>
      </transition>
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import EscritorioFiltros from '../components/escritorio/EscritorioFiltros.vue'
import EscritorioGraficasEnhanced from '../components/escritorio/EscritorioGraficasEnhanced.vue'
import EscritorioConsolaSimple from '../components/escritorio/EscritorioConsolaSimple.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)
const selectedFlow = ref('mobile')
const filtros = ref({})
const modalVisible = ref(false)
const detalleModal = ref(null)
const showFilters = ref(false)
const consolaRef = ref(null)

// Información del usuario
const userInfo = ref({
  nombre: 'Usuario',
  email: 'usuario@ejemplo.com',
})

// Observar cambios en el flujo seleccionado
watch(selectedFlow, (newFlow) => {
  const message = newFlow === 'mobile' ? 'Cambiado a vista móvil' : 'Cambiado a vista de escritorio'

  $q.notify({
    message,
    color: 'info',
    icon: newFlow === 'mobile' ? 'smartphone' : 'desktop_windows',
  })
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onFiltrar(val) {
  filtros.value = val
  showFilters.value = false
  $q.notify({
    message: 'Filtros aplicados',
    color: 'positive',
  })
}

function openConsole() {
  if (consolaRef.value && consolaRef.value.abrirConsolaDirecta) {
    consolaRef.value.abrirConsolaDirecta()

    $q.notify({
      message: 'Abriendo consola de logs...',
      color: 'info',
      icon: 'terminal',
      position: 'top-right',
      timeout: 2000,
    })
  }
}

// Función para cargar información del usuario
const loadUserInfo = () => {
  try {
    const sessionData =
      localStorage.getItem('dashboardLogsSession') || sessionStorage.getItem('dashboardLogsSession')

    if (sessionData) {
      const session = JSON.parse(sessionData)
      if (session.user) {
        userInfo.value = {
          nombre: session.user.nombre || 'Usuario',
          email: session.user.email || 'usuario@ejemplo.com',
        }
      }
    }
  } catch (error) {
    console.error('Error cargando información del usuario:', error)
  }
}

// Función para cerrar sesión
const logout = () => {
  try {
    if (!$q.dialog) {
      console.error('Dialog plugin no está disponible')
      // Fallback: cerrar sesión directamente
      cerrarSesionDirectamente()
      return
    }

    $q.dialog({
      title: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      cancel: true,
      persistent: true,
    })
      .onOk(() => {
        cerrarSesionDirectamente()
      })
      .onCancel(() => {
        console.log('Logout cancelado')
      })
  } catch (error) {
    console.error('Error en logout:', error)
    cerrarSesionDirectamente()
  }
}

// Función auxiliar para cerrar sesión
const cerrarSesionDirectamente = () => {
  try {
    // Limpiar sesión
    localStorage.removeItem('dashboardLogsSession')
    sessionStorage.removeItem('dashboardLogsSession')

    // Mostrar notificación
    $q.notify({
      type: 'positive',
      message: 'Sesión cerrada exitosamente',
      position: 'top',
    })

    // Redirigir al login
    router.push('/login')
  } catch (error) {
    console.error('Error al cerrar sesión:', error)
    // Forzar redirección aunque haya error
    window.location.href = '/login'
  }
}

// Cargar información del usuario al montar
onMounted(() => {
  loadUserInfo()
})
</script>

<style lang="scss">
.app-drawer {
  background-color: #121826;

  .menu-list {
    .q-item {
      min-height: 48px;
      padding: 8px 16px;
      color: #fff;
      border-radius: 8px;
      margin: 4px 8px;

      &:hover {
        background: rgba(255, 255, 255, 0.1);
      }

      &.q-router-link-active {
        background: #1976d2;

        .q-icon {
          color: #fff;
        }
      }
    }

    .q-icon {
      font-size: 24px;
      color: #9e9e9e;
    }
  }
}

.flow-container {
  min-height: 100vh;
  padding: 16px;
  background: #121826;

  &.desktop-flow {
    .q-card {
      background: #1e1e2f;
      color: white;
      border-radius: 12px;
      margin-bottom: 16px;

      .text-h6 {
        color: #fff;
      }
    }
  }
}

// Animaciones
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
  }
  to {
    opacity: 0;
  }
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}
</style>
