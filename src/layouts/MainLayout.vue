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

        <!-- Botones de herramientas rápidas -->
        <div class="row items-center q-gutter-x-sm mobile-scroll-row">
          <!-- Botón de filtros avanzados -->
          <q-btn
            v-if="currentFlow !== 'escritorio' && $q.platform.is.mobile"
            flat
            dense
            round
            icon="security"
            color="green"
            @click="toogleStartSession"
          >
            <q-tooltip>Sesiones</q-tooltip>
          </q-btn>

          <!-- Botón de filtros avanzados -->
          <q-btn flat dense round icon="filter_list" color="green" @click="toggleDinamicFilters">
            <q-tooltip>Filtros Avanzados</q-tooltip>
          </q-btn>

          <!-- Botón de consola -->
          <q-btn flat dense round icon="terminal" color="purple" @click="openConsole">
            <q-tooltip>Consola de Logs</q-tooltip>
          </q-btn>

          <!-- Botón de gestión de empleados (solo admin) -->
          <q-btn
            v-if="isAdmin"
            flat
            dense
            round
            icon="group"
            color="cyan"
            @click="router.push('/gestion-empleados')"
            class="q-mr-sm"
          >
            <q-tooltip>Gestionar Empleados</q-tooltip>
          </q-btn>

          <q-btn-dropdown
            :label="selectedSystem"
            outline
            color="black"
            text-color="white"
            size="sm"
            rounded
          >
            <q-list>
              <q-item
                v-for="system in systems"
                :key="system"
                clickable
                @click="selectedSystem = system"
                v-close-popup
              >
                <q-item-section>
                  <q-item-label>{{ system }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Menú de usuario -->
          <q-btn-dropdown
            flat
            dense
            no-caps
            :label="$q.screen.gt.xs ? userInfo.nombre : ''"
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

      <!-- Panel de filtros expandible -->
      <q-slide-transition>
        <QRScannerModal v-model="showSessionQR" @qr-scanned="handleQRScanned" />
      </q-slide-transition>

      <!-- Panel de filtros expandible -->
      <q-slide-transition>
        <DinamicFilters v-show="showDinamicFilters" @campos-seleccionados="onFiltrar" />
      </q-slide-transition>
    </q-header>

    <!-- SIDEBAR ESCRITORIO -->
    <q-drawer
      v-if="currentFlow === 'escritorio'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="280"
      :breakpoint="1800"
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
                :model-value="currentFlow"
                @update:model-value="cambiarFlujo"
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
          <q-item clickable v-ripple to="/escritorio" exact>
            <q-item-section avatar>
              <q-icon name="dashboard" color="primary" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Dashboard</span></q-item-section>
          </q-item>
          <q-separator dark spaced />
          <q-item-label header class="text-grey-4">Herramientas</q-item-label>
          <q-item clickable v-ripple to="/diagnostico">
            <q-item-section avatar>
              <q-icon name="bug_report" color="red" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Diagnóstico</span></q-item-section>
          </q-item>
          <q-item clickable v-ripple to="/myApiKeys">
            <q-item-section avatar>
              <q-icon name="key" color="cyan" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Mis API Key's</span></q-item-section>
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
      v-if="currentFlow === 'mobile'"
      v-model="leftDrawerOpen"
      show-if-above
      bordered
      :width="220"
      :breakpoint="1440"
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
                :model-value="currentFlow"
                @update:model-value="cambiarFlujo"
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
          <q-item clickable v-ripple to="/mobile" exact>
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
        <div class="flow-container" style="min-height: 100vh">
          <router-view />

          <!-- Componentes globales accesibles desde cualquier página -->
          <EscritorioConsolaSimple ref="consolaRef" />

          <EscritorioDetalleModal
            :model-value="modalVisible"
            :detalle="detalleModal"
            @update:model-value="modalVisible = $event"
          />
        </div>
      </transition>
    </q-page-container>

    <!-- 🤖 SANTORO IA ASSISTANT - Chat Flotante Global -->
    <SantoroChat />

    <!-- 🔧 MODAL DE CONFIGURACIÓN GEMINI AI -->
    <GeminiConfigModal
      ref="geminiConfigRef"
      id="gemini-config"
      @configurado="onGeminiConfigurado"
    />
  </q-layout>
</template>

<script setup>
import { ref, provide, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import SantoroChat from '../components/SantoroChat.vue'
import GeminiConfigModal from '../components/GeminiConfigModal.vue'
import EscritorioConsolaSimple from '../components/escritorio/EscritorioConsolaSimple.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'
import authService from '../services/authService.js'
import { santoroContextService } from '../services/santoroContextService.js'
import QRScannerModal from 'src/components/QRScannerModal.vue'
import DinamicFilters from 'src/components/blocks/DinamicFilters.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const leftDrawerOpen = ref(false)
const filtros = ref({
  //  Sistema que actualmente esta en flujo
  system: '',
  //  Campos que actualmente están activos
  fields: {
    // status: ['SUCCESS']
  },
})
const modalVisible = ref(false)
const detalleModal = ref(null)
const showSessionQR = ref(false)
const showDinamicFilters = ref(false)
const consolaRef = ref(null)
const geminiConfigRef = ref(null)

// Estado del flujo guardado en localStorage
const savedFlow = ref(JSON.parse(localStorage.getItem('dashboardFlow'))[0] || 'escritorio')
const systems = ref(
  JSON.parse(localStorage.getItem('dashboardLogsSession'))?.user?.authz?.systems || [],
)
const selectedSystem = ref(JSON.parse(localStorage.getItem('dashboardFlow'))[1] || 'DASHBOARD')

// Computed para obtener el flujo actual desde la ruta
const currentFlow = computed(() => {
  // Priorizar el meta.flow de la ruta si existe (rutas específicas)
  if (route.meta?.flow) {
    return route.meta.flow
  }

  // Para rutas sin meta.flow, usar el flujo guardado
  return savedFlow.value
})

// Watcher para guardar cambios de flujo
watch([currentFlow, selectedSystem], (newFlow) => {
  if (route.meta?.flow) {
    // Si la ruta tiene meta.flow específico, guardarlo como preferencia
    savedFlow.value = newFlow
    localStorage.setItem(
      'dashboardFlow',
      JSON.stringify( newFlow || [currentFlow.value, selectedSystem.value] ),
    )
  }
})

// Proporcionar el estado del flujo a los componentes hijos
provide('selectedFlow', currentFlow)
provide('selectedSystem', selectedSystem)
provide('filtrosGlobales', filtros)

// Servicio de autenticación ya importado

// Información del usuario reactiva desde el servicio de autenticación
const userInfo = computed(() => ({
  nombre: authService.user?.name || 'Usuario',
  email: authService.user?.email || 'Sin email',
  roles: authService.user?.roles || [],
}))

// Verificar si el usuario es admin
const isAdmin = computed(() => {
  return userInfo.value.roles.includes('ORG_ADMIN')
})

// Función para cambiar de flujo mediante rutas
const cambiarFlujo = (nuevoFlujo) => {
  // Guardar la nueva preferencia de flujo
  savedFlow.value = nuevoFlujo
  localStorage.setItem('dashboardFlow', { nuevoFlujo, selectedSystem })

  let rutaDestino

  // Lógica inteligente para mantener la página actual cuando sea posible
  if (nuevoFlujo === 'mobile') {
    // Para flujo móvil: ir a la ruta específica móvil
    rutaDestino = '/mobile'
  } else {
    // Para flujo escritorio: ir a la ruta específica escritorio
    rutaDestino = '/escritorio'
  }

  router.push(rutaDestino)

  const message =
    nuevoFlujo === 'mobile' ? 'Cambiado a vista móvil' : 'Cambiado a vista de escritorio'

  $q.notify({
    message,
    color: 'info',
    icon: nuevoFlujo === 'mobile' ? 'smartphone' : 'desktop_windows',
  })

  // Emitir evento personalizado para comunicar el cambio a componentes hijos
  window.dispatchEvent(new CustomEvent('cambiar-flujo', { detail: nuevoFlujo }))

  // Actualizar contexto de Santoro
  santoroContextService.cambiarFlujo(nuevoFlujo)
}

// Observar cambios en la ruta para notificar cambios de flujo
watch(
  () => route.path,
  (newPath) => {
    const flujo = newPath.includes('/mobile') ? 'mobile' : 'escritorio'
    santoroContextService.cambiarFlujo(flujo)
  },
  { immediate: true },
)

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toogleStartSession() {
  showSessionQR.value = !showSessionQR.value
}

function toggleDinamicFilters() {
  showDinamicFilters.value = !showDinamicFilters.value
}

async function onFiltrar(fields) {
  const buildFiltros = {
    system: selectedSystem.value,
    fields,
  }

  filtros.value = buildFiltros
  console.log('🔄 MainLayout: Aplicando filtros:', buildFiltros)

  // Emitir evento para que las gráficas escuchen los cambios
  window.dispatchEvent(new CustomEvent('filtros-aplicados', { detail: fields }))

  $q.notify({
    message: '🔍 Filtros aplicados correctamente',
    color: 'positive',
    icon: 'filter_list',
    position: 'top-right',
  })

  showDinamicFilters.value = false
}

function onGeminiConfigurado() {
  console.log('✅ Gemini configurado desde MainLayout')
}

// Funciones para modales
function openConsole() {
  if (consolaRef.value && consolaRef.value.abrirConsola) {
    consolaRef.value.abrirConsola()
    console.log('✅ Consola abierta correctamente')
  } else {
    console.warn('❌ Referencia de consola no disponible:', consolaRef.value)

    $q.notify({
      message: '❌ Error al abrir la consola. Referencia no disponible.',
      color: 'negative',
      icon: 'error',
    })
  }
}

function logout() {
  // Usar el servicio de autenticación para hacer logout
  const result = authService.logout()

  if (result.success) {
    $q.notify({
      message: '👋 Sesión cerrada correctamente',
      color: 'positive',
      icon: 'logout',
      position: 'top',
    })

    // Redirigir al login
    router.push('/login')
  } else {
    $q.notify({
      message: '❌ Error al cerrar sesión',
      color: 'negative',
      icon: 'error',
      position: 'top',
    })
  }
}

// Eventos del asistente Santoro
onMounted(() => {
  // Configurar flujo inicial desde localStorage o por defecto
  const savedFlow = localStorage.getItem('selectedFlow')
  const initialFlow =
    savedFlow && ['mobile', 'escritorio'].includes(savedFlow) ? savedFlow : 'escritorio'

  // Si estamos en la ruta raíz, redirigir al flujo inicial
  if (route.path === '/' || route.path === '/dashboard' || route.path === '/logs') {
    router.push(`/${initialFlow}`)
  }

  // Escuchar eventos del asistente para cambio de flujo
  window.addEventListener('santoro-cambiar-flujo', (event) => {
    const { flujo } = event.detail
    cambiarFlujo(flujo)
  })

  // Otros eventos del asistente...
  window.addEventListener('santoro-abrir-consola', () => {
    openConsole()
  })

  window.addEventListener('santoro-mostrar-filtros', () => {
    showDinamicFilters.value = true
  })
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

.filters-panel {
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
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

/* Aplicar solo en pantallas móviles (punto de quiebre xs de Quasar < 600px) */
@media (max-width: 599px) {
  .mobile-scroll-row {
    /* Fuerza a los items a quedarse en una sola línea */
    flex-wrap: nowrap !important;

    /* Habilita el scroll horizontal */
    overflow-x: auto;

    /* Habilita el "momentum scrolling" suave en iOS */
    -webkit-overflow-scrolling: touch;

    /* Opcional: Asegura que el contenido no se corte por el gutter */
    padding-left: 8px;
    padding-right: 8px;
  }

  /* Opcional: Ocultar la barra de scroll visualmente pero mantener la función */
  .mobile-scroll-row::-webkit-scrollbar {
    display: none;
  }
  .mobile-scroll-row {
    -ms-overflow-style: none; /* IE and Edge */
    scrollbar-width: none; /* Firefox */
  }
}

/* Scrollbar vertical u horizontal completo */
::-webkit-scrollbar {
  width: 3px; /* ancho de la barra (barStyle width) */
  height: 9px; /* alto si es horizontal */
}

/* Track: fondo de la barra */
::-webkit-scrollbar-track {
  background-color: #027be3; /* barStyle backgroundColor */
  border-radius: 9px; /* barStyle borderRadius */
  opacity: 0.2; /* barStyle opacity */
}

/* Thumb: la parte que se mueve */
::-webkit-scrollbar-thumb {
  background-color: #002c53; /* thumbStyle backgroundColor */
  border-radius: 5px; /* thumbStyle borderRadius */
  width: 5px; /* thumbStyle width (opcional, se suele controlar con scrollbar) */
  opacity: 0.75; /* thumbStyle opacity */
}

/* Thumb al hacer hover */
::-webkit-scrollbar-thumb:hover {
  background-color: #004883; /* color más oscuro para hover */
}
</style>
