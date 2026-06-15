<script setup>
import { computed, inject, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import { useI18n } from 'vue-i18n'
import { useQuasar } from 'quasar'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'
import quintanaRooGeoJson from 'src/data/quintanaRoo.json'

maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

const { t } = useI18n()
const $q = useQuasar()
const injectedGeoData = inject('dashboardGeoData', ref(null))
const injectedDevicesData = inject('dashboardDevicesData', ref(null))
const logsGlobales = inject('logsGlobales', ref([]))
const openConsole = inject('openConsole', null)

const props = defineProps({
  points: {
    type: Array,
    default: () => [],
  },
  devices: {
    type: Array,
    default: () => [],
  },
})

const mapEl = ref(null)
const mapMode = ref('points')
const deviceTooltip = ref({ visible: false, x: 0, y: 0, device: null })

let map = null
let loaded = false
let spiderfy = null
let resizeObserver = null
let eventPopup = null
let eventClusterMarkers = new Map()
let deviceClusterMarkers = new Map()
let pendingEventSourceFrame = null
let pendingDeviceSourceFrame = null

const EVENT_SOURCE_ID = 'qr-events-src'
const EVENT_CLUSTER_LAYER_ID = 'qr-events-clusters'
const EVENT_POINT_LAYER_ID = 'qr-events-point'
const HEAT_LAYER_ID = 'qr-events-heat'
const DEVICE_SOURCE_ID = 'qr-devices-src'
const DEVICE_CLUSTER_LAYER_ID = 'qr-devices-clusters'
const DEVICE_POINT_LAYER_ID = 'qr-devices-point'
const RASTER_LAYER_ID = 'raster-tiles'
const STATE_MASK_LAYER_ID = 'qr-mask-fill'
const STATE_OUTLINE_LAYER_ID = 'qr-outline'
const DEVICE_CONSOLE_RADIUS_KM = 5

const mapModeOptions = computed(() => [
  { label: t('dashboard.mapType_points'), value: 'points' },
  { label: t('dashboard.mapType_heat'), value: 'heat' },
  { label: t('dashboard.mapType_devices'), value: 'devices' },
])

const activePoints = computed(() => {
  const source = props.points?.length ? props.points : injectedGeoData.value?.points || []
  const grouped = new Map()

  for (const point of source) {
    const normalized = normalizeGeoPoint(point)
    if (!normalized || !isInsideQuintanaRoo(normalized.lat, normalized.lon)) continue

    const key = getGeoPointGroupKey(normalized)
    const current = grouped.get(key)
    if (current) {
      current.count += normalized.count
      continue
    }

    grouped.set(key, normalized)
  }

  return [...grouped.values()]
})

const activeDevices = computed(() => {
  const source = props.devices?.length ? props.devices : injectedDevicesData.value?.devices || []
  return source
    .map(normalizeDevicePoint)
    .filter((device) => device && isInsideQuintanaRoo(device.lat, device.lon))
})

const hasActivePoints = computed(() => activePoints.value.length > 0)
const hasActiveDevices = computed(() => activeDevices.value.length > 0)

const eventsGeojson = computed(() => {
  const points = activePoints.value
  const maxCount = points.length ? Math.max(...points.map((p) => p.count || 1)) : 1

  const magOf = (count) => {
    if (maxCount <= 1) return 1
    return 1 + ((count - 1) * 5) / (maxCount - 1)
  }

  return {
    type: 'FeatureCollection',
    features: points.map((point, index) => ({
      type: 'Feature',
      id: `event-${index}-${point.lat}-${point.lon}`,
      geometry: { type: 'Point', coordinates: [point.lon, point.lat] },
      properties: {
        count: point.count || 1,
        mag: magOf(point.count || 1),
        locationName: point.locationName,
        zoneName: point.zoneName,
      },
    })),
  }
})

const devicesGeojson = computed(() => ({
  type: 'FeatureCollection',
  features: activeDevices.value.map((device, index) => ({
    type: 'Feature',
    id: device.deviceId || `device-${index}-${device.lat}-${device.lon}`,
    geometry: { type: 'Point', coordinates: [device.lon, device.lat] },
    properties: {
      deviceId: device.deviceId,
      hostname: device.hostname,
      system: device.system,
      status: device.status,
      ip: device.ip,
      locationName: device.locationName,
      lastSeen: device.lastSeen,
      lat: device.lat,
      lon: device.lon,
    },
  })),
}))

function isValidCoordinate(lat, lon) {
  return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
}

function normalizeGeoPoint(point = {}) {
  const lat = Number(point?.lat ?? point?.latitude)
  const lon = Number(point?.lon ?? point?.lng ?? point?.longitude)
  if (!isValidCoordinate(lat, lon)) return null

  const count = Number(point?.count ?? point?.weight ?? point?.total ?? point?.records ?? 1)
  return {
    lat,
    lon,
    count: Number.isFinite(count) && count > 0 ? count : 1,
    locationName: point?.locationName || point?.location || point?.name || '',
    zoneName: point?.zoneName || point?.zone || point?.municipality || point?.area || '',
  }
}

function getGeoPointGroupKey(point) {
  const locationKey = String(point.locationName || point.zoneName || '').trim().toUpperCase()
  return locationKey || `${point.lat.toFixed(5)},${point.lon.toFixed(5)}`
}

function normalizeDevicePoint(device = {}) {
  const lat = Number(device?.lat ?? device?.latitude)
  const lon = Number(device?.lon ?? device?.lng ?? device?.longitude)
  if (!isValidCoordinate(lat, lon)) return null

  return {
    lat,
    lon,
    deviceId: device?.deviceId || '',
    hostname: device?.hostname || '',
    system: device?.system || '',
    status: isActiveDeviceStatus(device?.status) ? 'ONLINE' : 'OFFLINE',
    ip: device?.ip || '',
    locationName: device?.locationName || device?.location || '',
    lastSeen: device?.lastSeen || '',
  }
}

function isActiveDeviceStatus(status) {
  return ['ONLINE', 'ACTIVE', 'ACTIVO', 'ACTIVA', 'EN_LINEA', 'EN LINEA', 'UP', 'ENABLED'].includes(
    String(status || '').trim().toUpperCase(),
  )
}

function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

function isInsideQuintanaRoo(lat, lon) {
  if (!isValidCoordinate(lat, lon)) return false

  return quintanaRooGeoJson.geometry.coordinates.some((polygon) => {
    const [outerRing, ...holes] = polygon
    if (!isPointInRing([lon, lat], outerRing)) return false
    return !holes.some((ring) => isPointInRing([lon, lat], ring))
  })
}

function isPointInRing(point, ring = []) {
  const [x, y] = point
  let inside = false

  for (let i = 0, j = ring.length - 1; i < ring.length; j = i++) {
    const [xi, yi] = ring[i]
    const [xj, yj] = ring[j]
    const intersects = yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi || Number.EPSILON) + xi
    if (intersects) inside = !inside
  }

  return inside
}

