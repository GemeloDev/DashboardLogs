<template>
  <q-layout view="lHh Lpr lFf">
    <!-- ENCABEZADO -->
    <q-header
      elevated
      style="background-color: #1e1e2f; color: white; box-shadow: 0 2px 8px rgba(0, 0, 0, 0.4)"
    >
      <q-toolbar>
        <q-btn flat dense round icon="menu" aria-label="Menu" @click="toggleLeftDrawer" />
        <q-toolbar-title v-if="!$q.platform.is.mobile">Consola Logs</q-toolbar-title>

        <!-- Botones de herramientas rápidas -->
        <div class="row items-center q-gutter-x-sm mobile-scroll-row">
          <!-- (Opcional) QR Sesiones: lo dejo solo si estás en móvil por plataforma, ya NO por flow -->
          <q-btn
            v-if="$q.platform.is.mobile"
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

          <!-- Notificaciones sobre API Keys -->
          <q-btn
            v-can="{ any: ['USERS_MANAGE'] }"
            flat
            dense
            round
            icon="notifications"
            size="sm"
            color="white"
          >
            <q-badge color="red" floating v-if="apiKeysPorExpirar.length > 0">
              {{ apiKeysPorExpirar.length }}
            </q-badge>

            <q-menu
              fit
              anchor="bottom left"
              self="top left"
              class="bg-dark text-white"
              style="max-width: 350px"
            >
              <q-list style="min-width: 300px">
                <q-item-label header class="text-grey-4 text-weight-bold">
                  Alertas de API Keys
                </q-item-label>

                <q-separator color="grey-8" />

                <div v-if="apiKeysPorExpirar.length === 0" class="q-pa-md text-center text-grey">
                  <q-icon name="check_circle" color="green" size="md" />
                  <div class="q-mt-xs">Todo en orden</div>
                </div>

                <q-item
                  v-for="key in apiKeysPorExpirar"
                  :key="key.id"
                  clickable
                  v-close-popup
                  @click="router.push('/myApiKeys')"
                >
                  <q-item-section avatar>
                    <q-icon name="warning" :color="key.tipoAlerta === 'ROTA' ? 'orange' : 'red'" />
                  </q-item-section>
                  <q-item-section>
                    <q-item-label class="text-weight-bold">{{ key.name }}</q-item-label>
                    <q-item-label caption class="text-grey-5">
                      <template v-if="key.tipoAlerta === 'ROTA'">
                        {{ key.diasParaRotar }} día(s) para renovar.
                      </template>
                      <template v-else> Expira en {{ key.diasParaExpirar }} días </template>
                    </q-item-label>
                  </q-item-section>
                  <q-item-section side top>
                    <q-badge
                      :color="key.tipoAlerta === 'ROTA' ? 'orange' : 'negative'"
                      :label="key.tipoAlerta === 'ROTA' ? 'Renovar' : 'Expira'"
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
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

      <!-- Panel QR Sesiones -->
      <q-slide-transition>
        <QRScannerModal v-model="showSessionQR" @qr-scanned="handleQRScanned" />
      </q-slide-transition>

      <!-- Modal TOP: Filtros avanzados -->
      <q-dialog
        v-model="showDinamicFilters"
        position="top"
        transition-show="slide-down"
        transition-hide="slide-up"
      >
        <!-- Wrapper para controlar ancho/alto y scroll -->
        <div
          class="q-pa-sm"
          style="max-width: min(1800px, 99vw); max-height: calc(100vh - 80px); overflow: auto"
        >
          <DinamicFilters :auto-emit-on-mounted="false" @camposSeleccionados="onFiltrar" />
        </div>
      </q-dialog>
    </q-header>

    <!-- SIDEBAR ESCRITORIO (ÚNICO) -->
    <q-drawer
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
        <div style="margin-top: 32px; text-align: center">
          <q-avatar size="64px" icon="hive" color="primary" text-color="white" />
          <div class="text-h6 q-mt-sm" style="color: #fff; font-weight: 700">Consola Logs</div>
          <div class="text-caption q-px-md" style="color: #cfd8dc">
            Panel avanzado para gestión de logs y eventos
          </div>
        </div>
        <q-list padding class="menu-list">
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

          <q-item v-can="'SETTINGS_MANAGE'" v-if="isAdmin" clickable v-ripple to="/myApiKeys">
            <q-item-section avatar>
              <q-icon name="key" color="cyan" />
            </q-item-section>
            <q-item-section><span style="font-weight: 600">Mis API Key's</span></q-item-section>
          </q-item>

          <q-item v-can="'USERS_MANAGE'" v-if="isAdmin" clickable v-ripple to="/gestion-empleados">
            <q-item-section avatar>
              <q-icon name="group" color="amber" />
            </q-item-section>
            <q-item-section>
              <span style="font-weight: 600">Gestión Empleados</span>
            </q-item-section>
          </q-item>
        </q-list>
      </q-scroll-area>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container>
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div style="min-height: 100vh">
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
    <router-view />

    <EvaFloatingButton />
    <EvaWidget />
    <EvaWorkspace />
  </q-layout>
