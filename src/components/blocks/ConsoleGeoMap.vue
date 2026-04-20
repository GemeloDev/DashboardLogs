<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'
import { useI18n } from 'vue-i18n'
const { t } = useI18n()

import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'
maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

// ---------------- PROPS ----------------
const props = defineProps({
  points:  { type: Array, default: () => [] }, // [{ lat, lon, count }]
  devices: { type: Array, default: () => [] }, // [{ lat, lon, deviceId, hostname, system, status, ip, locationName, lastSeen }]
})

const emit = defineEmits(['select-point', 'select-device'])

// ---------------- STATE ----------------
const mapEl = ref(null)
let map    = null
let loaded = false
let popup  = null

const mode       = ref('points') // 'points' | 'heat' | 'devices'
const projection = ref('mercator')

// ---------------- ESTILOS BASE ----------------
const DARK_TILES = {
  version: 8,
  sources: {
    'raster-tiles': {
      type: 'raster',
      tiles: [
        'https://a.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'https://b.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'https://c.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
        'https://d.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
      ],
      tileSize: 256,
      minzoom: 0,
      maxzoom: 19,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'raster-tiles', type: 'raster', source: 'raster-tiles' }],
}

const MAP_STYLES = {
  points: {
    version: 8,
    sources: {
      osm: {
        type: 'raster',
        tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
        tileSize: 256,
      },
    },
    layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
  },
  heat:    DARK_TILES,
  devices: DARK_TILES,
}

// ---------------- GEOJSON: LOGS ----------------
const geojson = computed(() => ({
  type: 'FeatureCollection',
  features: (props.points || []).map((p) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
    properties: { count: p.weight || p.count || 1 },
  })),
}))

// ---------------- GEOJSON: DEVICES ----------------
const devicesGeojson = computed(() => {
  const devList = props.devices || []
  if (!devList.length) return { type: 'FeatureCollection', features: [] }

  // Agrupar por coordenada exacta para detectar colisiones
  const groups = new Map()
  for (const d of devList) {
    const key = `${d.lat},${d.lon}`
    if (!groups.has(key)) groups.set(key, [])
    groups.get(key).push(d)
  }

  const features = []
  for (const group of groups.values()) {
    const count = group.length
    group.forEach((d, idx) => {
      // Expansión radial determinística para colisiones en la misma coordenada
      let lon = d.lon
      let lat = d.lat
      if (count > 1) {
        const angle    = (2 * Math.PI * idx) / count
        const radiusDeg = 0.0015
        lon = d.lon + radiusDeg * Math.cos(angle)
        lat = d.lat + radiusDeg * Math.sin(angle)
      }

      features.push({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [lon, lat] },
        properties: {
          deviceId:     d.deviceId,
          hostname:     d.hostname     || '',
          deviceSystem: d.system       || '',
          status:       d.status       || 'OFFLINE',
          ip:           d.ip           || '',
          locationName: d.locationName || '',
          lastSeen:     d.lastSeen     || '',
        },
      })
    })
  }

  return { type: 'FeatureCollection', features }
})

// ---------------- INIT ----------------
async function initMap() {
  await nextTick()
  if (!mapEl.value || map) return

  map = new maplibregl.Map({
    container: mapEl.value,
    style: MAP_STYLES[mode.value],
    center: [-99.1332, 19.4326],
    zoom: 5,
    renderWorldCopies: false,
  })

  map.addControl(new maplibregl.NavigationControl(), 'top-left')

  map.on('load', () => {
    loaded = true
    map.setProjection({ type: projection.value })
    map.addSource('geo',         { type: 'geojson', data: geojson.value })
    map.addSource('devices-geo', { type: 'geojson', data: devicesGeojson.value })
    addLayers()
    fitBounds()
  })
}