const getDeep = (obj, path) => path.split('.').reduce((o, key) => (o ? o[key] : null), obj)

function normalizeCompareValue(value) {
  return String(value ?? '')
    .trim()
    .toUpperCase()
}

function openConsoleWithGeoSelection(logs, selections = []) {
  const detail = { dataGrafica: logs, selections }
  if (typeof openConsole === 'function') return openConsole(detail)
  window.dispatchEvent(new CustomEvent('santoro-abrir-consola', { detail }))
}

function parseGeoLike(value) {
  if (!value) return null

  if (typeof value === 'object' && value?.type === 'Point' && Array.isArray(value.coordinates)) {
    const [lng, lat] = value.coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lon: lng }
  }

  if (typeof value === 'object' && !Array.isArray(value)) {
    const lat =
      value.lat ??
      value.latitude ??
      (value.coords ? (value.coords.lat ?? value.coords.latitude) : undefined)
    const lon =
      value.lng ??
      value.lon ??
      value.long ??
      value.longitude ??
      (value.coords ? (value.coords.lng ?? value.coords.lon ?? value.coords.longitude) : undefined)

    const parsedLat = Number(lat)
    const parsedLon = Number(lon)
    if (Number.isFinite(parsedLat) && Number.isFinite(parsedLon)) return { lat: parsedLat, lon: parsedLon }
  }

  if (Array.isArray(value) && value.length >= 2) {
    const a = Number(value[0])
    const b = Number(value[1])
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null

    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lon: b }
    if (bIsLat) return { lat: b, lon: a }
  }

  if (typeof value === 'string') {
    const parts = value.split(',').map((part) => Number(part.trim()))
    if (parts.length !== 2 || parts.some((part) => !Number.isFinite(part))) return null
    const [a, b] = parts
    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lon: b }
    if (bIsLat) return { lat: b, lon: a }
  }

  return null
}

