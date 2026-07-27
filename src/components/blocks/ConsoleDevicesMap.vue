<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import Spiderfy from '@nazka/map-gl-js-spiderfy'
import { useI18n } from 'vue-i18n'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'

maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

const { t } = useI18n()

const props = defineProps({
  devices: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-device'])

const mapEl = ref(null)
const tooltip = ref({ visible: false, x: 0, y: 0, device: null })
let map = null
let spiderfy = null
let resizeObserver = null
let loaded = false
let clusterCountMarkers = new Map()
let pendingSourceUpdateFrame = null

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

const validDevices = computed(() =>
  (props.devices || []).filter((d) => {
    const lat = Number(d?.lat)
    const lon = Number(d?.lon)
    return Number.isFinite(lat) && Number.isFinite(lon) && lat >= -90 && lat <= 90 && lon >= -180 && lon <= 180
  }),
)

const devicesGeojson = computed(() => ({
  type: 'FeatureCollection',
  features: validDevices.value.map((device, index) => {
    const status = String(device?.status || '').toUpperCase() === 'ONLINE' ? 'ONLINE' : 'OFFLINE'
    return {
      type: 'Feature',
      id: device?.deviceId || `${index}-${device?.lat}-${device?.lon}`,
      geometry: { type: 'Point', coordinates: [Number(device.lon), Number(device.lat)] },
      properties: {
        deviceId: device?.deviceId || '',
        hostname: device?.hostname || '',
        system: device?.system || '',
        status,
        ip: device?.ip || '',
        locationName: device?.locationName || '',
        lastSeen: device?.lastSeen || '',
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
    ip: properties.ip || '',
    locationName: properties.locationName || '',
    lastSeen: properties.lastSeen || '',
    lat: Number(properties.lat),
    lon: Number(properties.lon),
  })
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
    statusLabel: isOnline ? t('dashboard.devicesMapOnline') : t('dashboard.devicesMapOffline'),
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

function ensureImages() {
  if (!map) return

  const images = {
    'device-online': createCircleImage('#22c55e', { ring: true }),
    'device-offline': createCircleImage('#ef4444'),
    'device-cluster-online': createClusterImage(['#22c55e', '#16a34a']),
    'device-cluster-offline': createClusterImage(['#ef4444', '#b91c1c']),
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
      online: ['+', ['case', ['==', ['get', 'status'], 'ONLINE'], 1, 0]],
    },
  })

  map.addLayer({
    id: CLUSTER_LAYER_ID,
    type: 'symbol',
    source: DEVICE_SOURCE_ID,
    filter: ['has', 'point_count'],
    layout: {
      'icon-image': [
        'case',
        ['==', ['get', 'online'], ['get', 'point_count']],
        'device-cluster-online',
        ['==', ['get', 'online'], 0],
        'device-cluster-offline',
        'device-cluster-mixed',
      ],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
  })

  map.addLayer({
    id: POINT_LAYER_ID,
    type: 'symbol',
    source: DEVICE_SOURCE_ID,
    filter: ['!', ['has', 'point_count']],
    layout: {
      'icon-image': ['case', ['==', ['get', 'status'], 'ONLINE'], 'device-online', 'device-offline'],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
  })

  bindMapEvents()
  initSpiderfy()
  fitBounds()
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
      'icon-image': ['case', ['==', ['get', 'status'], 'ONLINE'], 'device-online', 'device-offline'],
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
      'icon-size': 1,
    },
    onLeafClick: (feature) => {
      hideDeviceTooltip()
      emitDeviceSelection(feature?.properties || {})
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
      hideDeviceTooltip()
      emitDeviceSelection(feature.properties || {})
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

onMounted(initMap)

onBeforeUnmount(() => {
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
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.cdm-map-shell {
  position: relative;
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
}
</style>