// ---------------- PULSE IMAGE (ONLINE devices) ----------------
function addPulseImage() {
  if (map.hasImage('pulse-dot')) return
  const size = 80
  const pulseImage = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),
    context: null,
    onAdd() {
      const canvas = document.createElement('canvas')
      canvas.width = size
      canvas.height = size
      this.context = canvas.getContext('2d')
    },
    render() {
      const duration = 1800
      const t = (performance.now() % duration) / duration
      const ctx = this.context
      const center = size / 2
      const coreRadius = 10
      const outerRadius = Math.max(coreRadius, (size / 2 - 2) * t)

      ctx.clearRect(0, 0, size, size)

      // Expanding ring
      ctx.beginPath()
      ctx.arc(center, center, outerRadius, 0, Math.PI * 2)
      ctx.strokeStyle = `rgba(34, 197, 94, ${1 - t})`
      ctx.lineWidth = 3
      ctx.stroke()

      // Solid core dot
      ctx.beginPath()
      ctx.arc(center, center, coreRadius, 0, Math.PI * 2)
      ctx.fillStyle = '#22c55e'
      ctx.fill()
      ctx.strokeStyle = '#ffffff'
      ctx.lineWidth = 2.5
      ctx.stroke()

      this.data = ctx.getImageData(0, 0, size, size).data
      map.triggerRepaint()
      return true
    },
  }
  map.addImage('pulse-dot', pulseImage, { pixelRatio: 2 })
}

