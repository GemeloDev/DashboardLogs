<template>
  <q-layout view="lHh Lpr lFf" class="main-layout-shell">
    <!-- ENCABEZADO -->
    <q-header elevated class="app-header">
      <q-toolbar class="app-toolbar">
        <q-btn
          flat
          dense
          round
          icon="menu"
          :aria-label="t('layout.menuAria')"
          class="toolbar-icon-btn"
          @click="toggleLeftDrawer"
        />

        <q-toolbar-title v-if="!$q.platform.is.mobile" class="text-weight-bold app-toolbar-title">
          {{ isSantoroFlow ? t('layout.santoroPanel') : userInfo.organization }}
        </q-toolbar-title>

        <!-- Botones de herramientas rápidas -->
        <div class="row items-center q-gutter-x-sm mobile-scroll-row">
          <q-btn
            v-if="$q.platform.is.mobile"
            flat
            dense
            round
            icon="security"
            class="toolbar-icon-btn toolbar-icon-btn--success"
            @click="toogleStartSession"
          >
            <q-tooltip class="glass-tooltip">{{ t('layout.sessions') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="isClientDashboard"
            flat
            dense
            round
            icon="filter_list"
            class="toolbar-icon-btn toolbar-icon-btn--success"
            @click="toggleDinamicFilters"
          >
            <q-tooltip class="glass-tooltip">{{ t('layout.quickFilters') }}</q-tooltip>
          </q-btn>

          <q-btn
            v-if="isClientFlow"
            flat
            dense
            round
            icon="terminal"
            class="toolbar-icon-btn toolbar-icon-btn--purple"
            @click="openConsole"
          >
            <q-tooltip class="glass-tooltip">{{ t('layout.logConsole') }}</q-tooltip>
          </q-btn>

          <!-- Notificaciones API Keys -->
          <q-btn
            v-can="{ any: ['USERS_MANAGE'] }"
            v-if="isClientFlow"
            flat
            dense
            round
            icon="notifications"
            size="sm"
            class="toolbar-icon-btn toolbar-icon-btn--utility"
          >
            <q-badge color="negative" floating v-if="apiKeysPorExpirar.length > 0">
              {{ apiKeysPorExpirar.length }}
            </q-badge>

            <q-menu
              fit
              anchor="bottom left"
              self="top left"
              class="glass-menu"
              style="max-width: 350px"
            >
              <q-list style="min-width: 300px">
                <q-item-label header class="menu-header-label">
                  {{ t('layout.APIalerts') }}
                </q-item-label>

                <q-separator class="menu-separator" />

                <div v-if="apiKeysPorExpirar.length === 0" class="q-pa-md text-center text-grey-5">
                  <q-icon name="check_circle" color="positive" size="md" />
                  <div class="q-mt-xs">{{ t('layout.APIalertsState') }}</div>
                </div>

                <q-item
                  v-for="key in apiKeysPorExpirar"
                  :key="key.id"
                  clickable
                  v-close-popup
                  class="glass-menu-item"
                  @click="router.push('/myApiKeys')"
                >
                  <q-item-section avatar>
                    <q-icon
                      name="warning"
                      :color="key.tipoAlerta === 'ROTA' ? 'orange' : 'negative'"
                    />
                  </q-item-section>

                  <q-item-section>
                    <q-item-label class="text-weight-bold text-white">
                      {{ key.name }}
                    </q-item-label>
                    <q-item-label caption class="text-grey-5">
                      <template v-if="key.tipoAlerta === 'ROTA'">
                        {{ formatApiKeyRotationText(key.diasParaRotar) }}
                      </template>
                      <template v-else>
                        {{ formatApiKeyExpiryText(key.diasParaExpirar) }}
                      </template>
                    </q-item-label>
                  </q-item-section>

                  <q-item-section side top>
                    <q-badge
                      :color="key.tipoAlerta === 'ROTA' ? 'orange' : 'negative'"
                      :label="
                        key.tipoAlerta === 'ROTA'
                          ? t('apiKeys.rennovateKey')
                          : t('apiKeys.expiringSoon')
                      "
                    />
                  </q-item-section>
                </q-item>
              </q-list>
            </q-menu>
          </q-btn>

          <!-- Selector de idioma -->
          <q-btn
            flat
            dense
            round
            icon="language"
            class="toolbar-icon-btn toolbar-icon-btn--utility"
          >
            <q-menu fit anchor="bottom middle" self="top middle" class="glass-menu">
                <q-list class="language-dropdown-menu" style="min-width: 180px">
                  <q-item-label header class="menu-header-label">{{
                    t('common.language')
                  }}</q-item-label>

                  <q-separator class="menu-separator" />

                  <q-item clickable v-close-popup class="glass-menu-item" @click="setLocale('es')">
                    <q-item-section avatar style="min-width: 32px">
                      <span style="font-size: 20px">🇲🇽</span>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white">{{
                        t('layout.languageSpanish')
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top v-if="locale === 'es'">
                      <q-icon name="check" color="positive" />
                    </q-item-section>
                  </q-item>

                  <q-item clickable v-close-popup class="glass-menu-item" @click="setLocale('en')">
                    <q-item-section avatar style="min-width: 32px">
                      <span style="font-size: 20px">🇺🇸</span>
                    </q-item-section>
                    <q-item-section>
                      <q-item-label class="text-white">{{
                        t('layout.languageEnglish')
                      }}</q-item-label>
                    </q-item-section>
                    <q-item-section side top v-if="locale === 'en'">
                      <q-icon name="check" color="positive" />
                    </q-item-section>
                  </q-item>
                </q-list>
            </q-menu>
          </q-btn>

          <!-- Sistemas en línea -->
          <q-btn-dropdown
            v-if="isClientFlow"
            no-caps
            unelevated
            class="system-dropdown"
            dropdown-icon="expand_more"
          >
            <!-- Label con indicador de salud del sistema seleccionado -->
            <template #label>
              <span
                class="system-dot"
                :class="
                  'system-dot--' + (healthMap[selectedSystem]?.status || 'inactive').toLowerCase()
                "
              />
              <span class="q-ml-sm">{{ selectedSystem }}</span>
            </template>

            <q-list class="system-dropdown-menu">
              <q-item
                v-for="sys in systems"
                :key="sys.value"
                clickable
                v-close-popup
                class="glass-menu-item"
                @click="selectedSystem = sys.value"
              >
                <q-item-section avatar style="min-width: 24px">
                  <span
                    class="system-dot"
                    :class="'system-dot--' + (sys.status || 'inactive').toLowerCase()"
                  />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">{{ sys.label }}</q-item-label>
                </q-item-section>
                <q-item-section side>
                  <span style="font-size: 10px" :class="errorRateTextClass(sys.status)">
                    {{
                      !sys.status || sys.status === 'INACTIVE'
                        ? t('layout.noActivity')
                        : formatSystemErrorRate(sys.errorRate)
                    }}
                  </span>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Menú usuario -->
          <q-btn-dropdown
            flat
            dense
            no-caps
            :label="$q.screen.gt.xs ? userInfo.nombre : ''"
            icon="account_circle"
            dropdown-icon="expand_more"
            class="user-dropdown"
          >
            <q-list class="user-dropdown-menu">
              <q-item class="glass-menu-item no-hover">
                <q-item-section avatar>
                  <q-icon name="email" color="cyan" />
                </q-item-section>
                <q-item-section>
                  <q-item-label caption class="text-grey-5">
                    {{ userInfo.email }}
                  </q-item-label>
                </q-item-section>
              </q-item>

              <q-separator class="menu-separator" />

              <q-item clickable v-close-popup class="glass-menu-item" @click="logout">
                <q-item-section avatar>
                  <q-icon name="logout" color="negative" />
                </q-item-section>
                <q-item-section>
                  <q-item-label class="text-white">{{ t('layout.logout') }}</q-item-label>
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
        <div
          class="filters-dialog-wrap q-pa-sm"
          style="width: min(1900px, 99vw); max-height: calc(100vh - 80px); overflow: auto"
        >
          <ChartDrivenFilters />
        </div>
      </q-dialog>
    </q-header>

    <!-- SIDEBAR -->
    <q-drawer
      v-model="leftDrawerOpen"
      show-if-above
      :width="290"
      :breakpoint="1800"
      class="app-drawer"
    >
      <q-scroll-area class="fit">
        <div class="drawer-brand-block">
          <q-avatar size="68px" class="stat-icon--warm">
            <q-icon name="hive" size="34px" color="white" />
          </q-avatar>

          <div class="drawer-brand-title">
            {{ isSantoroFlow ? t('layout.santoroPanel') : t('layout.consoleLogs') }}
          </div>

          <div class="drawer-brand-subtitle">
            {{ t('layout.systemSubtitle') }}
          </div>
        </div>

        <q-list padding class="menu-list">
          <q-separator dark spaced class="drawer-separator" />

          <template v-if="isClientFlow">
            <q-item clickable v-ripple to="/client/escritorio" exact class="drawer-item">
              <q-item-section avatar>
                <q-icon name="dashboard" class="item-icon item-icon--cyan" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.dashboard') }}</span>
              </q-item-section>
            </q-item>

            <q-separator dark spaced class="drawer-separator" />
            <q-item-label header class="drawer-section-label">{{
              t('layout.toolsSection')
            }}</q-item-label>

            <q-item clickable v-ripple to="/client/diagnostico" class="drawer-item">
              <q-item-section avatar>
                <q-icon name="bug_report" class="item-icon item-icon--red" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.diagnostic') }}</span>
              </q-item-section>
            </q-item>

            <q-item
              v-can="'SETTINGS_MANAGE'"
              v-if="isAdmin"
              clickable
              v-ripple
              to="/client/myApiKeys"
              class="drawer-item"
            >
              <q-item-section avatar>
                <q-icon name="key" class="item-icon item-icon--cyan" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('common.myAPIkeys') }}</span>
              </q-item-section>
            </q-item>

            <q-item
              v-can="'USERS_MANAGE'"
              v-if="isAdmin"
              clickable
              v-ripple
              to="/client/gestion-empleados"
              class="drawer-item"
            >
              <q-item-section avatar>
                <q-icon name="badge" class="item-icon item-icon--warm" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.userManagement') }}</span>
              </q-item-section>
            </q-item>
          </template>

          <template v-if="isSantoroFlow && isSantoroUser">
            <q-item clickable v-ripple to="/santoro/inicio" class="drawer-item">
              <q-item-section avatar>
                <q-icon name="home" class="item-icon color-orange-santoro" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.home') }}</span>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/santoro/empresas" class="drawer-item">
              <q-item-section avatar>
                <q-icon name="apartment" class="item-icon item-icon--cyan" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.enterprises') }}</span>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/santoro/usuarios" class="drawer-item">
              <q-item-section avatar>
                <q-icon name="group" class="item-icon item-icon--amber" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.users') }}</span>
              </q-item-section>
            </q-item>

            <q-item clickable v-ripple to="/santoro/api-keys" class="drawer-item">
              <q-item-section avatar>
                <q-icon name="vpn_key" class="item-icon item-icon--purple" />
              </q-item-section>
              <q-item-section>
                <span class="drawer-item-label">{{ t('layout.apiKeys') }}</span>
              </q-item-section>
            </q-item>
          </template>
        </q-list>
      </q-scroll-area>

      <div class="drawer-footer">
        <q-btn
          unelevated
          rounded
          icon="help"
          :label="t('layout.support')"
          class="footer-btn"
          href="https://ticket.grupo-santoro.com.mx/login"
        />
      </div>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container class="app-page-container">
      <transition appear enter-active-class="animated fadeIn" leave-active-class="animated fadeOut">
        <div class="page-view-shell">
          <router-view />

          <EscritorioConsolaSimple ref="consolaRef" />

          <EscritorioDetalleModal
            :model-value="modalVisible"
            :detalle="detalleModal"
            @update:model-value="modalVisible = $event"
          />
        </div>
      </transition>
    </q-page-container>

    <EvaFloatingButton />
    <EvaWidget />
    <EvaWorkspace />
  </q-layout>
