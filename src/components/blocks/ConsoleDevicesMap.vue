<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import { useI18n } from 'vue-i18n'
import {
  consolidateMapDevices,
  getEventRawDate,
  getMinutesDiff,
  getMapEventTimestamp,
} from 'src/composables/useMapData'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'

maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

const { t } = useI18n()

const props = defineProps({
  devices: { type: Array, default: () => [] },
  logs: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-device'])

const mapEl = ref(null)
const tooltip = ref({ visible: false, x: 0, y: 0, device: null })
const statusClock = ref(Date.now())
let map = null
let spiderfy = null
let resizeObserver = null
let loaded = false
let clusterCountMarkers = new Map()
let pendingSourceUpdateFrame = null
let statusClockInterval = null

const DEVICE_SOURCE_ID = 'devices-src'
const CLUSTER_LAYER_ID = 'devices-clusters'
const POINT_LAYER_ID = 'devices-point'
const DEFAULT_CENTER = [-99.1332, 19.4326]

const BASE_STYLE = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: '(c) OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'raster-tiles', type: 'raster', source: 'raster-tiles' }],
}

const SEVERITY = {
  STABLE: 'STABLE',
  WARNING: 'WARNING',
  CRITICAL: 'CRITICAL',
  LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
}

const SEVERITY_COLORS = {
  [SEVERITY.STABLE]: '#22c55e',
  [SEVERITY.WARNING]: '#F97316',
  [SEVERITY.CRITICAL]: '#ef4444',
  [SEVERITY.LOGIN_ATTEMPT]: '#A855F7',
}

const DEVICE_CATEGORY = {
  OPERATING: 'OPERATING',
  INCIDENTS: 'INCIDENTS',
  INACTIVE: 'INACTIVE',
  LOGIN_ATTEMPT: 'LOGIN_ATTEMPT',
}

const DEVICE_STATE = {
  [DEVICE_CATEGORY.OPERATING]: {
    status: 'OPERANDO_NORMAL',
    severity: SEVERITY.STABLE,
    color: SEVERITY_COLORS[SEVERITY.STABLE],
    label: 'Operando Normal',
    pulsing: true,
  },
  [DEVICE_CATEGORY.INCIDENTS]: {
    status: 'INCIDENT',
    severity: SEVERITY.CRITICAL,
    color: SEVERITY_COLORS[SEVERITY.CRITICAL],
    label: 'Con Incidentes',
    pulsing: true,
  },
  [DEVICE_CATEGORY.INACTIVE]: {
    status: 'INACTIVE',
    severity: SEVERITY.WARNING,
    color: SEVERITY_COLORS[SEVERITY.WARNING],
    label: 'Inactivo / Sin Red',
    pulsing: false,
  },
  [DEVICE_CATEGORY.LOGIN_ATTEMPT]: {
    status: 'LOGIN_ATTEMPT',
    severity: SEVERITY.LOGIN_ATTEMPT,
    color: SEVERITY_COLORS[SEVERITY.LOGIN_ATTEMPT],
    label: 'Intento de Sesión',
  },
}

function isFailedLog(log = {}) {
  const outcome = String(log?.outcome || '').toUpperCase()
  const status = String(log?.status || '').toUpperCase()
  const level = String(log?.level || '').toUpperCase()
  const severity = String(log?.severity || '').toUpperCase()
  return (
    log?.isError === true ||
    outcome === 'FAILURE' ||
    status === 'REJECTED' ||
    status === 'ERROR' ||
    level === 'ERROR' ||
    level === 'CRITICAL' ||
    severity === 'ERROR' ||
    severity === 'CRITICAL'
  )
}

function getLogTimestamp(log = {}) {
  return getMapEventTimestamp(log)
}

function getUserLatestLog(device = {}) {
  const events = Array.isArray(device?.events) ? device.events : device?.recentLogs || []
  return events.reduce((latest, event) => {
    if (!latest) return event
    return getLogTimestamp(event) > getLogTimestamp(latest) ? event : latest
  }, null)
}

function calculateDeviceStatus(device = {}) {
  const events = Array.isArray(device?.events) ? device.events : device?.recentLogs || []
  const lastLog = getUserLatestLog(device)
  const lastTime = getEventRawDate(lastLog) || device?.lastEventTime || device?.lastSeen
  const minutesAgo = getMinutesDiff(lastTime, statusClock.value)

  console.log(
    `[MAPA DEBUG] Dispositivo: ${device?.actorName || device?.name || device?.deviceId || device?.id || '-'} | Último Log: ${lastTime || '-'} | Hace: ${minutesAgo} mins`,
  )

  if (minutesAgo > 15) {
    return { ...DEVICE_STATE[DEVICE_CATEGORY.INACTIVE], category: DEVICE_CATEGORY.INACTIVE, lastLog }
  }

  const hasRecentError = events.some(
    (event) =>
      getMinutesDiff(getEventRawDate(event), statusClock.value) <= 15 && isFailedLog(event),
  )
  if (hasRecentError) {
    return { ...DEVICE_STATE[DEVICE_CATEGORY.INCIDENTS], category: DEVICE_CATEGORY.INCIDENTS, lastLog }
  }

  return {
    ...DEVICE_STATE[DEVICE_CATEGORY.OPERATING],
    status: 'OPERANDO_NORMAL',
    label: 'Operando Normal',
    category: DEVICE_CATEGORY.OPERATING,
    lastLog,
  }
}

function getDeviceSeverity(device = {}) {
  return device?.realtimeState?.severity || calculateDeviceStatus(device).severity
}

const realtimeDevices = computed(() =>
  consolidateMapDevices(props.devices, props.logs).map((device) => {
    const realtimeState = calculateDeviceStatus(device)
    const latest = realtimeState.lastLog || {}
    const latestLat = Number(latest?.lat ?? latest?.latitude ?? latest?.location?.latitude)
    const latestLon = Number(
      latest?.lon ?? latest?.lng ?? latest?.longitude ?? latest?.location?.longitude,
    )

    return {
      ...device,
      lat: Number.isFinite(latestLat) ? latestLat : device?.lat,
      lon: Number.isFinite(latestLon) ? latestLon : device?.lon,
      lastSeen:
        latest?.eventTime ||
        latest?.fechaHoraDia ||
        latest?.createdAt ||
        latest?.timestamp ||
        device?.lastSeen ||
        '',
      realtimeState,
    }
  }),
)

const validDevices = computed(() =>
  realtimeDevices.value.filter((d) => {
    const lat = Number(d?.lat)
    const lon = Number(d?.lon)
    return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
  }),
)

const DEVICE_FILTER = {
  ALL: 'all',
  INCIDENTS: 'incidents',
  NORMAL: 'normal',
  INACTIVE: 'inactive',
}

const activeFilter = ref(DEVICE_FILTER.ALL)

const filteredDevices = computed(() => {
  if (activeFilter.value === DEVICE_FILTER.ALL) return validDevices.value

  return validDevices.value.filter((device) => {
    const category = device.realtimeState.category

    switch (activeFilter.value) {
      case DEVICE_FILTER.INCIDENTS:
        return category === DEVICE_CATEGORY.INCIDENTS
      case DEVICE_FILTER.NORMAL:
        return category === DEVICE_CATEGORY.OPERATING
      case DEVICE_FILTER.INACTIVE:
        return category === DEVICE_CATEGORY.INACTIVE
      default:
        return true
    }
  })
})

const devicesGeojson = computed(() => ({
  type: 'FeatureCollection',
  features: filteredDevices.value.map((device, index) => {
    const realtimeState = device.realtimeState
    const status = realtimeState.status
    const severity = realtimeState.severity
    return {
      type: 'Feature',
      id: device?.deviceId || `${index}-${device?.lat}-${device?.lon}`,
      geometry: { type: 'Point', coordinates: [Number(device.lon), Number(device.lat)] },
      properties: {
        deviceId: device?.deviceId || '',
        hostname: device?.hostname || '',
        system: device?.system || '',
        status,
        severity,
        category: realtimeState.category,
        actorName: device?.actorName || '',
        statusLabel: realtimeState.label,
        pulsing: realtimeState.pulsing === true,
        hasError: realtimeState.category === DEVICE_CATEGORY.INCIDENTS,
        errorCount: Number(device?.errorCount || 0),
        errorRate: Number(device?.errorRate || 0),
        ip: device?.ip || '',
        locationName: device?.locationName || '',
        lastSeen: device?.lastSeen || '',
        isLoginAttempt: false,
        lat: Number(device.lat),
        lon: Number(device.lon),
      },
    }
  }),
}))

function emitDeviceSelection(properties = {}) {
  emit('select-device', {
    deviceId: properties.deviceId || '',
    hostname: properties.hostname || '',
    system: properties.system || '',
    status: properties.status || '',
    severity: properties.severity || SEVERITY.STABLE,
    hasError: properties.hasError === true || properties.hasError === 'true',
    errorCount: Number(properties.errorCount || 0),
    errorRate: Number(properties.errorRate || 0),
    ip: properties.ip || '',
    locationName: properties.locationName || '',
    lastSeen: properties.lastSeen || '',
    lat: Number(properties.lat),
    lon: Number(properties.lon),
  })
}

function buildTooltipDevice(properties = {}) {
  const severity = properties.severity || SEVERITY.STABLE
  const color = SEVERITY_COLORS[severity]
  const [statusLabel, severityLabel = ''] = String(properties.statusLabel || '').split('•')
  return {
    color,
    deviceId: properties.deviceId || '-',
    ip: properties.ip || '-',
    lastSeen: properties.lastSeen ? new Date(properties.lastSeen).toLocaleString() : '-',
    locationName: properties.locationName || '',
    name:
      properties.actorName ||
      (properties.isLoginAttempt === true || properties.isLoginAttempt === 'true'
        ? `Dispositivo: ${String(properties.deviceId || '').replace(/^EE-/i, '').toLowerCase()}`
        : properties.hostname || properties.deviceId || '-'),
    statusLabel: statusLabel.trim(),
    severityLabel: severityLabel.trim(),
    severity,
    isLoginAttempt: properties.isLoginAttempt === true || properties.isLoginAttempt === 'true',
    latestLoginType: properties.latestLoginType || '',
    latestLoginTime: properties.latestLoginTime
      ? new Date(properties.latestLoginTime).toLocaleTimeString('es-MX', {
          hour: 'numeric',
          minute: '2-digit',
        })
      : '',
    failedLoginCount: Number(properties.failedLoginCount || 0),
  }
}

function getTooltipPoint(feature, event) {
  if (event?.point) return event.point
  const coords = feature?.geometry?.coordinates
  if (map && Array.isArray(coords)) return map.project(coords)
  return null
}

function showDeviceTooltip(point, properties) {
  if (!point) return
  tooltip.value = {
    visible: true,
    x: point.x,
    y: point.y,
    device: buildTooltipDevice(properties),
  }
}

function hideDeviceTooltip() {
  tooltip.value = { visible: false, x: 0, y: 0, device: null }
}

function closeActiveSpiderfy() {
  if (!spiderfy) return
  if (typeof spiderfy._clearSpiderifiedCluster === 'function') {
    spiderfy._clearSpiderifiedCluster()
    return
  }

  spiderfy.unspiderfyAll?.()
  initSpiderfy()
}



function createCircleImage(
  fill,
  { size = 40, stroke = '#fff', ring = false, pulse = false, key = false } = {},
) {
  const canvas = document.createElement('canvas')
  const scale = window.devicePixelRatio || 1
  canvas.width = size * scale
  canvas.height = size * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  const center = size / 2
  if (pulse) {
    ctx.beginPath()
    ctx.arc(center, center, size * 0.42, 0, Math.PI * 2)
    ctx.fillStyle = fill
    ctx.globalAlpha = 0.22
    ctx.fill()
    ctx.globalAlpha = 1
  }

  if (ring || pulse) {
    ctx.beginPath()
    ctx.arc(center, center, size * 0.38, 0, Math.PI * 2)
    ctx.strokeStyle = fill
    ctx.globalAlpha = pulse ? 0.55 : 0.35
    ctx.lineWidth = 3
    ctx.stroke()
    ctx.globalAlpha = 1
  }

  ctx.beginPath()
  ctx.arc(center, center, size * 0.25, 0, Math.PI * 2)
  ctx.fillStyle = fill
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = stroke
  ctx.stroke()

  if (key) {
    ctx.strokeStyle = '#fff'
    ctx.fillStyle = '#fff'
    ctx.lineWidth = 2
    ctx.beginPath()
    ctx.arc(center - 3, center - 2, 3, 0, Math.PI * 2)
    ctx.stroke()
    ctx.beginPath()
    ctx.moveTo(center, center)
    ctx.lineTo(center + 6, center + 6)
    ctx.lineTo(center + 8, center + 4)
    ctx.moveTo(center + 4, center + 4)
    ctx.lineTo(center + 6, center + 2)
    ctx.stroke()
  }

  return {
    width: canvas.width,
    height: canvas.height,
    data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
  }
}

function createClusterImage(fill) {
  const size = 46
  const canvas = document.createElement('canvas')
  const scale = window.devicePixelRatio || 1
  canvas.width = size * scale
  canvas.height = size * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  const gradient = ctx.createLinearGradient(0, 0, size, size)
  gradient.addColorStop(0, fill[0])
  gradient.addColorStop(1, fill[1])
  ctx.beginPath()
  ctx.arc(size / 2, size / 2, size / 2 - 3, 0, Math.PI * 2)
  ctx.fillStyle = gradient
  ctx.fill()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#fff'
  ctx.stroke()

  return {
    width: canvas.width,
    height: canvas.height,
    data: ctx.getImageData(0, 0, canvas.width, canvas.height).data,
  }
}

function ensureImages() {
  if (!map) return

  const images = {
    'device-stable': createCircleImage(SEVERITY_COLORS[SEVERITY.STABLE], {
      ring: true,
      pulse: true,
    }),
    'device-warning': createCircleImage(SEVERITY_COLORS[SEVERITY.WARNING], { ring: true }),
    'device-critical': createCircleImage(SEVERITY_COLORS[SEVERITY.CRITICAL], { pulse: true }),
    'device-login-attempt': createCircleImage(SEVERITY_COLORS[SEVERITY.LOGIN_ATTEMPT], {
      ring: true,
      pulse: true,
      key: true,
    }),
    'device-cluster-stable': createClusterImage([SEVERITY_COLORS[SEVERITY.STABLE], '#16a34a']),
    'device-cluster-warning': createClusterImage([SEVERITY_COLORS[SEVERITY.WARNING], '#d97706']),
    'device-cluster-critical': createClusterImage([SEVERITY_COLORS[SEVERITY.CRITICAL], '#b91c1c']),
    'device-cluster-login-attempt': createClusterImage([
      SEVERITY_COLORS[SEVERITY.LOGIN_ATTEMPT],
      '#7e22ce',
    ]),
    'device-cluster-mixed': createClusterImage(['#3b82f6', '#1d4ed8']),
  }

  for (const [id, image] of Object.entries(images)) {
    if (!map.hasImage(id)) map.addImage(id, image, { pixelRatio: window.devicePixelRatio || 1 })
  }
}

function addLayers() {
  if (!map || map.getSource(DEVICE_SOURCE_ID)) return

  map.addSource(DEVICE_SOURCE_ID, {
    type: 'geojson',
    data: devicesGeojson.value,
    cluster: true,
    clusterMaxZoom: 16,
    clusterRadius: 60,
    clusterProperties: {
      online: ['+', ['case', ['==', ['get', 'status'], 'OPERANDO_NORMAL'], 1, 0]],
      critical: ['+', ['case', ['==', ['get', 'severity'], SEVERITY.CRITICAL], 1, 0]],
      warning: ['+', ['case', ['==', ['get', 'severity'], SEVERITY.WARNING], 1, 0]],
      stable: ['+', ['case', ['==', ['get', 'severity'], SEVERITY.STABLE], 1, 0]],
      loginAttempts: ['+', ['case', ['==', ['get', 'severity'], SEVERITY.LOGIN_ATTEMPT], 1, 0]],
    },
  })

  const clusterSeverityIcon = [
    'case',
    ['>', ['get', 'loginAttempts'], 0],
    'device-cluster-login-attempt',
    ['>', ['get', 'critical'], 0],
    'device-cluster-critical',
    ['>', ['get', 'warning'], 0],
    'device-cluster-warning',
    ['>', ['get', 'stable'], 0],
    'device-cluster-stable',
    'device-cluster-mixed',
  ]

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'symbol',
    source: DEVICE_SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'icon-image': clusterSeverityIcon,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
  })

  const pointSeverityIcon = [
    'case',
    ['==', ['get', 'severity'], SEVERITY.LOGIN_ATTEMPT],
    'device-login-attempt',
    ['==', ['get', 'severity'], SEVERITY.CRITICAL],
    'device-critical',
    ['==', ['get', 'severity'], SEVERITY.WARNING],
    'device-warning',
    'device-stable',
  ]

  map.addLayer({
    id: POINT_LAYER_ID,
    type: 'symbol',
    source: DEVICE_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': pointSeverityIcon,
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
  })

  bindMapEvents()
  initSpiderfy()
  fitBounds()
}