// ---------------- LAYERS ----------------
function addLayers() {
  if (!map) return

  const isPoints  = mode.value === 'points'
  const isHeat    = mode.value === 'heat'
  const isDevices = mode.value === 'devices'

  // ── Log layers ──────────────────────────────────────────────────────────────
  map.addLayer({
    id: 'points-layer',
    type: 'circle',
    source: 'geo',
    layout: { visibility: isPoints ? 'visible' : 'none' },
    paint: {
      'circle-color':        ['step', ['get', 'count'], '#22c55e', 5, '#f59e0b', 20, '#ef4444'],
      'circle-radius':       ['step', ['get', 'count'], 6, 5, 10, 20, 14, 100, 18],
      'circle-opacity':      0.9,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': '#fff',
    },
  })

  map.addLayer({
    id: 'heat-layer',
    type: 'heatmap',
    source: 'geo',
    layout: { visibility: isHeat ? 'visible' : 'none' },
    paint: {
      'heatmap-weight':     ['interpolate', ['linear'], ['get', 'count'], 0, 0, 100, 1],
      'heatmap-intensity':  ['interpolate', ['linear'], ['zoom'], 0, 1.8, 9, 5.5, 14, 7.5],
      'heatmap-radius':     ['interpolate', ['linear'], ['zoom'], 0, 14, 9, 55, 14, 85],
      'heatmap-opacity':    0.95,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0.0, 'rgba(34,197,94,0)',
        0.25, '#22c55e',
        0.6,  '#f59e0b',
        1.0,  '#ef4444',
      ],
    },
  })

  // ── Device layers ────────────────────────────────────────────────────────────
  // ONLINE: ícono pulsante animado (verde)
  addPulseImage()
  map.addLayer({
    id: 'devices-online',
    type: 'symbol',
    source: 'devices-geo',
    filter: ['==', ['get', 'status'], 'ONLINE'],
    layout: {
      visibility: isDevices ? 'visible' : 'none',
      'icon-image': 'pulse-dot',
      'icon-allow-overlap': true,
      'icon-ignore-placement': true,
    },
  })

  // OFFLINE: círculo rojo pequeño
  map.addLayer({
    id: 'devices-offline',
    type: 'circle',
    source: 'devices-geo',
    filter: ['!=', ['get', 'status'], 'ONLINE'],
    layout: { visibility: isDevices ? 'visible' : 'none' },
    paint: {
      'circle-color':        '#ef4444',
      'circle-radius':       6,
      'circle-opacity':      0.85,
      'circle-stroke-width': 1.5,
      'circle-stroke-color': 'rgba(255,255,255,0.4)',
    },
  })

  // ── Popup compartido ─────────────────────────────────────────────────────────
  if (popup) popup.remove()
  popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })

  // ── Click: logs ──────────────────────────────────────────────────────────────
  map.on('click', 'points-layer', (e) => {
    const f = e.features?.[0]
    if (!f) return
    const [lon, lat] = f.geometry.coordinates
    emit('select-point', { lat, lon })
  })

  // ── Tooltip: logs ────────────────────────────────────────────────────────────
  map.on('mousemove', 'points-layer', (e) => {
    const f = e.features?.[0]
    if (!f) return
    const [lon, lat] = f.geometry.coordinates
    const count = f.properties.count
    popup
      .setLngLat([lon, lat])
      .setHTML(
        `<div style="background:rgba(17,24,39,0.9);color:#fff;padding:8px 10px;border-radius:8px;font-size:12px;backdrop-filter:blur(6px)">
          <strong>${t('common.ubication')}</strong><br/>
          ${lat.toFixed(5)}, ${lon.toFixed(5)}<br/>
          ${t('dashboard.eventsSeriesLabel')}: <b>${count}</b><br/>
          <span style="opacity:0.7">${t('common.seeData')}</span>
        </div>`,
      )
      .addTo(map)
  })
  map.on('mouseleave', 'points-layer', () => popup?.remove())

  // ── Click: devices ───────────────────────────────────────────────────────────
  const onDeviceClick = (e) => {
    const f = e.features?.[0]
    if (!f) return
    emit('select-device', { deviceId: f.properties.deviceId })
  }
  map.on('click', 'devices-online',  onDeviceClick)
  map.on('click', 'devices-offline', onDeviceClick)

  // ── Tooltip: devices ─────────────────────────────────────────────────────────
  const onDeviceHover = (e) => {
    const f = e.features?.[0]
    if (!f) return
    const p = f.properties
    const isOnline = p.status === 'ONLINE'
    const dotColor = isOnline ? '#22c55e' : '#ef4444'
    const statusLabel = isOnline ? t('dashboard.devicesMapOnline') : t('dashboard.devicesMapOffline')
    const lastSeen = p.lastSeen ? new Date(p.lastSeen).toLocaleString() : '—'

    popup
      .setLngLat(f.geometry.coordinates)
      .setHTML(
        `<div style="background:rgba(10,14,26,0.95);color:#fff;padding:10px 12px;border-radius:10px;font-size:12px;backdrop-filter:blur(6px);min-width:180px;border:1px solid rgba(255,255,255,0.08)">
          <div style="display:flex;align-items:center;gap:6px;margin-bottom:6px">
            <span style="width:8px;height:8px;border-radius:50%;background:${dotColor};display:inline-block;flex-shrink:0"></span>
            <strong style="font-size:13px">${p.hostname || p.deviceId}</strong>
          </div>
          <div style="opacity:0.7;margin-bottom:2px">${p.deviceId}</div>
          <div style="margin-bottom:2px"><span style="opacity:0.55">${t('dashboard.devicesMapIp')}:</span> ${p.ip || '—'}</div>
          ${p.locationName ? `<div style="margin-bottom:2px"><span style="opacity:0.55">${t('dashboard.devicesMapLocation')}:</span> ${p.locationName}</div>` : ''}
          <div style="margin-bottom:6px"><span style="opacity:0.55">${t('dashboard.devicesMapLastSeen')}:</span> ${lastSeen}</div>
          <div style="color:${dotColor};font-weight:700">${statusLabel}</div>
          <div style="margin-top:4px;opacity:0.5;font-size:11px">${t('dashboard.devicesMapClickHint')}</div>
        </div>`,
      )
      .addTo(map)
  }
  map.on('mousemove', 'devices-online',  onDeviceHover)
  map.on('mousemove', 'devices-offline', onDeviceHover)
  map.on('mouseleave', 'devices-online',  () => popup?.remove())
  map.on('mouseleave', 'devices-offline', () => popup?.remove())

  // ── Cursor ───────────────────────────────────────────────────────────────────
  ;['points-layer', 'devices-online', 'devices-offline'].forEach((layer) => {
    map.on('mouseenter', layer, () => { map.getCanvas().style.cursor = 'pointer' })
    map.on('mouseleave', layer, () => { map.getCanvas().style.cursor = '' })
  })
}