</template>

<script setup>
import { ref, provide, onMounted, computed, watch, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'
import { Capacitor } from '@capacitor/core'
import { App as CapacitorApp } from '@capacitor/app'

// Importanto la IA
import EvaFloatingButton from 'src/components/ai/EvaFloatingButton.vue'
import EvaWidget from 'src/components/ai/EvaWidget.vue'

import EscritorioConsolaSimple from '../components/escritorio/EscritorioConsolaSimple.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'

import {
  subscribeToAlerts,
  connectSocket,
  ensureSocketConnected,
  restartSocketConnection,
  disconnectSocket,
} from 'src/services/socketService'
import authService from '../services/authService.js'

import QRScannerModal from 'src/components/QRScannerModal.vue'
import { ApiKeyService } from 'src/services/apiKeys'
import { ChartDataService } from 'src/services/chartDataService'
import EvaWorkspace from 'src/components/ai/EvaWorkspace.vue'
import { CatalogService } from 'src/services/catalogService'

import { useDashboardData } from 'src/services/useDashboardData'
import ChartDrivenFilters from 'src/components/blocks/ChartDrivenFilters.vue'
import { useDashboardSharedStore } from 'src/stores/dashboardShared.store'
import { useI18n } from 'vue-i18n'

const $q = useQuasar()
const router = useRouter()
const route = useRoute()
const { t, locale } = useI18n()

const leftDrawerOpen = ref(false)
const modalVisible = ref(false)
const detalleModal = ref(null)
const showSessionQR = ref(false)
const showDinamicFilters = ref(false)
const consolaRef = ref(null)

const apiKeysPorExpirar = ref([])
const dashboardStore = useDashboardSharedStore()

dashboardStore.initSync()

const systems = ref([])
const healthMap = ref({})

const allowedSystemNames = computed(() => authService.user?.authz?.systems || [])
const selectedSystem = computed({
  get: () => String(dashboardStore.filtros?.system || ''),
  set: (value) => dashboardStore.setSystem(value || ''),
})

const logsGlobales = ref([])
const MS_DIA = 1000 * 60 * 60 * 24

const filtros = ref({
  system: dashboardStore.filtros?.system || '',
  rangoFechas: {
    from: dashboardStore.filtros?.rangoFechas?.from || '',
    to: dashboardStore.filtros?.rangoFechas?.to || '',
  },
  busqueda: dashboardStore.filtros?.busqueda || '',
  visibleFields: Array.isArray(dashboardStore.filtros?.visibleFields)
    ? [...dashboardStore.filtros.visibleFields]
    : [],
  values: { ...(dashboardStore.filtros?.values || {}) },
})

// Info usuario
const userInfo = computed(() => ({
  nombre: authService.user?.name || t('layout.users'),
  email: authService.user?.email || t('common.unknown'),
  organization: authService.user?.organization?.name || t('layout.santoroPanel'),
  roles: authService.user?.authz?.roles || [],
}))

const filterAuthorizedSystems = (catalogSystems = []) => {
  const allowed = new Set(allowedSystemNames.value)
  return catalogSystems.filter((system) => allowed.has(system?.value))
}

const resolveSelectedSystem = (candidate = selectedSystem.value) => {
  const availableSystems = systems.value.map((system) => system.value)
  const prefs = authService.loadPrefs()

  if (candidate && availableSystems.includes(candidate)) {
    return candidate
  }

  if (prefs.system && availableSystems.includes(prefs.system)) {
    return prefs.system
  }

  return allowedSystemNames.value.find((system) => availableSystems.includes(system)) || ''
}

const eventosRaw = ref([]) // lo que llega del backend (ya filtrado por system)
const loadingLogs = ref(false) // puedes mantener el mismo nombre

const {
  loading: dashboardLoading,
  refreshing: dashboardRefreshing,
  statsData,
  seriesData,
  httpData,
  geoData,
  devicesData,
  hasFetchedOnce: dashboardHasFetchedOnce,
  fetchAll,
  subscribeSystem,
  unsubscribeSystem,
  resetDashboardData,
  refreshTick: dashboardRefreshTick,
} = useDashboardData()

const DASHBOARD_RECOVERY_COOLDOWN_MS = 10000
const DASHBOARD_SESSION_OWNER_KEY = 'dashboardSessionOwner'
let lastDashboardRecoveryAt = 0
let dashboardRecoveryInFlight = false
let removeNativeAppStateListener = null
const dashboardReady = ref(false)

provide('dashboardLoading', dashboardLoading)
provide('dashboardRefreshing', dashboardRefreshing)
provide('dashboardHasFetchedOnce', dashboardHasFetchedOnce)
provide('dashboardRefreshTick', dashboardRefreshTick)
provide('dashboardStatsData', statsData)
provide('dashboardSeriesData', seriesData)
provide('dashboardHttpData', httpData)
provide('dashboardGeoData', geoData)
provide('dashboardDevicesData', devicesData)

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
  if (!selectedSystem.value) {
    eventosRaw.value = []
    logsGlobales.value = []
    return
  }

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

const refreshSystemsCatalog = async () => {
  try {
    const catalogs = await CatalogService.fetchCatalogs()
    systems.value = filterAuthorizedSystems(catalogs.sistemas)
    healthMap.value = catalogs.healthMap || {}

    const nextSystem = resolveSelectedSystem()
    if (nextSystem !== selectedSystem.value) {
      selectedSystem.value = nextSystem
    }
  } catch (e) {
    console.error('❌ Error al refrescar sistemas: ', e)
  }
}

const isAdmin = computed(() => {
  return userInfo.value.roles.includes('ORG_ADMIN') || userInfo.value.roles.includes('ORG_OWNER')
})

const isSantoroUser = computed(() => authService.canAccessSantoroFlow())
const currentFlow = computed(() => route.meta?.flow || authService.getAllowedFlow())
const isSantoroFlow = computed(() => currentFlow.value === 'santoro')
const isClientFlow = computed(() => currentFlow.value === 'client')
const isClientDashboard = computed(() => isClientFlow.value && route.path === '/client/escritorio')

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
        message: t('notifications.apiNotify'),
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
    message: t('notifications.qrScanned'),
    position: 'bottom',
    color: 'green',
  })
}