function handleDeviceClick(properties = {}, point = null) {
  if (point) showDeviceTooltip(point, properties)
  emitDeviceSelection(properties)
}

function initSpiderfy() {
  spiderfy?.unspiderfyAll?.()
  spiderfy = new Spiderfy(map, {
    closeOnLeafClick: true,
    forceSpiderifyMinZoom: 12,
    spiderLegsColor: 'rgba(255,255,255,0.65)',
    spiderLegsWidth: 2,
    circleOptions: { leavesSeparation: 54 },
    spiralOptions: { legLengthStart: 32, legLengthFactor: 2.4, leavesSeparation: 32 },
    renderMethod: '3D',
    spiderLeavesLayout: {
      'icon-image': [
        'case',
        ['==', ['get', 'severity'], SEVERITY.LOGIN_ATTEMPT],
        'device-login-attempt',
        ['==', ['get', 'severity'], SEVERITY.CRITICAL],
        'device-critical',
        ['==', ['get', 'severity'], SEVERITY.WARNING],
        'device-warning',
        'device-stable',
      ],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
    onLeafClick: (feature) => {
      handleDeviceClick(
        feature?.properties || {},
        getTooltipPoint(feature),
      )
    },
    onLeafHover: (feature, event) => {
      if (!feature) {
        hideDeviceTooltip()
        return
      }
      showDeviceTooltip(getTooltipPoint(feature, event), feature.properties || {})
    },
  })
  spiderfy.applyTo(CLUSTER_LAYER_ID)
}

function bindMapEvents() {
  if (!map) return

  map.on('click', POINT_LAYER_ID, (event) => {
    const feature = event.features?.[0]
    if (feature) {
      handleDeviceClick(feature.properties || {}, getTooltipPoint(feature, event))
    }
  })

  map.on('mousemove', POINT_LAYER_ID, (event) => {
    map.getCanvas().style.cursor = 'pointer'
    const feature = event.features?.[0]
    if (feature) showDeviceTooltip(getTooltipPoint(feature, event), feature.properties || {})
  })

  map.on('mouseleave', POINT_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
    hideDeviceTooltip()
  })

  map.on('mouseenter', CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
  })

  map.on('movestart', hideDeviceTooltip)
  map.on('zoomstart', hideDeviceTooltip)
  map.on('idle', syncClusterCountMarkers)
  map.on('moveend', syncClusterCountMarkers)
  map.on('zoomend', syncClusterCountMarkers)
}

