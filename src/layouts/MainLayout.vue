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

        <q-toolbar-title class="text-weight-bold app-toolbar-title">
          {{ toolbarOrganizationName }}
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

          <q-select
            ref="auditSearchRef"
            v-if="isClientFlow"
            v-model="selectedAuditUser"
            dark
            dense
            outlined
            use-input
            hide-selected
            fill-input
            clearable
            input-debounce="300"
            :options="auditUserOptions"
            :loading="auditSearchLoading"
            option-label="_auditLabel"
            placeholder="Auditar usuario..."
            class="audit-user-search"
            popup-content-class="audit-user-search-menu"
            aria-label="Auditar usuario"
            @filter="filterAuditUsers"
            @focus="loadRecentAuditUsers"
            @update:model-value="selectAuditUser"
          >
            <template #prepend><q-icon name="person_search" size="20px" /></template>
            <template #no-option>
              <q-item
                ><q-item-section class="text-grey-5">Sin coincidencias</q-item-section></q-item
              >
            </template>
            <template #option="scope">
              <q-item v-bind="scope.itemProps">
                <q-item-section avatar>
                  <q-avatar color="deep-purple-7" text-color="white" size="34px">
                    {{ scope.opt._auditInitials }}
                  </q-avatar>
                </q-item-section>
                <q-item-section>
                  <q-item-label>{{ scope.opt._auditName }}</q-item-label>
                  <q-item-label caption class="text-grey-5"
                    >@{{ scope.opt._auditUsername }}</q-item-label
                  >
                </q-item-section>
              </q-item>
            </template>
          </q-select>

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
                  @click="router.push('/client/myApiKeys')"
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
            @show="initGlobalColors"
          >
            <!-- Label con indicador de salud del sistema seleccionado (basado en últimas 24h) -->
            <template v-slot:label>
              <q-badge
                rounded
                class="q-mr-xs system-health-badge"
                :class="{
                  'system-health-badge--active':
                    (systemColorsMap[selectedSystem] || 'warning') !== 'grey-6',
                }"
                :color="systemColorsMap[selectedSystem] || 'warning'"
              />
              <span class="system-selected">
                <span class="system-selected__name">{{ selectedSystem }}</span>
              </span>
            </template>

            <q-list class="system-dropdown-menu">
              <q-item
                v-for="sys in systems"
                :key="sys.value"
                clickable
                v-close-popup
                class="glass-menu-item"
                @click="selectSystem(sys.value)"
              >
                <q-item-section avatar style="min-width: 24px">
                  <q-badge
                    rounded
                    class="q-mr-sm system-health-badge"
                    :class="{
                      'system-health-badge--active':
                        (systemColorsMap[sys.system || sys.value || sys] || 'grey-6') !== 'grey-6',
                    }"
                    :color="systemColorsMap[sys.system || sys.value || sys] || 'grey-6'"
                  />
                </q-item-section>
                <q-item-section class="system-option-content">
                  <q-item-label class="text-white system-option-name">{{ sys.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </q-list>
          </q-btn-dropdown>

          <!-- Menú usuario -->
          <q-btn-dropdown flat dense no-caps dropdown-icon="expand_more" class="user-dropdown">
            <template v-slot:label>
              <div class="row items-center no-wrap">
                <q-icon name="account_circle" size="24px" />
                <span v-if="$q.screen.gt.xs" class="q-ml-sm ellipsis">
                  {{ userInfo.nombre }}
                </span>
              </div>
            </template>

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
          target="_blank"
          rel="noopener noreferrer"
        />
      </div>
    </q-drawer>

    <!-- CONTENIDO -->
    <q-page-container class="app-page-container">
      <router-view v-slot="{ Component, route: currentRoute }">
        <transition
          appear
          mode="out-in"
          enter-active-class="animated fadeIn"
          leave-active-class="animated fadeOut"
        >
          <div :key="currentRoute.fullPath" class="page-view-shell">
            <component :is="Component" />
          </div>
        </transition>
      </router-view>

      <EscritorioConsolaSimple ref="consolaRef" />

      <EscritorioDetalleModal
        :model-value="modalVisible"
        :detalle="detalleModal"
        @update:model-value="modalVisible = $event"
      />
    </q-page-container>

    <EvaFloatingButton />
    <EvaWidget />
    <EvaWorkspace />
    <UserAuditDialog v-model="showUserAudit" :user="auditUser" @open-timeline="openUserTimeline" />
  </q-layout>
</template>

<script setup>
import { ref, provide, onMounted, computed, watch, watchEffect, onBeforeUnmount } from 'vue'
import { useQuasar } from 'quasar'
import { useRouter, useRoute } from 'vue-router'

// Importanto la IA
import EvaFloatingButton from 'src/components/ai/EvaFloatingButton.vue'
import EvaWidget from 'src/components/ai/EvaWidget.vue'

import EscritorioConsolaSimple from '../components/escritorio/EscritorioConsolaSimple.vue'
import EscritorioDetalleModal from '../components/escritorio/EscritorioDetalleModal.vue'

import {
  subscribeToAlerts,
  connectSocket,
  isSocketConnected,
  disconnectSocket,
} from 'src/services/socketService'
import authService from '../services/authService.js'

import QRScannerModal from 'src/components/QRScannerModal.vue'
import { ApiKeyService } from 'src/services/apiKeys'
import { ChartDataService } from 'src/services/chartDataService'
import EvaWorkspace from 'src/components/ai/EvaWorkspace.vue'
import { CatalogService, catalogSystems, systemColorsMap } from 'src/services/catalogService'
import { axiosInstance } from 'src/services/axiosConfig'
import UserAuditDialog from 'src/components/UserAuditDialog.vue'

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
const auditSearchRef = ref(null)
const selectedAuditUser = ref(null)
const auditUserOptions = ref([])
const auditSearchLoading = ref(false)
const showUserAudit = ref(false)
const auditUser = ref(null)
let auditSearchSequence = 0

function normalizeAuditUsers(payload) {
  const candidates =
    payload?.content || payload?.users || payload?.results || payload?.items || payload
  if (!Array.isArray(candidates)) return []
  return candidates.map((user, index) => {
    const name = String(
      user?.name ||
        user?.fullName ||
        user?.displayName ||
        user?.nombre ||
        user?.username ||
        'Usuario',
    )
    const username = String(user?.username || user?.userName || user?.email || user?.usuario || '')
    return {
      ...user,
      _auditName: name,
      _auditUsername: username,
      _auditLabel: username ? `${name} · ${username}` : name,
      _auditInitials:
        name
          .split(/\s+/)
          .filter(Boolean)
          .slice(0, 2)
          .map((part) => part[0]?.toUpperCase())
          .join('') || String(index + 1),
    }
  })
}

async function filterAuditUsers(value, update, abort) {
  const query = String(value || '').trim()
  if (!query && auditSearchLoading.value) {
    update(() => {})
    return
  }
  const sequence = ++auditSearchSequence

  auditSearchLoading.value = true
  try {
    const { data } = await axiosInstance.get('/api/analytics/users/quick-audit', {
      params: { query },
    })
    if (sequence !== auditSearchSequence) return abort()
    update(() => {
      auditUserOptions.value = normalizeAuditUsers(data?.data ?? data)
    })
  } catch (error) {
    if (sequence !== auditSearchSequence) return abort()
    console.error('[MainLayout] Error en auditoría rápida:', error)
    update(() => {
      auditUserOptions.value = []
    })
    $q.notify({ type: 'negative', message: 'No fue posible buscar usuarios.', position: 'top' })
  } finally {
    if (sequence === auditSearchSequence) auditSearchLoading.value = false
  }
}

async function loadRecentAuditUsers() {
  if (auditSearchLoading.value) {
    auditSearchRef.value?.showPopup()
    return
  }
  const sequence = ++auditSearchSequence
  auditSearchLoading.value = true
  try {
    const { data } = await axiosInstance.get('/api/analytics/users/quick-audit', {
      params: { query: '' },
    })
    if (sequence !== auditSearchSequence) return
    auditUserOptions.value = normalizeAuditUsers(data?.data ?? data)
    auditSearchRef.value?.showPopup()
  } catch (error) {
    if (sequence !== auditSearchSequence) return
    console.error('[MainLayout] Error cargando usuarios recientes:', error)
    auditUserOptions.value = []
    $q.notify({
      type: 'negative',
      message: 'No fue posible cargar los usuarios recientes.',
      position: 'top',
    })
  } finally {
    if (sequence === auditSearchSequence) auditSearchLoading.value = false
  }
}

function selectAuditUser(user) {
  if (!user) return
  openUserAudit(user)
  selectedAuditUser.value = null
}

function openUserAudit(user) {
  if (!user) return
  auditUser.value = normalizeAuditUsers([user])[0] || user
  showUserAudit.value = true
}

function openUserTimeline(user) {
  const searchTerm =
    user?._auditUsername ||
    user?.username ||
    user?.userName ||
    user?.email ||
    user?._auditName ||
    user?.name
  if (!searchTerm) {
    $q.notify({ type: 'warning', message: 'El usuario no tiene un identificador para consultar.' })
    return
  }
  openConsole({ searchTerm, displayName: user?._auditName || user?.name || searchTerm })
}

const apiKeysPorExpirar = ref([])
const dashboardStore = useDashboardSharedStore()

dashboardStore.initSync()

const systemOptions = computed(() =>
  catalogSystems.value.map((system) => {
    const code = String(system?.code || system?.systemCode || system?.value || '').trim()
    return {
      ...system,
      label: system?.name || system?.label || code,
      value: code,
    }
  }),
)
const systems = systemOptions
let systemsHealthInterval = null
let systemSelectionInFlight = false

const activeTenantKey = computed(() =>
  String(
    authService.user?.tenantId ||
      authService.user?.authz?.tenantId ||
      authService.user?.organization?.id ||
      '',
  ),
)
const selectedSystem = computed({
  get: () => String(dashboardStore.filtros?.system || ''),
  set: (value) => dashboardStore.setSystem(value || ''),
})

const logsGlobales = ref([])
const MS_DIA = 1000 * 60 * 60 * 24

const getDefaultDashboardRange = () => {
  const now = new Date()
  const today = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`
  return { from: today, to: today, option: 'today' }
}

const filtros = ref({
  system: dashboardStore.filtros?.system || '',
  rangoFechas: {
    from: dashboardStore.filtros?.rangoFechas?.from || '',
    to: dashboardStore.filtros?.rangoFechas?.to || '',
    option:
      dashboardStore.filtros?.rangoFechas?.option ||
      (dashboardStore.filtros?.rangoFechas?.from || dashboardStore.filtros?.rangoFechas?.to
        ? 'custom'
        : 'today'),
    range: dashboardStore.filtros?.rangoFechas?.range || undefined,
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

const toolbarOrganizationName = computed(() =>
  isSantoroFlow.value ? t('layout.santoroPanel') : userInfo.value.organization,
)

const resolveSelectedSystem = (candidate = selectedSystem.value) => {
  const availableSystems = systems.value.map((system) => system.value)
  const prefs = authService.loadPrefs()

  if (candidate && availableSystems.includes(candidate)) {
    return candidate
  }

  if (prefs.system && availableSystems.includes(prefs.system)) {
    return prefs.system
  }

  return availableSystems[0] || ''
}

const eventosRaw = ref([]) // lo que llega del backend (ya filtrado por system)
const loadingLogs = ref(false) // puedes mantener el mismo nombre
let logsAbortController = null

const {
  loading: dashboardLoading,
  refreshing: dashboardRefreshing,
  statsData,
  todayStatsData,
  seriesData,
  httpData,
  geoData,
  devicesData,
  hasFetchedOnce: dashboardHasFetchedOnce,
  fetchAll,
  cancelPendingDashboardRequests,
  subscribeSystem,
  unsubscribeSystem,
  resetDashboardData,
  refreshTick: dashboardRefreshTick,
} = useDashboardData()

const DASHBOARD_SESSION_OWNER_KEY = 'dashboardSessionOwner'
const dashboardReady = ref(false)

provide('dashboardLoading', dashboardLoading)
provide('dashboardRefreshing', dashboardRefreshing)
provide('dashboardHasFetchedOnce', dashboardHasFetchedOnce)
provide('dashboardRefreshTick', dashboardRefreshTick)
provide('dashboardStatsData', statsData)
provide('dashboardTodayStatsData', todayStatsData)
provide('dashboardSeriesData', seriesData)
provide('dashboardHttpData', httpData)
provide('dashboardGeoData', geoData)
provide('dashboardDevicesData', devicesData)

provide('logsGlobales', logsGlobales)
provide('filtrosGlobales', filtros)
provide('openConsole', openConsole)
provide('openUserAudit', openUserAudit)
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

  logsAbortController?.abort()
  logsAbortController = new AbortController()
  const { signal } = logsAbortController
  loadingLogs.value = true
  try {
    const resp = await ChartDataService.getLogsEvents({
      system: selectedSystem.value,
      page: 0,
      size: 50,
      fromDate: filtros.value?.rangoFechas?.from,
      toDate: filtros.value?.rangoFechas?.to,
      signal,
    })

    eventosRaw.value = resp?.items || []
    aplicarFiltroRangoFechas()
  } catch (e) {
    if (e?.code === 'ERR_CANCELED' || e?.name === 'CanceledError') return
    console.error('❌ Error al cargar eventos: ', e)
    eventosRaw.value = []
    logsGlobales.value = []
  } finally {
    if (logsAbortController?.signal === signal) {
      logsAbortController = null
      loadingLogs.value = false
    }
  }
}

const refreshSystemsCatalog = async (healthFilters = {}) => {
  try {
    await CatalogService.fetchCatalogs(healthFilters)

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

function localStatsColor(stats) {
  const total = Number(stats?.totalEvents || 0)
  const rate = Number(stats?.errorRate || 0)
  if (total === 0) return 'grey-6'
  if (rate > 10) return 'negative'
  if (rate > 0) return 'warning'
  return 'positive'
}

async function initGlobalColors() {
  try {
    await CatalogService.loadSystemColors(getTodayHealthRange())

    const activeKey = String(selectedSystem.value || '')
      .toUpperCase()
      .trim()
    if (activeKey && statsData.value) {
      systemColorsMap[activeKey] = localStatsColor(statsData.value)
    }
  } catch (error) {
    console.error('Error cargando semáforo global:', error)
  }
}

watchEffect(() => {
  const activeKey = String(selectedSystem.value || '')
    .toUpperCase()
    .trim()
  const stats = statsData.value
  if (!activeKey || !stats) return
  // Actualiza sólo el sistema visible; las demás claves permanecen intactas.
  systemColorsMap[activeKey] = localStatsColor(stats)
})

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

  if (selection?.deviceId) {
    consolaRef.value.abrirConsolaPorDispositivo?.(
      selection.deviceId,
      selection.displayName || selection.deviceId,
    )
    return
  }

  // ✅ Búsqueda flexible por dispositivo/usuario desde el mapa
  if (selection?.searchTerm) {
    consolaRef.value.abrirConsolaConBusqueda?.(
      selection.searchTerm,
      selection.extraParams || {},
      selection.displayName || '',
    )
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
  CatalogService.clearCache()
  apiKeysPorExpirar.value = []
  showDinamicFilters.value = false
  modalVisible.value = false

  filtros.value = {
    system: '',
    rangoFechas: { from: '', to: '', option: 'all', range: 'ALL' },
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
  const option = filtros.value?.rangoFechas?.option || ''
  const range = filtros.value?.rangoFechas?.range || ''
  return `${sys}|${from}|${to}|${option}|${range}`
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
        option:
          nextFilters?.rangoFechas?.option ||
          (nextFilters?.rangoFechas?.from || nextFilters?.rangoFechas?.to ? 'custom' : 'all'),
        range: nextFilters?.rangoFechas?.range || undefined,
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
  systemOptions,
  () => {
    const nextSystem = resolveSelectedSystem()
    if (nextSystem !== selectedSystem.value) {
      selectedSystem.value = nextSystem
    }
  },
  { immediate: true },
)

watch(activeTenantKey, async (nextTenant, previousTenant) => {
  if (!previousTenant || nextTenant === previousTenant || !isClientFlow.value) return

  // Una organización nunca puede heredar sistemas, colores o selección del
  // tenant anterior. La nueva carga queda aislada por el JWT activo.
  dashboardReady.value = false
  unsubscribeSystem()
  resetDashboardData()
  CatalogService.clearCache()
  selectedSystem.value = ''
  filtros.value.system = ''
  await initializeClientDashboard()
})

async function handleDashboardRealtimeRefresh() {
  // La salud global se actualiza directamente desde /topic/system-health.
  // Aquí sólo se refresca el listado de eventos del sistema activo.
  await cargarEventosDelSistema()
  dashboardStore.announceRealtimeRefresh()
  console.log('[Dashboard] Auto-refresh completado desde WebSocket')
}

function handleDashboardRealtimeLog(newLog = {}) {
  const deviceId = String(newLog?.meta?.deviceId || newLog?.deviceId || '').trim()
  if (!deviceId) return

  const eventKey =
    newLog?.id ||
    newLog?.eventId ||
    `${deviceId}|${newLog?.eventType || ''}|${newLog?.eventTime || newLog?.timestamp || ''}`
  const exists = eventosRaw.value.some((event) => {
    const currentDeviceId = String(event?.meta?.deviceId || event?.deviceId || '').trim()
    const currentKey =
      event?.id ||
      event?.eventId ||
      `${currentDeviceId}|${event?.eventType || ''}|${event?.eventTime || event?.timestamp || ''}`
    return currentKey === eventKey
  })
  if (exists) return

  eventosRaw.value = [newLog, ...eventosRaw.value]
  aplicarFiltroRangoFechas()
}

function subscribeDashboardSystem(sys = selectedSystem.value) {
  if (!isClientFlow.value || !sys) return
  if (!isSocketConnected()) return
  subscribeSystem(
    sys,
    () => filtros.value,
    handleDashboardRealtimeRefresh,
    handleDashboardRealtimeLog,
  )
}

function getTodayHealthRange() {
  const now = new Date()
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  return { from: startOfDay.toISOString(), to: now.toISOString() }
}

async function silentFetchSystemsHealth() {
  await CatalogService.loadGlobalMenuHealth(getTodayHealthRange())
}

async function selectSystem(system) {
  const nextSystem = String(system || '').trim()
  if (!nextSystem) return

  systemSelectionInFlight = true
  cancelPendingDashboardRequests()
  logsAbortController?.abort()
  resetDashboardData()
  filtros.value.rangoFechas = getDefaultDashboardRange()
  selectedSystem.value = nextSystem
  filtros.value.system = nextSystem

  try {
    await Promise.all([fetchAll(filtros.value), cargarEventosDelSistema()])
    subscribeDashboardSystem(nextSystem)
  } finally {
    systemSelectionInFlight = false
  }
}

async function initializeClientDashboard() {
  dashboardReady.value = false
  checkApiKeysExpirations()

  // La entrada al dashboard siempre comienza con una consulta acotada.
  filtros.value.rangoFechas = getDefaultDashboardRange()
  dashboardStore.patchFilters({ rangoFechas: filtros.value.rangoFechas })

  const sessionOwner = `${activeTenantKey.value}|${authService.user?.id || authService.user?.email || ''}`
  const previousOwner = localStorage.getItem(DASHBOARD_SESSION_OWNER_KEY)

  if (sessionOwner && previousOwner !== sessionOwner) {
    resetDashboardData()
    eventosRaw.value = []
    logsGlobales.value = []
    CatalogService.clearCache()
    filtros.value = {
      system: '',
      rangoFechas: getDefaultDashboardRange(),
      busqueda: '',
      visibleFields: [],
      values: {},
    }
    dashboardStore.resetDashboardState({ publish: false })
    localStorage.setItem(DASHBOARD_SESSION_OWNER_KEY, sessionOwner)
  }

  // Una sola precarga acotada al día actual; fetchCatalogs conserva sus
  // fallbacks y no bloquea la interfaz si salud no está disponible.
  await refreshSystemsCatalog(getTodayHealthRange())

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

  await requestNotificationPermission()

  const tenantId =
    authService.user?.tenantId ||
    authService.user?.authz?.tenantId ||
    authService.user?.organization?.id

  if (tenantId && isSocketConnected()) {
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

    if (systemSelectionInFlight) return

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
      silentFetchSystemsHealth()
    }
  },
  { immediate: true },
)

watch(
  dashboardQueryKey,
  () => {
    if (!dashboardReady.value) return
    if (!filtros.value.system) return
    if (systemSelectionInFlight) return
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
  if (systemsHealthInterval) clearInterval(systemsHealthInterval)
  logsAbortController?.abort()
  cancelPendingDashboardRequests()
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
  connectSocket()
  systemsHealthInterval = setInterval(silentFetchSystemsHealth, 30_000)
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
  gap: 8px;
}

.app-toolbar-title {
  color: var(--text-main);
  letter-spacing: 0.01em;
  font-size: 1.1rem;
  font-weight: 800;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.audit-user-search {
  width: clamp(190px, 19vw, 290px);
  flex: 0 1 290px;
}

.audit-user-search .q-field__control {
  min-height: 40px;
  height: 40px;
  border-radius: 13px;
  background: rgba(255, 255, 255, 0.045);
}

.audit-user-search .q-field__native,
.audit-user-search .q-field__input {
  color: #fff;
  font-size: 0.86rem;
}

.audit-user-search-menu {
  color: #fff;
  background: #12131b;
  border: 1px solid rgba(255, 255, 255, 0.1);
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
  min-width: 0;
}

.system-dropdown:hover {
  background: rgba(255, 255, 255, 0.06);
}

.system-dropdown .q-btn__content {
  min-width: 0;
  max-width: 100%;
  flex-wrap: nowrap;
  overflow: hidden;
}

.system-selected {
  display: inline-flex;
  min-width: 0;
  align-items: center;
  margin-left: 8px;
  line-height: 1;
}

.system-selected__name {
  display: block;
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 800;
}

.system-option-content {
  min-width: 0;
}

.system-option-name {
  max-width: 100%;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-weight: 800;
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

.system-dropdown-menu {
  min-width: min(330px, calc(100vw - 24px));
  max-width: calc(100vw - 24px);
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
  .audit-user-search {
    width: 46px;
    flex-basis: 46px;
  }

  .audit-user-search:not(.q-field--focused) .q-field__native,
  .audit-user-search:not(.q-field--focused) .q-field__append {
    display: none;
  }

  .audit-user-search.q-field--focused {
    width: min(260px, 72vw);
    flex-basis: min(260px, 72vw);
  }

  .app-header {
    padding-top: env(safe-area-inset-top, 0px);
  }

  .app-toolbar {
    min-height: 64px;
    padding-left: 6px;
    padding-right: 6px;
    gap: 4px;
  }

  .app-toolbar > .toolbar-icon-btn {
    flex: 0 0 auto;
  }

  .app-toolbar-title {
    flex: 0 0 calc(50vw - 10px);
    max-width: calc(50vw - 10px);
    font-size: 0.84rem;
    line-height: 1.15;
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
    flex: 1 1 0;
    min-width: 0;
    gap: 4px;
    padding-left: 2px;
    padding-right: 2px;
    touch-action: pan-x;
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
    flex: 0 0 clamp(184px, 58vw, 240px);
    max-width: clamp(184px, 58vw, 240px);
  }

  .system-dropdown .q-btn__content {
    min-width: 0;
    overflow: hidden;
  }

  .system-dropdown .q-btn {
    width: 100%;
    padding-left: 10px;
    padding-right: 8px;
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

/* Indicador reactivo de salud por sistema */
.system-health-badge {
  width: 9px;
  min-width: 9px;
  height: 9px;
  min-height: 9px;
  padding: 0;
  flex-shrink: 0;
}

.system-health-badge--active {
  animation: selector-dot-pulse 2.4s ease-in-out infinite;
}

@keyframes selector-dot-pulse {
  0%,
  100% {
    opacity: 0.82;
    transform: scale(0.92);
  }
  50% {
    opacity: 1;
    transform: scale(1.12);
  }
}
</style>