// ---------------- MODE TOGGLE ----------------
function updateMode() {
  if (!map) return
  loaded = false
  map.setStyle(MAP_STYLES[mode.value])
  map.once('style.load', () => {
    loaded = true
    map.setProjection({ type: projection.value })
    map.addSource('geo',         { type: 'geojson', data: geojson.value })
    map.addSource('devices-geo', { type: 'geojson', data: devicesGeojson.value })
    addLayers()
    fitBounds()
  })
}

// ---------------- PROJECTION ----------------
function toggleProjection() {
  projection.value = projection.value === 'globe' ? 'mercator' : 'globe'
  map.setProjection({ type: projection.value })
}

// ---------------- DATA UPDATES ----------------
watch(geojson, (data) => {
  if (!map || !loaded) return
  map.getSource('geo')?.setData(data)
})

watch(devicesGeojson, (data) => {
  if (!map || !loaded) return
  map.getSource('devices-geo')?.setData(data)
})

// ---------------- FIT BOUNDS ----------------
function fitBounds() {
  if (!map) return

  const pts = mode.value === 'devices'
    ? (props.devices || []).map((d) => [d.lon, d.lat])
    : (props.points  || []).map((p) => [p.lon, p.lat])

  if (!pts.length) return
  const bounds = new maplibregl.LngLatBounds()
  pts.forEach((c) => bounds.extend(c))
  map.fitBounds(bounds, { padding: 50, maxZoom: 12 })
}

// ---------------- WATCH MODE ----------------
watch(mode, updateMode)

// ---------------- LIFECYCLE ----------------
onMounted(initMap)

onBeforeUnmount(() => {
  popup?.remove()
  if (map) map.remove()
})
</script>

<template>
  <div>
    <!-- CONTROLES -->
    <div class="row q-mb-sm items-center justify-between">
      <div class="toplist-title">{{ t('dashboard.dinamicMap') }}</div>

      <q-chip
        clickable
        v-ripple
        color="orange"
        text-color="white"
        icon="public"
        size="md"
        class="q-mr-sm"
        @click="toggleProjection"
      >
        {{ projection === 'globe' ? t('dashboard.mapProjection_Globe') : t('dashboard.mapProjection_Plano') }}
      </q-chip>
    </div>

    <!-- MAPA -->
    <div ref="mapEl" style="width: 100%; height: 520px; border-radius: 12px" />

    <div class="flex justify-center q-mt-md">
      <q-btn-toggle
        v-model="mode"
        dense
        unelevated
        class="map-switch__toggle"
        text-color="grey-5"
        toggle-color="orange-9"
        :options="[
          { label: t('dashboard.mapType_points'),  value: 'points'  },
          { label: t('dashboard.mapType_heat'),    value: 'heat'    },
          { label: t('dashboard.mapType_devices'), value: 'devices' },
        ]"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.toplist-title {
  font-size: 18px;
  font-weight: 700;
}

.map-switch__toggle {
  background: rgba(0, 0, 0, 0.55);
  border-radius: 14px;
  padding: 6px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.55);
}

.map-switch__toggle :deep(.q-btn) {
  border-radius: 12px;
  padding: 10px 18px;
  font-weight: 800;
  letter-spacing: 0.02em;
  color: rgba(255, 255, 255, 0.55);
  background: transparent;
  transition: all 0.12s ease;
}

.map-switch__toggle :deep(.q-btn:hover) {
  color: rgba(255, 255, 255, 0.8);
  background: rgba(255, 255, 255, 0.05);
}

.map-switch__toggle :deep(.q-btn.q-btn--active) {
  background: linear-gradient(180deg, #ff7a1a 0%, #d65400 100%);
  color: #ffffff;
  box-shadow: 0 10px 25px rgba(255, 122, 26, 0.35);
  border-top-left-radius: 14px;
  border-top-right-radius: 14px;
}

.map-switch__toggle :deep(.q-btn .q-btn__content) {
  white-space: nowrap;
}

@media (max-width: 420px) {
  .map-switch__toggle :deep(.q-btn) {
    padding: 10px 12px;
    font-size: 12px;
  }
}
</style>
