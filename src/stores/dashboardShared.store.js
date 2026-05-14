import { defineStore } from 'pinia'

const DASHBOARD_SYNC_CHANNEL = 'dashboard-multipanel-sync-v1'
const DASHBOARD_POSTMESSAGE_TYPE = 'dashboard-sync-payload'
const DASHBOARD_POSTMESSAGE_REQUEST = 'dashboard-sync-request'

const EMPTY_FILTERS = () => ({
  system: '',
  busqueda: '',
  rangoFechas: { from: '', to: '' },
  visibleFields: [],
  values: {},
})

const PERSISTED_STORE_KEY = 'dashboardShared'

const normalizeOpenSections = (sections = {}) => {
  if (!sections || typeof sections !== 'object' || Array.isArray(sections)) return {}

  return Object.entries(sections).reduce((acc, [sectionId, isOpen]) => {
    if (sectionId && isOpen) acc[sectionId] = true
    return acc
  }, {})
}

const SOURCE_ID =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `dashboard-${Date.now()}-${Math.random().toString(16).slice(2)}`

let channel = null
let storageListenerAttached = false
let applyingRemoteState = false
let syncPollTimer = null
let focusSyncAttached = false
let lastAppliedSignature = ''
let syncInitialized = false
let desktopSyncUnsubscribe = null
let desktopWindowClosedUnsubscribe = null

const getPopupRegistry = () => {
  if (typeof window === 'undefined') return null
  if (!window.__dashboardPopupRegistry) {
    window.__dashboardPopupRegistry = new Set()
  }
  return window.__dashboardPopupRegistry
}

const normalizeFilters = (filters = {}) => ({
  system: String(filters?.system || '').trim(),
  busqueda: String(filters?.busqueda || ''),
  rangoFechas: {
    from: String(filters?.rangoFechas?.from || ''),
    to: String(filters?.rangoFechas?.to || ''),
  },
  visibleFields: Array.isArray(filters?.visibleFields) ? [...filters.visibleFields] : [],
  values:
    filters?.values && typeof filters.values === 'object' && !Array.isArray(filters.values)
      ? { ...filters.values }
      : {},
})

const toStructuredCloneSafe = (value, fallback) => {
  try {
    return JSON.parse(JSON.stringify(value))
  } catch (error) {
    console.error('[dashboardShared] No fue posible serializar payload:', error)
    return fallback
  }
}

const buildSerializablePayload = ({ type, filtros, externalRefreshTick, openPopoutSections }) => ({
  sourceId: SOURCE_ID,
  type,
  filtros: toStructuredCloneSafe(normalizeFilters(filtros), EMPTY_FILTERS()),
  externalRefreshTick: Number(externalRefreshTick || 0),
  openPopoutSections: toStructuredCloneSafe(normalizeOpenSections(openPopoutSections), {}),
  sentAt: Date.now(),
})

const buildPayloadSignature = (payload) => {
  if (!payload) return ''
  return JSON.stringify({
    sourceId: payload.sourceId,
    type: payload.type,
    filtros: normalizeFilters(payload.filtros),
    externalRefreshTick: Number(payload.externalRefreshTick || 0),
    openPopoutSections: normalizeOpenSections(payload.openPopoutSections),
    sentAt: Number(payload.sentAt || 0),
  })
}

const broadcastToRegisteredPopups = (payload) => {
  if (typeof window === 'undefined') return
  const registry = getPopupRegistry()
  if (!registry?.size) return

  registry.forEach((popupRef) => {
    try {
      if (!popupRef || popupRef.closed) {
        registry.delete(popupRef)
        return
      }

      popupRef.postMessage(
        {
          type: DASHBOARD_POSTMESSAGE_TYPE,
          payload,
        },
        window.location.origin,
      )
    } catch (error) {
      console.error('[dashboardShared] Error enviando postMessage a popup:', error)
    }
  })
}

