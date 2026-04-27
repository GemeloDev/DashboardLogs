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

const SOURCE_ID =
  typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
    ? crypto.randomUUID()
    : `dashboard-${Date.now()}-${Math.random().toString(16).slice(2)}`

let channel = null
let storageListenerAttached = false
let applyingRemoteState = false
let syncPollTimer = null
let focusSyncAttached = false
let lastAppliedTimestamp = 0

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

const buildSerializablePayload = ({ type, filtros, externalRefreshTick }) => ({
  sourceId: SOURCE_ID,
  type,
  filtros: toStructuredCloneSafe(normalizeFilters(filtros), EMPTY_FILTERS()),
  externalRefreshTick: Number(externalRefreshTick || 0),
  sentAt: Date.now(),
})

const logSync = (message, details = undefined) => {
  if (typeof window === 'undefined') return
  const windowLabel = window.name || 'main-window'
  if (details === undefined) {
    console.info(`[dashboardShared][${windowLabel}] ${message}`)
    return
  }
  console.info(`[dashboardShared][${windowLabel}] ${message}`, details)
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
    syncReady: false,
  }),
  actions: {
    initSync() {
      if (this.syncReady || typeof window === 'undefined') return

      this.syncReady = true
      const store = this
      logSync('initSync:start', { sourceId: SOURCE_ID })

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

      if (!syncPollTimer) {
        syncPollTimer = window.setInterval(() => {
          store.syncFromStorage()
        }, 1000)
      }

      if (window.opener && !window.opener.closed) {
        try {
          window.opener.postMessage({ type: DASHBOARD_POSTMESSAGE_REQUEST }, window.location.origin)
          logSync('initSync:request-opener-state')
        } catch (error) {
          console.error('[dashboardShared] Error solicitando sync al opener:', error)
        }
      }

      this.syncFromStorage()
      logSync('initSync:publish-hydrate', {
        filtros: this.filtros,
        externalRefreshTick: this.externalRefreshTick,
      })
      this.publishState('hydrate')
    },

    handleBroadcastMessage(event) {
      logSync('handleBroadcastMessage', event?.data)
      this.applyIncomingPayload(event?.data)
    },

    handleWindowMessage(event) {
      if (event.origin !== window.location.origin) return

      if (event.data?.type === DASHBOARD_POSTMESSAGE_TYPE) {
        logSync('handleWindowMessage:payload', event.data?.payload)
        this.applyIncomingPayload(event.data?.payload)
      }

      if (event.data?.type === DASHBOARD_POSTMESSAGE_REQUEST) {
        const payload = buildSerializablePayload({
          type: 'hydrate',
          filtros: this.filtros,
          externalRefreshTick: this.externalRefreshTick,
        })
        logSync('handleWindowMessage:request', payload)
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
        logSync('handleStorageSync', payload)
        this.applyIncomingPayload(payload)
      } catch (error) {
        console.error('[dashboardShared] Error leyendo sync payload:', error)
      }
    },

    applyIncomingPayload(payload) {
      if (!payload) return
      if (payload.sourceId === SOURCE_ID) {
        logSync('applyIncomingPayload:skip-self', payload)
        return
      }
      if (payload.sentAt && payload.sentAt <= lastAppliedTimestamp) {
        logSync('applyIncomingPayload:skip-stale', {
          payloadSentAt: payload.sentAt,
          lastAppliedTimestamp,
          type: payload.type,
        })
        return
      }

      applyingRemoteState = true

      if (payload.type === 'filters' || payload.type === 'hydrate') {
        this.filtros = normalizeFilters(payload.filtros)
      }

      if (payload.type === 'refresh' || payload.type === 'hydrate') {
        this.externalRefreshTick = Number(payload.externalRefreshTick || Date.now())
      }

      lastAppliedTimestamp = Number(payload.sentAt || Date.now())
      logSync('applyIncomingPayload:applied', {
        type: payload.type,
        filtros: this.filtros,
        externalRefreshTick: this.externalRefreshTick,
        lastAppliedTimestamp,
      })
      applyingRemoteState = false
    },

    syncFromStorage() {
      if (typeof window === 'undefined') return

      const raw = localStorage.getItem(DASHBOARD_SYNC_CHANNEL)
      if (!raw) {
        logSync('syncFromStorage:no-payload')
        return
      }

      try {
        const payload = JSON.parse(raw)
        logSync('syncFromStorage:read', payload)
        this.applyIncomingPayload(payload)
      } catch (error) {
        console.error('[dashboardShared] Error sincronizando desde storage:', error)
      }
    },

    setFilters(nextFilters) {
      this.filtros = normalizeFilters(nextFilters)
      logSync('setFilters', this.filtros)
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
      logSync('patchFilters', { patch, filtros: this.filtros })
      this.publishState('filters')
    },

    setSystem(system) {
      this.patchFilters({ system })
    },

    announceRealtimeRefresh() {
      this.externalRefreshTick = Date.now()
      logSync('announceRealtimeRefresh', {
        externalRefreshTick: this.externalRefreshTick,
        filtros: this.filtros,
      })
      this.publishState('refresh')
    },

    publishState(type) {
      if (typeof window === 'undefined' || applyingRemoteState) {
        logSync('publishState:skip', { type, applyingRemoteState })
        return
      }

      const payload = buildSerializablePayload({
        type,
        filtros: this.filtros,
        externalRefreshTick: this.externalRefreshTick,
      })

      lastAppliedTimestamp = Number(payload.sentAt || Date.now())
      logSync('publishState', payload)

      localStorage.setItem(DASHBOARD_SYNC_CHANNEL, JSON.stringify(payload))
      broadcastToRegisteredPopups(payload)

      try {
        channel?.postMessage(payload)
      } catch (error) {
        console.error('[dashboardShared] Error publicando BroadcastChannel:', error)
      }
    },
  },
  persist: {
    storage: localStorage,
    paths: ['filtros', 'externalRefreshTick'],
  },
})