function parseLogGeo(log) {
  return (
    parseGeoLike(log?.geo) ||
    parseGeoLike(log?.geoCoordinates) ||
    parseGeoLike(log?.meta?.geoCoordinates) ||
    null
  )
}

function haversineKm(a, b) {
  const radius = 6371
  const toRad = (value) => (value * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLon = toRad(b.lon - a.lon)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2
  return 2 * radius * Math.asin(Math.sqrt(s))
}

function buildDeviceLogMatchers(device = {}) {
  const candidates = [
    {
      fieldKey: 'caseId',
      deviceValue: device.deviceId,
      logPaths: ['caseId'],
    },
    {
      fieldKey: 'meta.ip',
      deviceValue: device.ip,
      logPaths: ['meta.ip', 'ip', 'client.ip', 'request.ip'],
    },
    {
      fieldKey: 'meta.deviceName',
      deviceValue: device.hostname,
      logPaths: ['meta.deviceName', 'meta.hostname', 'hostname', 'device.hostname'],
    },
    {
      fieldKey: 'location.name',
      deviceValue: device.locationName,
      logPaths: ['location.name', 'locationName'],
    },
  ]

  return candidates
    .map((candidate) => ({
      ...candidate,
      normalizedValue: normalizeCompareValue(candidate.deviceValue),
    }))
    .filter((candidate) => candidate.normalizedValue)
}

function findLogsNearDevice(device = {}) {
  const center = { lat: Number(device?.lat), lon: Number(device?.lon) }
  if (!Number.isFinite(center.lat) || !Number.isFinite(center.lon)) return []

  return (logsGlobales.value || []).filter((log) => {
    const point = parseLogGeo(log)
    return point ? haversineKm(center, point) <= DEVICE_CONSOLE_RADIUS_KM : false
  })
}

function matchLogsForDevice(device = {}) {
  const matchers = buildDeviceLogMatchers(device)
  if (!matchers.length) {
    return { logs: findLogsNearDevice(device), selections: [], source: 'proximity' }
  }

  for (const matcher of matchers) {
    const logs = (logsGlobales.value || []).filter((log) =>
      matcher.logPaths.some((path) => normalizeCompareValue(getDeep(log, path)) === matcher.normalizedValue),
    )

    if (logs.length) {
      return {
        logs,
        selections: [{ fieldKey: matcher.fieldKey, value: matcher.deviceValue }],
        source: matcher.fieldKey,
      }
    }
  }

  return { logs: findLogsNearDevice(device), selections: [], source: 'proximity' }
}

function openDeviceLogs(device = {}) {
  hideDeviceTooltip()
  const { logs, selections, source } = matchLogsForDevice(device)

  if (logs.length) {
    openConsoleWithGeoSelection(logs, selections)
    return
  }

  $q.notify({
    type: 'info',
    position: 'top',
    message:
      source === 'proximity'
        ? 'No se encontraron logs cercanos para ese dispositivo.'
        : 'No se encontraron logs relacionados a ese dispositivo.',
  })
}

function getStateBounds() {
  let minLng = Infinity
  let minLat = Infinity
  let maxLng = -Infinity
  let maxLat = -Infinity

  for (const polygon of quintanaRooGeoJson.geometry.coordinates) {
    for (const ring of polygon) {
      for (const [lng, lat] of ring) {
        if (lng < minLng) minLng = lng
        if (lng > maxLng) maxLng = lng
        if (lat < minLat) minLat = lat
        if (lat > maxLat) maxLat = lat
      }
    }
  }

  return [
    [minLng, minLat],
    [maxLng, maxLat],
  ]
}

const STATE_BOUNDS = getStateBounds()

function buildStateMask() {
  const worldRing = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90],
  ]
  const rings = [worldRing]
  for (const polygon of quintanaRooGeoJson.geometry.coordinates) {
    for (const ring of polygon) {
      rings.push(ring)
    }
  }
  return { type: 'Polygon', coordinates: rings }
}

