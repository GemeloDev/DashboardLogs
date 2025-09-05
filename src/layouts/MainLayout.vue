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
        <div class="flow-container" style="min-height: 100vh">
          <router-view />

          <!-- Diálogo global de filtros (se mantiene para rutas que lo usen) -->
          <q-dialog v-model="showFilters" persistent>
            <q-card style="min-width: 350px; background: #1e1e2f">
              <q-card-section>
                <EscritorioFiltros @filtrar="onFiltrar" />
              </q-card-section>
              <q-card-actions align="right">
                <q-btn flat label="Cerrar" color="primary" v-close-popup />
              </q-card-actions>
            </q-card>
          </q-dialog>

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
import { ref, watch, onMounted, provide } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter } from 'vue-router'
import EscritorioFiltros from '../components/escritorio/EscritorioFiltros.vue'
import EscritorioConsolaSimple from '../components/escritorio/EscritorioConsolaSimple.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'
import SantoroChat from '../components/SantoroChat.vue'
import GeminiConfigModal from '../components/GeminiConfigModal.vue'
import { santoroContextService } from '../services/santoroContextService.js'

const $q = useQuasar()
const router = useRouter()
const leftDrawerOpen = ref(false)
const selectedFlow = ref('mobile')
const filtros = ref({})
const modalVisible = ref(false)
const detalleModal = ref(null)
const showFilters = ref(false)
const consolaRef = ref(null)
const geminiConfigRef = ref(null)

// Proporcionar el estado del flujo a los componentes hijos
provide('selectedFlow', selectedFlow)
provide('filtrosGlobales', filtros)

// Información del usuario
const userInfo = ref({
  nombre: 'Usuario',
  email: 'usuario@ejemplo.com',
})

// Observar cambios en el flujo seleccionado
watch(selectedFlow, (newFlow, oldFlow) => {
  if (newFlow !== oldFlow) {
    const message =
      newFlow === 'mobile' ? 'Cambiado a vista móvil' : 'Cambiado a vista de escritorio'

    $q.notify({
      message,
      color: 'info',
      icon: newFlow === 'mobile' ? 'smartphone' : 'desktop_windows',
    })

    // Emitir evento personalizado para comunicar el cambio a componentes hijos
    window.dispatchEvent(new CustomEvent('cambiar-flujo', { detail: newFlow }))

    // También actualizar el localStorage para persistencia
    localStorage.setItem('selectedFlow', newFlow)
  }
})

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function onFiltrar(val) {
  console.log('🔄 MainLayout: Aplicando filtros:', val)
  filtros.value = val
  console.log('📋 MainLayout: Filtros globales actualizados:', filtros.value)
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

// Función para manejar la configuración de Gemini AI
const onGeminiConfigurado = (evento) => {
  console.log('🤖 Gemini configurado:', evento)

  if (evento.desconectado) {
    $q.notify({
      type: 'info',
      message: 'Gemini AI desconectado',
      position: 'top',
    })
  } else if (evento.resultado && evento.resultado.exito) {
    $q.notify({
      type: 'positive',
      message: 'Gemini AI configurado correctamente. Chat mejorado disponible.',
      position: 'top',
    })
  }
}

// Cargar información del usuario al montar
onMounted(async () => {
  loadUserInfo()

  // Cargar el flujo seleccionado desde localStorage
  const savedFlow = localStorage.getItem('selectedFlow')
  if (savedFlow && (savedFlow === 'mobile' || savedFlow === 'escritorio')) {
    selectedFlow.value = savedFlow
  }

  // 🧠 INICIALIZAR servicio de contexto
  console.log('🚀 Inicializando servicio de contexto...')

  // Configurar callback para cambios de flujo
  santoroContextService.registrarCallback('cambio_flujo', (datos) => {
    console.log('📱 Flujo cambiado desde contexto:', datos)
  })

  // Configurar callback para cambios de ruta
  santoroContextService.registrarCallback('cambio_ruta', (datos) => {
    console.log('🧭 Ruta cambiada desde contexto:', datos)
  })

  // Actualizar contexto inicial
  santoroContextService.cambiarFlujo(selectedFlow.value)
  santoroContextService.actualizarContextoRuta()

  // Configurar eventos globales para modales
  window.addEventListener('santoro-abrir-gemini-config', () => {
    if (geminiConfigRef.value) {
      geminiConfigRef.value.abrir()
    }
  })

  // Configurar eventos de navegación
  window.addEventListener('santoro-navegar', (event) => {
    const { ruta, parametros } = event.detail
    console.log('🧭 Navegando a:', ruta, parametros)

    router.push(ruta).catch((err) => {
      console.error('Error navegando a', ruta, err)
      $q.notify({
        type: 'negative',
        message: `Error navegando a ${ruta}`,
        position: 'top-right',
      })
    })
  })

  // Configurar evento para abrir consola
  window.addEventListener('santoro-abrir-consola', () => {
    console.log('🖥️ Abriendo consola de logs...')
    openConsole()
  })

  // Configurar evento para cambiar flujo
  window.addEventListener('santoro-cambiar-flujo', (event) => {
    const { flujo } = event.detail
    console.log('🔄 Cambiando flujo a:', flujo)

    if (flujo === 'escritorio' || flujo === 'mobile') {
      selectedFlow.value = flujo
      $q.notify({
        type: 'positive',
        message: `Cambiado a flujo ${flujo === 'escritorio' ? 'de escritorio' : 'móvil'}`,
        icon: flujo === 'escritorio' ? 'desktop_windows' : 'smartphone',
        position: 'top-right',
      })
    }
  })

  // Configurar evento para aplicar filtros
  window.addEventListener('santoro-aplicar-filtro', (event) => {
    const { tipo } = event.detail
    console.log('🏷️ Aplicando filtro:', tipo)

    let mensaje = 'Filtro aplicado'
    let icon = 'filter_list'

    if (tipo === 'fecha') {
      showFilters.value = true
      mensaje = 'Abriendo filtros de fecha'
      icon = 'date_range'
    } else if (tipo === 'limpiar') {
      filtros.value = {}
      mensaje = 'Filtros limpiados'
      icon = 'clear'
      // Emitir evento para que los componentes hijos actualicen
      window.dispatchEvent(new CustomEvent('limpiar-filtros'))
    } else if (tipo === 'errores') {
      filtros.value = { ...filtros.value, nivel: 'ERROR' }
      mensaje = 'Mostrando solo errores'
      icon = 'error'
      // Emitir evento con los nuevos filtros
      window.dispatchEvent(new CustomEvent('filtros-aplicados', { detail: filtros.value }))
    }

    $q.notify({
      type: 'positive',
      message: mensaje,
      icon: icon,
      position: 'top-right',
    })
  })

  // Configurar notificaciones para los controladores
  try {
    const { santoroModalController } = await import('src/services/santoroModalControllerSimple.js')
    const { santoroActionController } = await import('src/services/santoroActionController.js')

    // Configurar notificaciones
    santoroModalController.configurarNotificaciones((notification) => {
      $q.notify(notification)
    })

    santoroActionController.configurarNotificaciones((notification) => {
      $q.notify(notification)
    })

    console.log('🔔 Notificaciones configuradas para controladores')
  } catch (error) {
    console.error('Error configurando notificaciones:', error)
  }
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