export const useDashboardSharedStore = defineStore('dashboardShared', {
  state: () => ({
    filtros: EMPTY_FILTERS(),
    externalRefreshTick: 0,
    openPopoutSections: {},
  }),
  actions: {
    initSync() {
      if (syncInitialized || typeof window === 'undefined') return

      syncInitialized = true
      const store = this

      if ('BroadcastChannel' in window && !channel) {
        channel = new BroadcastChannel(DASHBOARD_SYNC_CHANNEL)
        channel.addEventListener('message', (event) => store.handleBroadcastMessage(event))
      }

      if (!storageListenerAttached) {
        window.addEventListener('storage', (event) => store.handleStorageSync(event))
        storageListenerAttached = true
      }

      if (!focusSyncAttached) {
        window.addEventListener('focus', () => store.syncFromStorage())
        document.addEventListener('visibilitychange', () => {
          if (document.visibilityState === 'visible') {
            store.syncFromStorage()
          }
        })
        window.addEventListener('message', (event) => store.handleWindowMessage(event))
        focusSyncAttached = true
      }

      if (window.desktopApp?.isElectron && !desktopSyncUnsubscribe) {
        desktopSyncUnsubscribe = window.desktopApp.onDashboardSync((payload) => {
          store.applyIncomingPayload(payload)
        })
      }

      if (window.desktopApp?.isElectron && !desktopWindowClosedUnsubscribe) {
        desktopWindowClosedUnsubscribe = window.desktopApp.onDashboardWindowClosed((payload) => {
          if (!payload?.sectionId) return
          store.markSectionPopoutClosed(payload.sectionId)
        })
      }

      if (!syncPollTimer) {
        syncPollTimer = window.setInterval(() => {
          store.syncFromStorage()
        }, 1000)
      }

      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: DASHBOARD_POSTMESSAGE_REQUEST }, window.location.origin)
        } catch (error) {
          console.error('[dashboardShared] Error solicitando sync al opener:', error)
        }
      }

      this.syncFromStorage()
      this.publishState('hydrate')
    },

    handleBroadcastMessage(event) {
      this.applyIncomingPayload(event?.data)
    },

    handleWindowMessage(event) {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === DASHBOARD_POSTMESSAGE_TYPE) {
        this.applyIncomingPayload(event.data?.payload)
      }

      if (event.data?.type === DASHBOARD_POSTMESSAGE_REQUEST) {
        const payload = buildSerializablePayload({
          type: 'hydrate',
          filtros: this.filtros,
          externalRefreshTick: this.externalRefreshTick,
          openPopoutSections: this.openPopoutSections,
        })
        event.source?.postMessage(
          {
            type: DASHBOARD_POSTMESSAGE_TYPE,
            payload,
          },
          event.origin,
        )
      }
    },

    handleStorageSync(event) {
      if (event.key !== DASHBOARD_SYNC_CHANNEL || !event.newValue) return

      try {
        const payload = JSON.parse(event.newValue)
        this.applyIncomingPayload(payload)
      } catch (error) {
        console.error('[dashboardShared] Error leyendo sync payload:', error)
      }
    },

    applyIncomingPayload(payload) {
      if (!payload) return
      if (payload.sourceId === SOURCE_ID) {
        return
      }

      const nextSignature = buildPayloadSignature(payload)
      if (nextSignature && nextSignature === lastAppliedSignature) {
        return
      }

      applyingRemoteState = true

      if (payload.type === 'filters' || payload.type === 'hydrate') {
        this.filtros = normalizeFilters(payload.filtros)
      }

      if (payload.type === 'refresh' || payload.type === 'hydrate') {
        this.externalRefreshTick = Number(payload.externalRefreshTick || Date.now())
      }

      if (payload.type === 'popouts' || payload.type === 'hydrate') {
        this.openPopoutSections = normalizeOpenSections(payload.openPopoutSections)
      }

      lastAppliedSignature = nextSignature
      applyingRemoteState = false
    },

    syncFromStorage() {
      if (typeof window === 'undefined') return

      const raw = localStorage.getItem(DASHBOARD_SYNC_CHANNEL)
      if (!raw) {
        return
      }

      try {
        const payload = JSON.parse(raw)
        this.applyIncomingPayload(payload)
      } catch (error) {
        console.error('[dashboardShared] Error sincronizando desde storage:', error)
      }
    },

    setFilters(nextFilters) {
      this.filtros = normalizeFilters(nextFilters)
      this.publishState('filters')
    },

    patchFilters(patch = {}) {
      this.filtros = normalizeFilters({
        ...this.filtros,
        ...patch,
        rangoFechas: {
          ...this.filtros.rangoFechas,
          ...(patch?.rangoFechas || {}),
        },
        values: Object.prototype.hasOwnProperty.call(patch, 'values')
          ? { ...(patch.values || {}) }
          : { ...this.filtros.values },
      })
      this.publishState('filters')
    },

    setSystem(system) {
      this.patchFilters({ system })
    },

    announceRealtimeRefresh() {
      this.externalRefreshTick = Date.now()
      this.publishState('refresh')
    },

    markSectionPopoutOpen(sectionId) {
      if (!sectionId) return

      this.openPopoutSections = normalizeOpenSections({
        ...this.openPopoutSections,
        [sectionId]: true,
      })
      this.publishState('popouts')
    },

    markSectionPopoutClosed(sectionId) {
      if (!sectionId || !this.openPopoutSections?.[sectionId]) return

      const nextSections = { ...this.openPopoutSections }
      delete nextSections[sectionId]
      this.openPopoutSections = normalizeOpenSections(nextSections)
      this.publishState('popouts')
    },

    isSectionPopoutOpen(sectionId) {
      return !!this.openPopoutSections?.[sectionId]
    },

    resetDashboardState({ publish = true } = {}) {
      this.filtros = EMPTY_FILTERS()
      this.externalRefreshTick = 0
      this.openPopoutSections = {}
      lastAppliedSignature = ''

      if (typeof window !== 'undefined') {
        localStorage.removeItem(DASHBOARD_SYNC_CHANNEL)
        localStorage.removeItem(PERSISTED_STORE_KEY)
      }

      if (publish) {
        this.publishState('hydrate')
      }
    },

    publishState(type) {
      if (typeof window === 'undefined' || applyingRemoteState) {
        return
      }

      const payload = buildSerializablePayload({
        type,
        filtros: this.filtros,
        externalRefreshTick: this.externalRefreshTick,
        openPopoutSections: this.openPopoutSections,
      })

      lastAppliedSignature = buildPayloadSignature(payload)

      localStorage.setItem(DASHBOARD_SYNC_CHANNEL, JSON.stringify(payload))
      broadcastToRegisteredPopups(payload)

      try {
        channel?.postMessage(payload)
      } catch (error) {
        console.error('[dashboardShared] Error publicando BroadcastChannel:', error)
      }

      try {
        window.desktopApp?.broadcastDashboardSync?.(payload)
      } catch (error) {
        console.error('[dashboardShared] Error publicando sync por Electron:', error)
      }
    },
  },
  persist: {
    storage: localStorage,
    paths: ['filtros', 'externalRefreshTick'],
  },
})