function createCircleImage(fill, { size = 40, stroke = '#fff', ring = false } = {}) {
  const canvas = document.createElement('canvas')
  const scale = window.devicePixelRatio || 1
  canvas.width = size * scale
  canvas.height = size * scale
  const ctx = canvas.getContext('2d')
  ctx.scale(scale, scale)

  const center = size / 2
  if (ring) {
    ctx.beginPath()
    ctx.arc(center, center, size * 0.38, 0, Math.PI * 2)
    ctx.strokeStyle = fill
    ctx.globalAlpha = 0.35
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

function ensureDeviceImages() {
  if (!map) return

  const images = {
    'qr-device-online': createCircleImage('#22c55e', { ring: true }),
    'qr-device-offline': createCircleImage('#ef4444'),
    'qr-device-cluster-online': createClusterImage(['#22c55e', '#16a34a']),
    'qr-device-cluster-offline': createClusterImage(['#ef4444', '#b91c1c']),
    'qr-device-cluster-mixed': createClusterImage(['#3b82f6', '#1d4ed8']),
  }

  for (const [id, image] of Object.entries(images)) {
    if (!map.hasImage(id)) map.addImage(id, image, { pixelRatio: window.devicePixelRatio || 1 })
  }
}

function clearMarkerMap(markers) {
  for (const marker of markers.values()) marker.remove()
  markers.clear()
}

function clearAllClusterMarkers() {
  clearMarkerMap(eventClusterMarkers)
  clearMarkerMap(deviceClusterMarkers)
}

function syncEventClusterMarkers() {
  syncClusterMarkers({
    layerId: EVENT_CLUSTER_LAYER_ID,
    markers: eventClusterMarkers,
    className: 'qrm-cluster-count qrm-cluster-count--events',
    countKey: 'sum',
    enabled: mapMode.value === 'points',
  })
}

function syncDeviceClusterMarkers() {
  syncClusterMarkers({
    layerId: DEVICE_CLUSTER_LAYER_ID,
    markers: deviceClusterMarkers,
    className: 'qrm-cluster-count qrm-cluster-count--devices',
    countKey: 'point_count',
    enabled: mapMode.value === 'devices',
  })
}

function syncClusterMarkers({ layerId, markers, className, countKey, enabled }) {
  if (!map || !loaded || !enabled || !map.getLayer(layerId)) {
    clearMarkerMap(markers)
    return
  }

  const features = map.queryRenderedFeatures({ layers: [layerId] })
  const visibleKeys = new Set()

  for (const feature of features) {
    const coords = feature.geometry?.coordinates
    const props = feature.properties || {}
    if (!Array.isArray(coords)) continue

    const key = String(props.cluster_id ?? `${coords[0]},${coords[1]}`)
    const count = String(props[countKey] ?? props.point_count ?? '')
    if (!count) continue

    visibleKeys.add(key)
    let marker = markers.get(key)
    if (!marker) {
      const el = document.createElement('div')
      el.className = className
      el.textContent = count
      marker = new maplibregl.Marker({ element: el }).setLngLat(coords).addTo(map)
      markers.set(key, marker)
    } else {
      marker.getElement().textContent = count
      marker.setLngLat(coords)
    }
  }

  for (const [key, marker] of markers.entries()) {
    if (!visibleKeys.has(key)) {
      marker.remove()
      markers.delete(key)
    }
  }
}

function syncVisibleClusterMarkers() {
  syncEventClusterMarkers()
  syncDeviceClusterMarkers()
}

function setLayerVisibility(layerId, visible) {
  if (!map?.getLayer(layerId)) return
  map.setLayoutProperty(layerId, 'visibility', visible ? 'visible' : 'none')
}

function setLayerPaint(layerId, property, value) {
  if (!map?.getLayer(layerId)) return
  map.setPaintProperty(layerId, property, value)
}

function applyHeatMapBaseStyle(isHeatMode) {
  setLayerPaint(RASTER_LAYER_ID, 'raster-opacity', 1)
  setLayerPaint(RASTER_LAYER_ID, 'raster-saturation', isHeatMode ? -1 : 0)
  setLayerPaint(RASTER_LAYER_ID, 'raster-contrast', isHeatMode ? 0.45 : 0)
  setLayerPaint(RASTER_LAYER_ID, 'raster-brightness-min', 0)
  setLayerPaint(RASTER_LAYER_ID, 'raster-brightness-max', isHeatMode ? 0.2 : 1)
  setLayerPaint(STATE_MASK_LAYER_ID, 'fill-opacity', isHeatMode ? 0.84 : 0.68)
  setLayerPaint(STATE_OUTLINE_LAYER_ID, 'line-color', isHeatMode ? '#22c55e' : '#ffffff')
  setLayerPaint(STATE_OUTLINE_LAYER_ID, 'line-width', isHeatMode ? 2.75 : 2)
  setLayerPaint(STATE_OUTLINE_LAYER_ID, 'line-opacity', isHeatMode ? 0.95 : 1)
}

function applyModeVisibility() {
  if (!map || !loaded) return

  closeActiveSpiderfy()
  applyHeatMapBaseStyle(mapMode.value === 'heat')
  setLayerVisibility(EVENT_CLUSTER_LAYER_ID, mapMode.value === 'points')
  setLayerVisibility(EVENT_POINT_LAYER_ID, mapMode.value === 'points')
  setLayerVisibility(HEAT_LAYER_ID, mapMode.value === 'heat')
  setLayerVisibility(DEVICE_CLUSTER_LAYER_ID, mapMode.value === 'devices')
  setLayerVisibility(DEVICE_POINT_LAYER_ID, mapMode.value === 'devices')

  hideEventPopup()
  hideDeviceTooltip()
  syncVisibleClusterMarkers()
}

function hideEventPopup() {
  eventPopup?.remove()
}

function buildTooltipDevice(properties = {}) {
  const isOnline = properties.status === 'ONLINE'
  return {
    color: isOnline ? '#22c55e' : '#ef4444',
    deviceId: properties.deviceId || '-',
    ip: properties.ip || '-',
    lastSeen: properties.lastSeen ? new Date(properties.lastSeen).toLocaleString() : '-',
    locationName: properties.locationName || '',
    name: properties.hostname || properties.deviceId || '-',
    statusLabel: isOnline ? 'Activo' : 'Inactivo',
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
  deviceTooltip.value = {
    visible: true,
    x: point.x,
    y: point.y,
    device: buildTooltipDevice(properties),
  }
}

function hideDeviceTooltip() {
  deviceTooltip.value = { visible: false, x: 0, y: 0, device: null }
}

function closeActiveSpiderfy() {
  if (!spiderfy) return

  if (typeof spiderfy._clearSpiderifiedCluster === 'function') {
    spiderfy._clearSpiderifiedCluster()
    return
  }

  spiderfy.unspiderfyAll?.()
}

function addBaseStateLayers() {
  map.addSource('qr-state', {
    type: 'geojson',
    data: quintanaRooGeoJson,
  })

  map.addSource('qr-mask', {
    type: 'geojson',
    data: buildStateMask(),
  })

  map.addLayer({
    id: STATE_MASK_LAYER_ID,
    type: 'fill',
    source: 'qr-mask',
    paint: {
      'fill-color': '#000000',
      'fill-opacity': 0.68,
    },
  })
}

function addEventLayers() {
  map.addSource(EVENT_SOURCE_ID, {
    type: 'geojson',
    data: eventsGeojson.value,
    cluster: true,
    clusterMaxZoom: 10,
    clusterRadius: 60,
    clusterProperties: { sum: ['+', ['get', 'count']] },
  })

  map.addLayer({
    id: HEAT_LAYER_ID,
    type: 'heatmap',
    source: EVENT_SOURCE_ID,
    paint: {
      'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 6, 1.8, 10, 4.5, 14, 7.5],
      'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 6, 75, 10, 45, 14, 18],
      'heatmap-opacity': 0.95,
      'heatmap-color': [
        'interpolate',
        ['linear'],
        ['heatmap-density'],
        0,
        'rgba(34,197,94,0)',
        0.25,
        '#22c55e',
        0.6,
        '#f59e0b',
        1,
        '#ef4444',
      ],
    },
  })

  map.addLayer({
    id: EVENT_CLUSTER_LAYER_ID,
    type: 'circle',
    source: EVENT_SOURCE_ID,
    filter: ['has', 'point_count'],
    paint: {
      'circle-color': ['step', ['get', 'sum'], '#22c55e', 30, '#f59e0b', 80, '#ef4444'],
      'circle-radius': ['step', ['get', 'point_count'], 20, 5, 28, 20, 36],
      'circle-opacity': 0.9,
      'circle-stroke-width': 2,
      'circle-stroke-color': '#fff',
    },
  })

  map.addLayer({
    id: EVENT_POINT_LAYER_ID,
    type: 'circle',
    source: EVENT_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    paint: {
      'circle-color': ['step', ['get', 'count'], '#22c55e', 10, '#f59e0b', 25, '#ef4444'],
      'circle-radius': ['step', ['get', 'count'], 7, 10, 11, 25, 15, 50, 18],
      'circle-opacity': 0.92,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
  })
}

function addDeviceLayers() {
  ensureDeviceImages()

  map.addSource(DEVICE_SOURCE_ID, {
    type: 'geojson',
    data: devicesGeojson.value,
    cluster: true,
    clusterMaxZoom: 16,
    clusterRadius: 60,
    clusterProperties: {
      online: ['+', ['case', ['==', ['get', 'status'], 'ONLINE'], 1, 0]],
    },
  })

  map.addLayer({
    id: DEVICE_CLUSTER_LAYER_ID,
    type: 'symbol',
    source: DEVICE_SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'online'], ['get', 'point_count']],
        'qr-device-cluster-online',
        ['==', ['get', 'online'], 0],
        'qr-device-cluster-offline',
        'qr-device-cluster-mixed',
      ],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
  })

  map.addLayer({
    id: DEVICE_POINT_LAYER_ID,
    type: 'symbol',
    source: DEVICE_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': ['case', ['==', ['get', 'status'], 'ONLINE'], 'qr-device-online', 'qr-device-offline'],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
  })

  initSpiderfy()
}

function initSpiderfy() {
  if (!map?.getLayer(DEVICE_CLUSTER_LAYER_ID)) return

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
      'icon-image': ['case', ['==', ['get', 'status'], 'ONLINE'], 'qr-device-online', 'qr-device-offline'],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
    onLeafClick: (feature) => {
      if (feature?.properties) openDeviceLogs(feature.properties)
    },
    onLeafHover: (feature, event) => {
      if (!feature) {
        hideDeviceTooltip()
        return
      }
      showDeviceTooltip(getTooltipPoint(feature, event), feature.properties || {})
    },
  })
  spiderfy.applyTo(DEVICE_CLUSTER_LAYER_ID)
}