function errorRateTextClass(status) {
  if (status === 'CRIT') return 'text-red-4'
  if (status === 'WARN') return 'text-orange-4'
  if (status === 'HEALTHY') return 'text-green-4'
  return 'text-grey-5'
}

function formatSystemErrorRate(rate) {
  return `${((rate || 0) * 100).toFixed(1)}${t('layout.errorRateShort')}`
}

function formatApiKeyRotationText(days) {
  return days === 1
    ? t('apiKeys.daysToRenewSingular', { days })
    : t('apiKeys.daysToRenewPlural', { days })
}

function formatApiKeyExpiryText(days) {
  return days === 1
    ? t('apiKeys.expiresInSingular', { days })
    : t('apiKeys.expiresInPlural', { days })
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

function openConsole(selection = null) {
  if (!consolaRef.value?.abrirConsola) {
    $q.notify({ message: t('notifications.errorOpenConsole'), color: 'negative' })
    return
  }

  // ✅ NUEVO: dataGrafica + selections (para que se vea el valor en los selects)
  if (
    selection?.dataGrafica &&
    Array.isArray(selection.dataGrafica) &&
    Array.isArray(selection.selections)
  ) {
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

function resetClientDashboardState() {
  dashboardReady.value = false
  unsubscribeSystem()
  resetDashboardData()
  disconnectSocket()

  eventosRaw.value = []
  logsGlobales.value = []
  systems.value = []
  healthMap.value = {}
  apiKeysPorExpirar.value = []
  showDinamicFilters.value = false
  modalVisible.value = false

  filtros.value = {
    system: '',
    rangoFechas: { from: '', to: '' },
    busqueda: '',
    visibleFields: [],
    values: {},
  }

  dashboardStore.resetDashboardState()
  localStorage.removeItem(DASHBOARD_SESSION_OWNER_KEY)
}

function logout() {
  resetClientDashboardState()
  const result = authService.logout()

  if (result.success) {
    $q.notify({
      message: t('notifications.successLogout'),
      color: 'positive',
      icon: 'logout',
      position: $q.platform.is.mobile ? 'bottom' : 'top',
    })
    router.push('/login')
  } else {
    $q.notify({
      message: t('notifications.errorLogout'),
      color: 'negative',
      icon: 'error',
      position: $q.platform.is.mobile ? 'bottom' : 'top',
    })
  }
}

function setLocale(lang) {
  locale.value = lang
}

const dashboardQueryKey = computed(() => {
  const sys = String(filtros.value?.system || '').trim()
  const from = filtros.value?.rangoFechas?.from || ''
  const to = filtros.value?.rangoFechas?.to || ''
  return `${sys}|${from}|${to}`
})

watch(
  () => dashboardStore.filtros,
  (nextFilters) => {
    const nextSerialized = JSON.stringify(nextFilters || {})
    const currentSerialized = JSON.stringify(filtros.value || {})
    if (nextSerialized === currentSerialized) return

    filtros.value = {
      system: nextFilters?.system || '',
      busqueda: nextFilters?.busqueda || '',
      rangoFechas: {
        from: nextFilters?.rangoFechas?.from || '',
        to: nextFilters?.rangoFechas?.to || '',
      },
      visibleFields: Array.isArray(nextFilters?.visibleFields)
        ? [...nextFilters.visibleFields]
        : [],
      values: { ...(nextFilters?.values || {}) },
    }
  },
  { deep: true },
)

watch(
  filtros,
  (nextFilters) => {
    const nextSerialized = JSON.stringify(nextFilters || {})
    const storeSerialized = JSON.stringify(dashboardStore.filtros || {})
    if (nextSerialized === storeSerialized) return
    dashboardStore.setFilters(nextFilters)
  },
  { deep: true },
)

watch(
  [systems, allowedSystemNames],
  () => {
    const nextSystem = resolveSelectedSystem()
    if (nextSystem !== selectedSystem.value) {
      selectedSystem.value = nextSystem
    }
  },
  { immediate: true },
)

async function handleDashboardRealtimeRefresh() {
  await Promise.all([cargarEventosDelSistema(), refreshSystemsCatalog()])
  dashboardStore.announceRealtimeRefresh()
  console.log('[Dashboard] Auto-refresh completado desde WebSocket')
}

function subscribeDashboardSystem(sys = selectedSystem.value) {
  if (!isClientFlow.value || !sys) return
  ensureSocketConnected()
  subscribeSystem(sys, () => filtros.value, handleDashboardRealtimeRefresh)
}

async function recoverDashboardConnection(reason = 'focus', options = {}) {
  if (!isClientFlow.value || !filtros.value.system || dashboardRecoveryInFlight) return

  const now = Date.now()
  if (!options.bypassCooldown && now - lastDashboardRecoveryAt < DASHBOARD_RECOVERY_COOLDOWN_MS)
    return

  lastDashboardRecoveryAt = now
  dashboardRecoveryInFlight = true

  try {
    if (options.restartSocket) {
      await restartSocketConnection()
    } else {
      ensureSocketConnected()
    }

    subscribeDashboardSystem(filtros.value.system)
    await Promise.all([
      fetchAll(filtros.value, { preserveExistingData: true }),
      cargarEventosDelSistema(),
    ])
  } catch (err) {
    console.error(`[Dashboard] Error al recuperar conexión WebSocket (${reason}):`, err)
  } finally {
    dashboardRecoveryInFlight = false
  }
}

function handleWindowFocusRecovery() {
  recoverDashboardConnection('focus')
}

function handleVisibilityRecovery() {
  if (document.visibilityState === 'visible') {
    recoverDashboardConnection('visibility')
  }
}

async function setupNativeAppStateRecovery() {
  if (!Capacitor.isNativePlatform()) return

  const handle = await CapacitorApp.addListener('appStateChange', ({ isActive }) => {
    if (!isActive) return

    recoverDashboardConnection('capacitor-app-state', {
      restartSocket: true,
      bypassCooldown: true,
    })
  })

  removeNativeAppStateListener = () => {
    handle.remove()
    removeNativeAppStateListener = null
  }
}

async function initializeClientDashboard() {
  dashboardReady.value = false
  checkApiKeysExpirations()

  const sessionOwner =
    authService.user?.id || authService.user?.email || authService.user?.organization?.id || ''
  const previousOwner = localStorage.getItem(DASHBOARD_SESSION_OWNER_KEY)

  if (sessionOwner && previousOwner !== sessionOwner) {
    resetDashboardData()
    eventosRaw.value = []
    logsGlobales.value = []
    systems.value = []
    healthMap.value = {}
    filtros.value = {
      system: '',
      rangoFechas: { from: '', to: '' },
      busqueda: '',
      visibleFields: [],
      values: {},
    }
    dashboardStore.resetDashboardState({ publish: false })
    localStorage.setItem(DASHBOARD_SESSION_OWNER_KEY, sessionOwner)
  }

  await refreshSystemsCatalog()

  const nextSystem = resolveSelectedSystem()
  if (nextSystem) {
    selectedSystem.value = nextSystem
    filtros.value.system = nextSystem
    authService.savePrefs(currentFlow.value, nextSystem)

    await Promise.all([fetchAll(filtros.value), cargarEventosDelSistema()])
  }

  dashboardReady.value = true

  connectSocket()
  subscribeDashboardSystem(nextSystem)

  // Esperar un momento para que la conexion se establezca
  await new Promise((resolve) => setTimeout(resolve, 1000))

  await requestNotificationPermission()

  const tenantId =
    authService.user?.tenantId ||
    authService.user?.authz?.tenantId ||
    authService.user?.organization?.id

  if (tenantId) {
    subscribeToAlerts(tenantId, handleCritAlert)
  }
}

// 1) Cuando cambia system: SÍ pega al backend Y se suscribe al WebSocket
watch(
  selectedSystem,
  (sys) => {
    if (!dashboardReady.value) return

    filtros.value.system = sys || ''

    if (!sys) {
      eventosRaw.value = []
      logsGlobales.value = []
      unsubscribeSystem()
      return
    }

    authService.savePrefs(currentFlow.value, sys)

    if (isClientFlow.value) {
      cargarEventosDelSistema()

      // 📡 Suscribirse al WebSocket para auto-refresh del dashboard
      subscribeDashboardSystem(sys)
    }
  },
  { immediate: true },
)

// 2) Cuando cambia rango: SÍ pega al backend
watch(
  () => `${filtros.value.rangoFechas?.from || ''}|${filtros.value.rangoFechas?.to || ''}`,
  () => {
    if (isClientFlow.value && dashboardReady.value) {
      aplicarFiltroRangoFechas()
    }
  },
  { immediate: true },
)

watch(
  dashboardQueryKey,
  () => {
    if (!dashboardReady.value) return
    if (!filtros.value.system) return
    fetchAll(filtros.value)
  },
  { immediate: true },
)

// Limpiar suscripción al WebSocket si se sale del flujo de cliente
watch(isClientFlow, (isClient) => {
  if (!isClient) {
    unsubscribeSystem()
  }
})

onBeforeUnmount(() => {
  window.removeEventListener('focus', handleWindowFocusRecovery)
  document.removeEventListener('visibilitychange', handleVisibilityRecovery)
  removeNativeAppStateListener?.()
  unsubscribeSystem()
})

// ── Notificaciones del browser para alertas CRIT ──────────────────────────────
async function requestNotificationPermission() {
  if (!('Notification' in window)) return false
  if (Notification.permission === 'granted') return true
  if (Notification.permission === 'denied') return false
  const result = await Notification.requestPermission()
  return result === 'granted'
}

function showBrowserNotification(alert) {
  const title = `${t('notifications.criticalAlertTitle')} - ${alert.system}`
  const body = alert.message || `${t('notifications.errorRate')}${alert.system}`
  const options = {
    body,
    icon: '/icons/favicon-32x32.png',
    badge: '/icons/favicon-32x32.png',
    tag: `crit-${alert.system}`, // evita duplicados del mismo sistema
    renotify: true,
    requireInteraction: true, // no se cierra sola hasta que el usuario la vea
  }

  // Notificación del browser (funciona aunque la app esté en segundo plano)
  if (Notification.permission === 'granted') {
    const notif = new Notification(title, options)
    notif.onclick = () => {
      window.focus()
      notif.close()
    }
  }

  // Notificación dentro de la app (Quasar notify)
  $q.notify({
    type: 'negative',
    icon: 'warning',
    message: title,
    caption: body,
    position: 'top-right',
    timeout: 8000,
    actions: [{ label: t('common.seeData'), color: 'white', handler: () => openConsole(null) }],
  })
}

function handleCritAlert(alert) {
  console.warn('[Alert] CRIT recibida:', alert)
  showBrowserNotification(alert)
}

onMounted(async () => {
  window.addEventListener('focus', handleWindowFocusRecovery)
  document.addEventListener('visibilitychange', handleVisibilityRecovery)
  await setupNativeAppStateRecovery()

  const defaultFlow = authService.getAllowedFlow()
  const defaultRoute = defaultFlow === 'santoro' ? '/santoro/empresas' : '/client/escritorio'

  if (route.path === '/' || route.path === '/dashboard' || route.path === '/logs') {
    router.push(defaultRoute)
  }

  if (isClientFlow.value) {
    window.addEventListener('santoro-abrir-consola', (e) => openConsole(e?.detail || null))
    window.addEventListener('santoro-mostrar-filtros', () => (showDinamicFilters.value = true))
    await initializeClientDashboard()
  }
})
</script>

<style lang="scss">
:root {
  --bg-1: #000000;
  --bg-2: #050505;
  --bg-3: #0a0a0a;
  --bg-4: #120904;
  --bg-5: #1a0d07;

  --text-main: #ffffff;
  --text-soft: rgba(255, 255, 255, 0.72);
  --text-muted: rgba(255, 255, 255, 0.5);

  --cyan: #22d3ee;
  --cyan-strong: #06b6d4;
  --purple: #7c3aed;
  --pink: #ec4899;
  --orange-accent: #e97132;
  --orange-deep: #a44d1f;
  --orange-dark: #2a1208;

  --border-soft: rgba(255, 255, 255, 0.08);
  --border-medium: rgba(255, 255, 255, 0.12);

  --glass-bg: rgba(255, 255, 255, 0.035);
  --glass-bg-soft: rgba(255, 255, 255, 0.025);
  --glass-bg-strong: rgba(255, 255, 255, 0.05);

  --gradient-primary: linear-gradient(90deg, #06b6d4 0%, #7c3aed 55%, #ec4899 100%);
  --gradient-warm: linear-gradient(90deg, #7c3aed 0%, #ec4899 55%, #e97132 100%);
  --gradient-santoro-dark: linear-gradient(135deg, #1a0d07 0%, #2a1208 45%, #3a170a 100%);
  --gradient-santoro-soft: linear-gradient(
    135deg,
    rgba(233, 113, 50, 0.2),
    rgba(124, 58, 237, 0.16)
  );
}

.stat-icon--warm {
  background: linear-gradient(135deg, rgba(233, 113, 50, 0.95), rgba(236, 72, 153, 0.82));
}

.main-layout-shell {
  background: transparent;
  color: var(--text-main);
}

/* HEADER */
.app-header {
  background:
    radial-gradient(circle at right, rgba(233, 113, 50, 0.16), transparent 24%),
    radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.08), transparent 20%),
    linear-gradient(180deg, #120904 0%, #0c0503 100%) !important;
  color: white;
  backdrop-filter: blur(18px);
  border-bottom: 1px solid rgba(233, 114, 50, 0.479) !important;
  box-shadow: 0 14px 34px rgba(0, 0, 0, 0.38);
}

.app-toolbar {
  min-height: 64px;
  padding-left: 12px;
  padding-right: 12px;
}

.app-toolbar-title {
  color: var(--text-main);
  letter-spacing: 0.01em;
  font-size: 1.1rem;
  font-weight: 800;
}

.app-toolbar-title::after {
  content: '';
  display: inline-block;
  width: 8px;
  height: 8px;
  margin-left: 10px;
  border-radius: 999px;
  background: var(--orange-accent);
  box-shadow: 0 0 16px rgba(233, 113, 50, 0.35);
  vertical-align: middle;
}

.toolbar-icon-btn {
  color: rgba(255, 255, 255, 0.76);
  border-radius: 12px;
  transition:
    background 0.2s ease,
    transform 0.15s ease,
    color 0.2s ease,
    box-shadow 0.2s ease;
}

.toolbar-icon-btn:hover {
  background: rgba(255, 255, 255, 0.06);
  transform: translateY(-1px);
  box-shadow: 0 0 0 1px rgba(233, 113, 50, 0.12);
}

.toolbar-icon-btn--success {
  color: #86efac;
}

.toolbar-icon-btn--purple {
  color: #c084fc;
}

.toolbar-utility-group {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  min-width: 0;
}

.toolbar-icon-btn--utility {
  min-width: 34px;
  min-height: 34px;
}

/* USER + SYSTEM */
.system-dropdown,
.user-dropdown {
  border-radius: 14px;
}

.system-dropdown .q-btn,
.user-dropdown .q-btn {
  color: white;
}

.system-dropdown {
  background: rgba(255, 255, 255, 0.045);
  border: 1px solid rgba(233, 113, 50, 0.14);
  color: white;
}

.system-dropdown:hover {
  background: rgba(255, 255, 255, 0.06);
}

.glass-tooltip {
  background: #160b07 !important;
  color: white !important;
  border: 1px solid rgba(233, 113, 50, 0.16);
  box-shadow: 0 12px 24px rgba(0, 0, 0, 0.28);
}

.filters-dialog-wrap {
  max-width: min(2000px, 99vw);
  max-height: calc(100vh - 80px);
  overflow: auto;
}

/* MENUS */
.glass-menu,
.system-dropdown-menu,
.user-dropdown-menu,
.q-menu {
  background:
    radial-gradient(circle at top left, rgba(233, 113, 50, 0.08), transparent 28%),
    linear-gradient(160deg, rgba(22, 11, 7, 0.98), rgba(17, 9, 7, 0.96)) !important;
  color: white !important;
  border: 1px solid rgba(233, 113, 50, 0.14);
  border-radius: 18px;
  box-shadow: 0 20px 44px rgba(0, 0, 0, 0.38);
  backdrop-filter: blur(18px);
}

.menu-header-label {
  color: rgba(255, 255, 255, 0.76) !important;
  font-weight: 800;
  letter-spacing: 0.02em;
}

.menu-separator {
  background: rgba(255, 255, 255, 0.08) !important;
}

.glass-menu-item {
  color: white;
  border-radius: 12px;
  margin: 4px 8px;
  transition:
    background 0.15s ease,
    border-color 0.15s ease;
  border: 1px solid transparent;
}

.glass-menu-item:hover {
  background: rgba(255, 255, 255, 0.05);
  border-color: rgba(233, 113, 50, 0.1);
}

.glass-menu-item.no-hover:hover {
  background: transparent;
  border-color: transparent;
}

/* DRAWER */
.app-drawer {
  display: flex;
  flex-direction: column;
  background:
    radial-gradient(circle at top left, rgba(233, 113, 50, 0.16), transparent 24%),
    radial-gradient(circle at bottom right, rgba(124, 58, 237, 0.08), transparent 20%),
    linear-gradient(180deg, #120904 0%, #0c0503 100%) !important;
  color: white;
  border-right: 1px solid rgba(233, 113, 50, 0.14) !important;
  box-shadow: 10px 0 32px rgba(0, 0, 0, 0.28);
}

.app-drawer .q-list {
  flex: 1;
  overflow-y: auto;
}

.drawer-brand-block {
  margin-top: 28px;
  padding: 8px 18px 14px;
  text-align: center;
}

.drawer-brand-avatar {
  background: linear-gradient(135deg, #e97132 0%, #ec4899 100%);
  box-shadow: 0 16px 34px rgba(233, 113, 50, 0.24);
}

.drawer-brand-title {
  margin-top: 14px;
  font-size: 1.15rem;
  font-weight: 800;
  color: white;
}

.drawer-brand-subtitle {
  margin-top: 6px;
  padding: 0 12px;
  color: var(--text-soft);
  font-size: 0.83rem;
  line-height: 1.5;
}

.drawer-separator {
  background: rgba(255, 255, 255, 0.08) !important;
}

.drawer-section-label {
  color: rgba(255, 255, 255, 0.48) !important;
  font-size: 0.8rem;
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.menu-list .drawer-item {
  min-height: 50px;
  padding: 10px 16px;
  color: #fff;
  border-radius: 14px;
  margin: 6px 10px;
  transition:
    background 0.18s ease,
    transform 0.15s ease,
    border-color 0.18s ease,
    box-shadow 0.18s ease;
  border: 1px solid transparent;
}

.menu-list .drawer-item:hover {
  background: rgba(255, 255, 255, 0.05);
  transform: translateX(2px);
  border-color: rgba(233, 113, 50, 0.12);
}

.menu-list .drawer-item.q-router-link-active {
  background: linear-gradient(90deg, rgba(233, 113, 50, 0.18), rgba(124, 58, 237, 0.14));
  border-color: rgba(233, 113, 50, 0.22);
  box-shadow: inset 0 0 0 1px rgba(255, 255, 255, 0.02);
}

.menu-list .drawer-item.q-router-link-active .drawer-item-label {
  color: white;
}

.menu-list .drawer-item.q-router-link-active .q-item__section--avatar .q-icon {
  color: #fff !important;
}

.drawer-item-label {
  font-weight: 700;
  color: rgba(255, 255, 255, 0.88);
}

.item-icon {
  font-size: 22px;
}

.item-icon--cyan {
  color: #7dd3fc;
}

.item-icon--purple {
  color: #c084fc;
}

.item-icon--warm {
  color: #e97132;
}

.item-icon--amber {
  color: #f59e0b;
}

.item-icon--red {
  color: #f87171;
}

/* CONTENT */
.app-page-container {
  background: transparent !important;
}

.page-view-shell {
  min-height: 100vh;
  background: transparent;
}

/* FILTER PANEL */
.filters-panel {
  backdrop-filter: blur(8px);
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
}

.flow-container {
  min-height: 100vh;
  padding: 16px;
  background: transparent;

  &.desktop-flow {
    .q-card {
      background: linear-gradient(160deg, rgba(255, 255, 255, 0.045), rgba(255, 255, 255, 0.02));
      color: white;
      border-radius: 18px;
      margin-bottom: 16px;
      border: 1px solid rgba(255, 255, 255, 0.08);
      box-shadow: 0 18px 42px rgba(0, 0, 0, 0.28);

      .text-h6 {
        color: #fff;
      }
    }
  }
}

/* FOOTER */
.app-footer {
  background: rgba(24, 10, 7, 0.88);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(233, 113, 50, 0.12);
}

.app-footer-toolbar {
  min-height: 52px;
}

.q-avatar-santoro {
  position: relative;
  vertical-align: middle;
  display: inline-block;
  border-radius: 50%;
  font-size: 48px;
  height: 0.5em;
  width: 1em;
}

.footer-btn {
  color: white;
  background: rgba(233, 113, 50, 0.18);
  border: 1px solid rgba(233, 113, 50, 0.24);
}

.footer-btn:hover {
  background: rgba(233, 113, 50, 0.24);
}

/* Footer pegado al fondo del drawer */
.drawer-footer {
  margin-top: auto;
  padding: 10px 12px;
  background: rgba(24, 10, 7, 0.88);
  backdrop-filter: blur(10px);
  border-top: 1px solid rgba(233, 113, 50, 0.12);
  display: flex;
  justify-content: flex-end;
}

/* Animaciones */
.animated {
  animation-duration: 0.3s;
  animation-fill-mode: both;
}

@keyframes fadeIn {
  from {
    opacity: 0;
    transform: translateY(4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

@keyframes fadeOut {
  from {
    opacity: 1;
    transform: translateY(0);
  }
  to {
    opacity: 0;
    transform: translateY(4px);
  }
}

.fadeIn {
  animation-name: fadeIn;
}

.fadeOut {
  animation-name: fadeOut;
}

/* MÓVIL */
@media (max-width: 599px) {
  .app-header {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .app-toolbar {
    min-height: 64px;
  }

  .app-drawer {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .app-page-container {
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .q-dialog__inner--maximized {
    padding-top: 0;
    padding-bottom: 0;
  }

  .fullscreen-safe-shell {
    padding-top: env(safe-area-inset-top, 0px);
    padding-bottom: env(safe-area-inset-bottom, 0px);
  }

  .mobile-scroll-row {
    flex-wrap: nowrap !important;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
    flex: 1 1 auto;
    min-width: 0;
    gap: 4px;
    padding-left: 6px;
    padding-right: 6px;
  }

  .mobile-scroll-row > * {
    margin-left: 4px !important;
  }

  .toolbar-utility-group {
    flex: 0 0 auto;
    gap: 2px;
    padding: 2px 4px;
    border-radius: 16px;
    background: rgba(255, 255, 255, 0.035);
    border: 1px solid rgba(255, 255, 255, 0.06);
  }

  .toolbar-icon-btn--utility {
    min-width: 32px;
    min-height: 32px;
    padding: 4px;
  }

  .system-dropdown {
    flex: 0 0 auto;
    max-width: 210px;
  }

  .system-dropdown .q-btn__content {
    min-width: 0;
    overflow: hidden;
  }

  .mobile-scroll-row::-webkit-scrollbar {
    display: none;
  }

  .mobile-scroll-row {
    -ms-overflow-style: none;
    scrollbar-width: none;
  }
}

.q-dialog__inner--minimized > div {
  max-width: 1000px;
}

.drawer-logo-avatar {
  overflow: hidden;
}

.drawer-logo-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  display: block;
}

/* SCROLLBAR GLOBAL */
::-webkit-scrollbar {
  width: 8px;
  height: 8px;
  background-color: #050505;
}

::-webkit-scrollbar-track {
  background-color: rgba(255, 255, 255, 0.04);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb {
  background: linear-gradient(180deg, #e97132 0%, #7c3aed 100%);
  border-radius: 999px;
}

::-webkit-scrollbar-thumb:hover {
  background: linear-gradient(180deg, #ff9d67 0%, #a855f7 100%);
}

/* Indicador de salud por sistema */
.system-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 999px;
  flex-shrink: 0;
  vertical-align: middle;
}

.system-dot--healthy {
  background: #22c55e;
  box-shadow: 0 0 6px rgba(34, 197, 94, 0.6);
}
.system-dot--warn {
  background: #f97316;
  box-shadow: 0 0 6px rgba(249, 115, 22, 0.6);
}
.system-dot--crit {
  background: #ef4444;
  box-shadow: 0 0 6px rgba(239, 68, 68, 0.6);
  animation: pulse-dot 1.5s infinite;
}
.system-dot--inactive {
  background: #6b7280;
}
</style>