function clearClusterCountMarkers() {
  for (const marker of clusterCountMarkers.values()) marker.remove()
  clusterCountMarkers = new Map()
}

function syncClusterCountMarkers() {
  if (!map || !loaded || !map.getLayer(CLUSTER_LAYER_ID)) {
    clearClusterCountMarkers()
    return
  }

  const features = map.queryRenderedFeatures({ layers: [CLUSTER_LAYER_ID] })
  const visibleKeys = new Set()

  for (const feature of features) {
    const coords = feature.geometry?.coordinates
    const props = feature.properties || {}
    if (!Array.isArray(coords)) continue

    const key = String(props.cluster_id ?? `${coords[0]},${coords[1]}`)
    const count = String(props.point_count ?? '')
    if (!count) continue

    visibleKeys.add(key)
    let marker = clusterCountMarkers.get(key)
    if (!marker) {
      const el = document.createElement('div')
      el.className = 'cdm-cluster-count'
      el.textContent = count
      marker = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map)
      clusterCountMarkers.set(key, marker)
    } else {
      marker.getElement().textContent = count
      marker.setLngLat(coords)
    }
  }

  for (const [key, marker] of clusterCountMarkers.entries()) {
    if (!visibleKeys.has(key)) {
      marker.remove()
      clusterCountMarkers.delete(key)
    }
  }
}