</template>

<script setup>
import { ref, provide, onMounted, computed, watch } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

// Importanto la IA
import EvaFloatingButton from 'src/components/ai/EvaFloatingButton.vue'
import EvaWidget from 'src/components/ai/EvaWidget.vue'

import EscritorioConsolaSimple from '../components/escritorio/EscritorioConsolaSimple.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'
import authService from '../services/authService.js'
import QRScannerModal from 'src/components/QRScannerModal.vue'
import DinamicFilters from 'src/components/blocks/DinamicFilters.vue'
import { ApiKeyService } from 'src/services/apiKeys'
import { ChartDataService } from 'src/services/chartDataService'
import EvaWorkspace from 'src/components/ai/EvaWorkspace.vue'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()

const leftDrawerOpen = ref(false)
const modalVisible = ref(false)
const detalleModal = ref(null)
const showSessionQR = ref(false)
const showDinamicFilters = ref(false)
const consolaRef = ref(null)

const apiKeysPorExpirar = ref([])
const prefs = authService.loadPrefs()

const systems = ref(JSON.parse(localStorage.getItem('dashboardLogsSession')).user.authz.systems)
const selectedSystem = ref(prefs.system)

const logsGlobales = ref([])
const MS_DIA = 1000 * 60 * 60 * 24

const filtros = ref({
  system: '',
  rangoFechas: { from: '', to: '' },
  busqueda: '',
  visibleFields: [],
  values: {},
})

// Info usuario
const userInfo = computed(() => ({
  nombre: authService.user?.name || 'Usuario',
  email: authService.user?.email || 'Sin email',
  roles: authService.user?.authz?.roles || [],
}))

const eventosRaw = ref([]) // lo que llega del backend (ya filtrado por system)
const loadingLogs = ref(false) // puedes mantener el mismo nombre


provide('logsGlobales', logsGlobales)
provide('filtrosGlobales', filtros)
provide('openConsole', openConsole)
provide('loadingLogs', loadingLogs)

const aplicarFiltroRangoFechas = () => {
  const r = filtros.value?.rangoFechas || {}
  const from = r.from || ''
  const to = r.to || ''

  if (!from && !to) {
    logsGlobales.value = eventosRaw.value
    return
  }

  const startStr = from || to
  const endStr = to || from

  const startMs = Date.parse(`${startStr}T00:00:00.000Z`)
  const endMs = Date.parse(`${endStr}T23:59:59.999Z`)

  logsGlobales.value = eventosRaw.value.filter((e) => {
    const t = new Date(e?.eventTime || e?.fechaHoraDia || '').getTime()
    if (!Number.isFinite(t)) return false
    return t >= startMs && t <= endMs
  })
}

const cargarEventosDelSistema = async () => {
  loadingLogs.value = true
  try {
    const resp = await ChartDataService.getLogsEvents({
      system: selectedSystem.value,
      page: 0,
      size: 10000, // tamaño recomendable
    })

    eventosRaw.value = resp?.items || []
    aplicarFiltroRangoFechas()
  } catch (e) {
    console.error('❌ Error al cargar eventos: ', e)
    eventosRaw.value = []
    logsGlobales.value = []
  } finally {
    loadingLogs.value = false
  }
}

const isAdmin = computed(() => {
  return userInfo.value.roles.includes('ORG_ADMIN') || userInfo.value.roles.includes('ORG_OWNER')
})

const diffDias = (fechaISO, hoy) => {
  if (!fechaISO) return null
  const ms = new Date(fechaISO).getTime() - hoy.getTime()
  if (!Number.isFinite(ms)) return null
  return Math.ceil(ms / MS_DIA)
}