function addOutlineLayer() {
  map.addLayer({
    id: STATE_OUTLINE_LAYER_ID,
    type: 'line',
    source: 'qr-state',
    paint: {
      'line-color': '#ffffff',
      'line-width': 2,
      'line-opacity': 1,
    },
  })
}

function bindMapEvents() {
  eventPopup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })

  map.on('mousemove', EVENT_POINT_LAYER_ID, (event) => {
    const feature = event.features?.[0]
    if (!feature) return
    const [lon, lat] = feature.geometry.coordinates
    const count = feature.properties.count
    const locationName = escapeHtml(feature.properties.locationName || feature.properties.zoneName || '')
    map.getCanvas().style.cursor = 'default'
    eventPopup
      .setLngLat([lon, lat])
      .setHTML(
        `<div class="qrm-event-popup">
          <strong>${t('common.ubication')}</strong><br/>
          ${locationName ? `${locationName}<br/>` : ''}
          ${lat.toFixed(5)}, ${lon.toFixed(5)}<br/>
          ${t('dashboard.eventsSeriesLabel')}: <b>${count}</b>
        </div>`,
      )
      .addTo(map)
  })

  map.on('mouseleave', EVENT_POINT_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
    hideEventPopup()
  })

  map.on('mousemove', DEVICE_POINT_LAYER_ID, (event) => {
    map.getCanvas().style.cursor = 'pointer'
    const feature = event.features?.[0]
    if (feature) showDeviceTooltip(getTooltipPoint(feature, event), feature.properties || {})
  })

  map.on('click', DEVICE_POINT_LAYER_ID, (event) => {
    const feature = event.features?.[0]
    if (feature) openDeviceLogs(feature.properties || {})
  })

  map.on('mouseleave', DEVICE_POINT_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
    hideDeviceTooltip()
  })

  map.on('mouseenter', DEVICE_CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = 'pointer'
  })

  map.on('mouseleave', DEVICE_CLUSTER_LAYER_ID, () => {
    map.getCanvas().style.cursor = ''
  })

  map.on('movestart', () => {
    hideEventPopup()
    hideDeviceTooltip()
  })
  map.on('zoomstart', () => {
    hideEventPopup()
    hideDeviceTooltip()
  })
  map.on('idle', syncVisibleClusterMarkers)
  map.on('moveend', syncVisibleClusterMarkers)
  map.on('zoomend', syncVisibleClusterMarkers)
}