function updateSourceData() {
  if (!map || !loaded) return

  if (pendingSourceUpdateFrame) cancelAnimationFrame(pendingSourceUpdateFrame)
  pendingSourceUpdateFrame = requestAnimationFrame(() => {
    pendingSourceUpdateFrame = null
    if (!map || !loaded) return

    const source = map.getSource(DEVICE_SOURCE_ID)
    if (!source) return

    hideDeviceTooltip()
    closeActiveSpiderfy()
    source.setData(devicesGeojson.value)
    syncClusterCountMarkers()
    map.once('idle', syncClusterCountMarkers)
  })
}

function fitBounds() {
  if (!map || !validDevices.value.length) return
  const bounds = new maplibregl.LngLatBounds()
  validDevices.value.forEach((device) => bounds.extend([Number(device.lon), Number(device.lat)]))
  if (validDevices.value.length === 1) {
    const device = validDevices.value[0]
    map.jumpTo({ center: [Number(device.lon), Number(device.lat)], zoom: 12 })
    return
  }
  map.fitBounds(bounds, { padding: 50, maxZoom: 12, duration: 0 })
}

function fitBoundsToIncidents() {
  const incidentDevices = validDevices.value.filter((device) => {
    const severity = getDeviceSeverity(device)
    return severity === SEVERITY.CRITICAL
  })

  if (!incidentDevices.length) return

  if (incidentDevices.length === 1) {
    const device = incidentDevices[0]
    map?.easeTo({ center: [Number(device.lon), Number(device.lat)], zoom: 13, duration: 700 })
    return
  }

  const bounds = new maplibregl.LngLatBounds()
  incidentDevices.forEach((device) => bounds.extend([Number(device.lon), Number(device.lat)]))
  map?.fitBounds(bounds, { padding: 80, maxZoom: 14, duration: 700 })
}