const checkApiKeysExpirations = async () => {
  try {
    const response = await ApiKeyService.getAll()
    const listaKeys = response.data.items || []
    const hoy = new Date()
    const diasLimite = 7

    apiKeysPorExpirar.value = listaKeys
      .map((key) => {
        const status = String(key.status || '').toLowerCase()

        const diasParaRotar = diffDias(key.rotatesAt, hoy)
        const diasParaExpirar = diffDias(key.expiresAt, hoy)

        const expirada = diasParaExpirar !== null && diasParaExpirar < 0
        const esBloqueada = ['revoked', 'disabled', 'blocked', 'inactive'].includes(status)

        const requiereRotacion =
          !expirada &&
          !esBloqueada &&
          diasParaRotar !== null &&
          diasParaRotar >= 0 &&
          diasParaRotar <= diasLimite

        const expiraPronto =
          !esBloqueada &&
          diasParaExpirar !== null &&
          diasParaExpirar >= 0 &&
          diasParaExpirar <= diasLimite

        let tipoAlerta = null
        let diasRestantes = null

        if (requiereRotacion) {
          tipoAlerta = 'ROTA'
          diasRestantes = diasParaRotar
        } else if (expiraPronto) {
          tipoAlerta = 'EXPIRA'
          diasRestantes = diasParaExpirar
        }

        return {
          ...key,
          diasParaRotar,
          diasParaExpirar,
          tipoAlerta,
          diasRestantes,
        }
      })
      .filter((key) => key.tipoAlerta !== null)
      .sort((a, b) => a.diasRestantes - b.diasRestantes)

    if (apiKeysPorExpirar.value.length) {
      $q.notify({
        message: '🚨 Tienes notificaciones nuevas sobre tus API Keys!',
        color: 'yellow',
        textColor: 'black',
        position: $q.platform.is.mobile ? 'bottom' : 'top',
      })
    }
  } catch (error) {
    console.error('Error verificando expiraciones:', error)
  }
}

const handleQRScanned = (payload) => {
  console.log('📷 QR Scanned:', payload)
  showSessionQR.value = false
  $q.notify({
    message: '✅ Inicio de Sesión por QR realizado!',
    position: 'bottom',
    color: 'green',
  })
}

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value
}

function toogleStartSession() {
  showSessionQR.value = !showSessionQR.value
}

function toggleDinamicFilters() {
  showDinamicFilters.value = !showDinamicFilters.value
}

async function onFiltrar(payload) {
  loadingLogs.value = true
  const {
    _visibleFields = [],
    busqueda = '',
    rangoFechas = { from: '', to: '' },
    ...rest
  } = payload

  filtros.value = {
    ...filtros.value,
    busqueda,
    rangoFechas,
    visibleFields: _visibleFields,
    values: rest,
  }

  $q.notify({
    message: '🔍 Filtros aplicados correctamente',
    color: 'positive',
    icon: 'filter_list',
    position: $q.platform.is.mobile ? 'bottom' : 'top',
  })

  showDinamicFilters.value = false
}

function openConsole(selection = null) {
  if (!consolaRef.value?.abrirConsola) {
    $q.notify({ message: '❌ Error al abrir consola', color: 'negative' })
    return
  }

  // ✅ NUEVO: dataGrafica + selections (para que se vea el valor en los selects)
  if (selection?.dataGrafica && Array.isArray(selection.dataGrafica) && Array.isArray(selection.selections)) {
    consolaRef.value.abrirConsolaConDataYFiltros?.(selection.dataGrafica, selection.selections)
    return
  }

  // ✅ DATA + filtros (ideal para clicks en gráficas)
  if (selection?.dataGrafica && Array.isArray(selection.dataGrafica) && selection?.selections) {
    consolaRef.value.abrirConsolaConDataYFiltros?.(selection.dataGrafica, selection.selections)
    return
  }

  // ✅ Solo dataGrafica
  if (selection?.dataGrafica && Array.isArray(selection.dataGrafica)) {
    consolaRef.value.abrirConsola(selection.dataGrafica)
    return
  }

  // ✅ MULTI filtros
  if (Array.isArray(selection) && selection.length) {
    consolaRef.value.abrirConsolaConFiltros?.(selection)
    return
  }

  // ✅ SINGLE filtro
  if (selection?.fieldKey) {
    consolaRef.value.abrirConsolaConFiltro?.(selection.fieldKey, selection.value)
    return
  }

  // ✅ normal
  consolaRef.value.abrirConsola()
}

function logout() {
  const result = authService.logout()

  if (result.success) {
    $q.notify({
      message: '👋 Sesión cerrada correctamente',
      color: 'positive',
      icon: 'logout',
      position: 'top',
    })
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

// 1) Cuando cambia system: NO pega al backend, solo refiltra logsRango
watch(
  selectedSystem,
  (sys) => {
    filtros.value.system = sys
    authService.savePrefs(prefs.flow, sys)
    cargarEventosDelSistema()
  },
  { immediate: true },
)

// 2) Cuando cambia rango: SÍ pega al backend
watch(
  () => `${filtros.value.rangoFechas?.from || ''}|${filtros.value.rangoFechas?.to || ''}`,
  () => aplicarFiltroRangoFechas(),
  { immediate: true },
)

onMounted(() => {
  // Siempre arrancar en escritorio
  if (route.path === '/' || route.path === '/dashboard' || route.path === '/logs') {
    router.push('/escritorio')
  }

  // Eventos del asistente (solo los que NO son de flujo)
  window.addEventListener('santoro-abrir-consola', (e) => openConsole(e?.detail || null))
  window.addEventListener('santoro-mostrar-filtros', () => (showDinamicFilters.value = true))

  checkApiKeysExpirations()
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