function updateEventSourceData() {
  if (!map || !loaded) return

  if (pendingEventSourceFrame) cancelAnimationFrame(pendingEventSourceFrame)
  pendingEventSourceFrame = requestAnimationFrame(() => {
    pendingEventSourceFrame = null
    if (!map || !loaded) return
    map.getSource(EVENT_SOURCE_ID)?.setData(eventsGeojson.value)
    syncVisibleClusterMarkers()
  })
}

function updateDeviceSourceData() {
  if (!map || !loaded) return

  if (pendingDeviceSourceFrame) cancelAnimationFrame(pendingDeviceSourceFrame)
  pendingDeviceSourceFrame = requestAnimationFrame(() => {
    pendingDeviceSourceFrame = null
    if (!map || !loaded) return
    closeActiveSpiderfy()
    hideDeviceTooltip()
    map.getSource(DEVICE_SOURCE_ID)?.setData(devicesGeojson.value)
    syncVisibleClusterMarkers()
  })
}

async function initMap() {
  await nextTick()
  if (!mapEl.value || map) return

  map = new maplibregl.Map({
    container: mapEl.value,
    style: {
      version: 8,
      sources: {
        'raster-tiles': {
          type: 'raster',
          tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
          tileSize: 256,
          minzoom: 0,
          maxzoom: 19,
          attribution: '© OpenStreetMap contributors',
        },
      },
      layers: [{ id: RASTER_LAYER_ID, type: 'raster', source: 'raster-tiles' }],
    },
    bounds: STATE_BOUNDS,
    fitBoundsOptions: { padding: 24 },
    maxBounds: STATE_BOUNDS,
    minZoom: 6,
    maxZoom: 14,
    renderWorldCopies: false,
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

  map.on('load', () => {
    loaded = true
    addBaseStateLayers()
    addEventLayers()
    addDeviceLayers()
    addOutlineLayer()
    bindMapEvents()
    applyModeVisibility()
    map.resize()
  })

  resizeObserver = new ResizeObserver(() => {
    if (!map) return
    requestAnimationFrame(() => {
      map?.resize()
      syncVisibleClusterMarkers()
    })
  })
  resizeObserver.observe(mapEl.value)
}

watch(mapMode, applyModeVisibility)
watch(eventsGeojson, updateEventSourceData)
watch(devicesGeojson, updateDeviceSourceData)
watch(
  [hasActivePoints, hasActiveDevices],
  ([points, devices]) => {
    if (!points && devices) mapMode.value = 'devices'
    if (points && !devices) mapMode.value = 'points'
  },
  { immediate: true },
)

onMounted(initMap)

onBeforeUnmount(() => {
  if (pendingEventSourceFrame) cancelAnimationFrame(pendingEventSourceFrame)
  if (pendingDeviceSourceFrame) cancelAnimationFrame(pendingDeviceSourceFrame)
  pendingEventSourceFrame = null
  pendingDeviceSourceFrame = null
  resizeObserver?.disconnect()
  resizeObserver = null
  hideEventPopup()
  hideDeviceTooltip()
  spiderfy?.unspiderfyAll?.()
  spiderfy = null
  eventPopup = null
  clearAllClusterMarkers()
  if (map) {
    map.remove()
    map = null
  }
  loaded = false
})
</script>

<template>
  <div class="qrm-shell">
    <div class="qrm-toolbar">
      <q-btn-toggle
        v-model="mapMode"
        dense
        unelevated
        no-caps
        class="qrm-mode-toggle"
        text-color="grey-5"
        toggle-color="orange-9"
        :options="mapModeOptions"
      />
    </div>

    <div ref="mapEl" class="qrm-map" />

    <div
      v-if="deviceTooltip.visible && deviceTooltip.device"
      class="qrm-device-popup"
      :style="{ left: `${deviceTooltip.x}px`, top: `${deviceTooltip.y}px` }"
    >
      <div class="qrm-device-popup__header">
        <span class="qrm-device-popup__dot" :style="{ background: deviceTooltip.device.color }"></span>
        <strong class="qrm-device-popup__name">{{ deviceTooltip.device.name }}</strong>
      </div>
      <div class="qrm-device-popup__id">{{ deviceTooltip.device.deviceId }}</div>
      <div class="qrm-device-popup__row">
        <span class="qrm-device-popup__label">{{ t('dashboard.devicesMapIp') }}:</span>
        {{ deviceTooltip.device.ip }}
      </div>
      <div v-if="deviceTooltip.device.locationName" class="qrm-device-popup__row">
        <span class="qrm-device-popup__label">{{ t('dashboard.devicesMapLocation') }}:</span>
        {{ deviceTooltip.device.locationName }}
      </div>
      <div class="qrm-device-popup__row">
        <span class="qrm-device-popup__label">{{ t('dashboard.devicesMapLastSeen') }}:</span>
        {{ deviceTooltip.device.lastSeen }}
      </div>
      <div class="qrm-device-popup__status" :style="{ color: deviceTooltip.device.color }">
        {{ deviceTooltip.device.statusLabel }}
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.qrm-shell {
  position: relative;
  width: 100%;
}

.qrm-toolbar {
  display: flex;
  justify-content: center;
  margin-bottom: 12px;
}

.qrm-mode-toggle {
  background: rgba(0, 0, 0, 0.55);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 14px;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.45);
  max-width: 100%;
  padding: 6px;

  :deep(.q-btn) {
    border-radius: 12px;
    color: rgba(255, 255, 255, 0.55);
    font-weight: 800;
    letter-spacing: 0.02em;
    padding: 9px 16px;
    transition: all 0.12s ease;
  }

  :deep(.q-btn:hover) {
    background: rgba(255, 255, 255, 0.05);
    color: rgba(255, 255, 255, 0.8);
  }

  :deep(.q-btn.q-btn--active) {
    background: linear-gradient(180deg, #ff7a1a 0%, #d65400 100%);
    box-shadow: 0 10px 25px rgba(255, 122, 26, 0.35);
    color: #ffffff;
  }
}

.qrm-map {
  width: 100%;
  height: clamp(380px, 56vh, 620px);
  min-height: 320px;
  border-radius: 14px;
  overflow: hidden;
}

.qrm-device-popup {
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
    align-items: center;
    display: flex;
    gap: 6px;
    margin-bottom: 4px;
  }

  &__dot {
    border-radius: 50%;
    flex-shrink: 0;
    height: 8px;
    width: 8px;
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
}

@media (max-width: 600px) {
  .qrm-map {
    height: clamp(320px, 62vh, 480px);
    border-radius: 12px;
  }

  .qrm-toolbar {
    justify-content: stretch;
  }

  .qrm-mode-toggle {
    width: 100%;

    :deep(.q-btn) {
      flex: 1 1 0;
      padding: 8px 6px;
    }

    :deep(.q-btn__content) {
      font-size: 11px;
      white-space: nowrap;
    }
  }
}
</style>

<style lang="scss">
.qrm-cluster-count {
  align-items: center;
  color: #fff;
  display: flex;
  font-weight: 800;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  user-select: none;
}

.qrm-cluster-count--events {
  font-size: 12px;
  height: 32px;
  transform: translateY(-1px);
  width: 32px;
}

.qrm-cluster-count--devices {
  font-size: 14px;
  height: 46px;
  width: 46px;
}

.qrm-event-popup {
  backdrop-filter: blur(6px);
  background: rgba(17, 24, 39, 0.92);
  border-radius: 8px;
  color: #fff;
  font-size: 12px;
  padding: 8px 10px;
}
</style>