async function initMap() {
  await nextTick()
  if (!mapEl.value || map) return

  map = new maplibregl.Map({
    container: mapEl.value,
    style: BASE_STYLE,
    center: DEFAULT_CENTER,
    zoom: 5,
    maxZoom: 19,
    renderWorldCopies: false,
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

  resizeObserver = new ResizeObserver(() => {
    if (!map) return
    requestAnimationFrame(() => {
      map?.resize()
      syncClusterCountMarkers()
    })
  })
  resizeObserver.observe(mapEl.value)

  map.once('load', () => {
    loaded = true
    ensureImages()
    addLayers()
  })
}

watch(devicesGeojson, updateSourceData)

watch(activeFilter, (filter) => {
  if (filter === DEVICE_FILTER.INCIDENTS) {
    nextTick(() => setTimeout(fitBoundsToIncidents, 150))
  }
})

onMounted(() => {
  statusClockInterval = setInterval(() => {
    statusClock.value = Date.now()
  }, 30_000)
  initMap()
})

onBeforeUnmount(() => {
  if (statusClockInterval) {
    clearInterval(statusClockInterval)
    statusClockInterval = null
  }
  if (pendingSourceUpdateFrame) {
    cancelAnimationFrame(pendingSourceUpdateFrame)
    pendingSourceUpdateFrame = null
  }
  resizeObserver?.disconnect()
  resizeObserver = null
  hideDeviceTooltip()
  spiderfy?.unspiderfyAll?.()
  spiderfy = null
  clearClusterCountMarkers()
  if (map) {
    map.remove()
    map = null
  }
  loaded = false
})
</script>

<template>
  <div class="cdm-map-shell">
    <div class="cdm-filter-bar row items-center q-gutter-sm q-mb-md">
      <q-btn
        dense
        no-caps
        unelevated
        :color="activeFilter === DEVICE_FILTER.ALL ? 'primary' : 'grey-8'"
        text-color="white"
        label="Todos"
        class="cdm-filter-btn"
        @click="activeFilter = DEVICE_FILTER.ALL"
      />
      <q-btn
        dense
        no-caps
        unelevated
        :color="activeFilter === DEVICE_FILTER.INCIDENTS ? 'negative' : 'grey-8'"
        text-color="white"
        icon="warning"
        label="Con Incidentes"
        class="cdm-filter-btn"
        @click="activeFilter = DEVICE_FILTER.INCIDENTS"
      />
      <q-btn
        dense
        no-caps
        unelevated
        :color="activeFilter === DEVICE_FILTER.NORMAL ? 'positive' : 'grey-8'"
        text-color="white"
        icon="check_circle"
        label="Operando Normal"
        class="cdm-filter-btn"
        @click="activeFilter = DEVICE_FILTER.NORMAL"
      />
      <q-btn
        dense
        no-caps
        unelevated
        :color="activeFilter === DEVICE_FILTER.INACTIVE ? 'orange-8' : 'grey-8'"
        text-color="white"
        icon="wifi_off"
        label="Inactivos / Sin Red"
        class="cdm-filter-btn"
        @click="activeFilter = DEVICE_FILTER.INACTIVE"
      />
    </div>
    <div ref="mapEl" class="cdm-map" />
    <div
      v-if="tooltip.visible && tooltip.device"
      class="cdm-popup"
      :style="{ left: `${tooltip.x}px`, top: `${tooltip.y}px` }"
    >
      <div class="cdm-popup__header">
        <span class="cdm-popup__dot" :style="{ background: tooltip.device.color }"></span>
        <strong class="cdm-popup__name">{{ tooltip.device.name }}</strong>
      </div>
      <div class="cdm-popup__id">{{ tooltip.device.deviceId }}</div>
      <template v-if="tooltip.device.isLoginAttempt">
        <div class="cdm-popup__row">
          Último intento: {{ tooltip.device.latestLoginType || '-' }}
          <span v-if="tooltip.device.latestLoginTime">({{ tooltip.device.latestLoginTime }})</span>
        </div>
        <div class="cdm-popup__status" :style="{ color: tooltip.device.color }">
          <div class="cdm-popup__login-badge">Intento de Sesión</div>
          {{ tooltip.device.failedLoginCount }} intentos fallidos en este punto
        </div>
      </template>
      <template v-else>
      <div class="cdm-popup__row">
        <span class="cdm-popup__label">{{ t('dashboard.devicesMapIp') }}:</span>
        {{ tooltip.device.ip }}
      </div>
      <div v-if="tooltip.device.locationName" class="cdm-popup__row">
        <span class="cdm-popup__label">{{ t('dashboard.devicesMapLocation') }}:</span>
        {{ tooltip.device.locationName }}
      </div>
      <div class="cdm-popup__row">
        <span class="cdm-popup__label">{{ t('dashboard.devicesMapLastSeen') }}:</span>
        {{ tooltip.device.lastSeen }}
      </div>
      <div class="cdm-popup__status" :style="{ color: tooltip.device.color }">
        {{ tooltip.device.statusLabel }}
        <span v-if="tooltip.device.severityLabel" class="cdm-popup__severity">
          • {{ tooltip.device.severityLabel }}
        </span>
      </div>
      </template>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cdm-map-shell {
  position: relative;
}

.cdm-filter-bar {
  flex-wrap: wrap;
}

.cdm-filter-btn {
  border-radius: 20px;
  padding: 4px 14px;
  font-size: 0.8rem;
  font-weight: 600;
}

.cdm-map {
  width: 100%;
  height: 520px;
  border-radius: 12px;
  overflow: hidden;
}
</style>

<style lang="scss">
.cdm-cluster-count {
  align-items: center;
  color: #fff;
  display: flex;
  font-size: 14px;
  font-weight: 800;
  height: 46px;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  user-select: none;
  width: 46px;
}

.cdm-popup {
  background: rgba(10, 14, 26, 0.96);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 10px;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45);
  color: #fff;
  font-size: 12px;
  min-width: 170px;
  padding: 12px 14px;
  pointer-events: none;
  position: absolute;
  transform: translate(-50%, calc(-100% - 18px));
  z-index: 5;

  &__header {
    display: flex;
    align-items: center;
    gap: 6px;
    margin-bottom: 4px;
  }

  &__dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    flex-shrink: 0;
  }

  &__name {
    color: #fff;
    font-size: 13px;
    font-weight: 700;
    line-height: 1.2;
  }

  &__id {
    color: rgba(255, 255, 255, 0.45);
    font-size: 11px;
    margin-bottom: 6px;
    margin-left: 14px;
  }

  &__row {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 3px;
  }

  &__label {
    color: rgba(255, 255, 255, 0.45);
    margin-right: 2px;
  }

  &__status {
    font-size: 12px;
    font-weight: 700;
    margin-top: 8px;
  }

  &__severity {
    font-weight: 500;
    opacity: 0.85;
  }

  &__login-badge {
    background: #a855f7;
    border-radius: 999px;
    color: #fff;
    display: inline-block;
    margin-bottom: 6px;
    padding: 3px 8px;
  }
}
</style>
