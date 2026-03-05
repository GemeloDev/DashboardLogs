<template>
  <q-card flat bordered class="q-pa-md text-white" style="background: #1e1e2f; border-radius: 12px">
    <div class="row items-center q-mb-sm">
      <q-icon name="local_fire_department" class="q-mr-sm" color="primary" />
      <div class="text-subtitle1">Mapa de Calor (geo)</div>
      <q-space />
      <q-chip v-if="pointsCount" color="primary" text-color="white" icon="place" size="sm">
        {{ pointsCount }} puntos
      </q-chip>
    </div>

    <div ref="mapEl" class="mapa-container"></div>
  </q-card>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref, watch, nextTick } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ✅ Worker CSP correcto (Vite/Quasar)
import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'
maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

const props = defineProps({
  logs: { type: Array, default: () => [] },
  defaultCenter: { type: Array, default: () => [19.4326, -99.1332] }, // [lat,lng]
  defaultZoom: { type: Number, default: 5 },
  clickRadiusKm: { type: Number, default: 5 },

  // densidad por rejilla (2 ~ 1km aprox)
  gridPrecision: { type: Number, default: 2 },
})

const emit = defineEmits(['select-area'])

const mapEl = ref(null)
let map = null
let ro = null
let loaded = false

// ---------- Helpers ----------
function parseGeo(geo) {
  if (!geo) return null

  if (typeof geo === 'object' && geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
    const [lng, lat] = geo.coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  if (typeof geo === 'object' && !Array.isArray(geo)) {
    const lat =
      geo.lat ?? geo.latitude ?? (geo.coords ? (geo.coords.lat ?? geo.coords.latitude) : undefined)
    const lng =
      geo.lng ??
      geo.lon ??
      geo.long ??
      geo.longitude ??
      (geo.coords ? (geo.coords.lng ?? geo.coords.lon ?? geo.coords.longitude) : undefined)

    const la = Number(lat)
    const lo = Number(lng)
    if (Number.isFinite(la) && Number.isFinite(lo)) return { lat: la, lng: lo }
  }

  if (Array.isArray(geo) && geo.length >= 2) {
    const a = Number(geo[0])
    const b = Number(geo[1])
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null

    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lng: b }
    if (bIsLat) return { lat: b, lng: a }
  }

  if (typeof geo === 'string') {
    const parts = geo.split(',').map((s) => Number(s.trim()))
    if (parts.length !== 2 || parts.some((n) => !Number.isFinite(n))) return null
    const [a, b] = parts
    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lng: b }
    if (bIsLat) return { lat: b, lng: a }
  }

  return null
}

function haversineKm(a, b) {
  const R = 6371
  const toRad = (x) => (x * Math.PI) / 180
  const dLat = toRad(b.lat - a.lat)
  const dLng = toRad(b.lng - a.lng)
  const lat1 = toRad(a.lat)
  const lat2 = toRad(b.lat)
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(s))
}

function buildSummary(logs, center, radiusKm) {
  const rows = (logs || []).map((l) => ({ log: l, p: parseGeo(l?.geo) })).filter((x) => x.p)
  const inArea = rows.filter(({ p }) => haversineKm(center, p) <= radiusKm).map(({ log }) => log)
  return { center, radiusKm, total: inArea.length, sample: inArea.slice(0, 20) }
}

function aggregateToGrid(points, precision = 2) {
  const agg = new Map()
  for (const p of points) {
    const k = `${p.lat.toFixed(precision)},${p.lng.toFixed(precision)}`
    agg.set(k, (agg.get(k) || 0) + 1)
  }
  let max = 1
  const out = []
  for (const [k, count] of agg.entries()) {
    const [lat, lng] = k.split(',').map(Number)
    max = Math.max(max, count)
    out.push({ lat, lng, count })
  }
  return { out, max }
}

// ✅ construimos GeoJSON como el demo (usa "mag") pero mag viene de densidad
function buildGeoJSONFromLogs() {
  const pts = (props.logs || []).map((l) => parseGeo(l?.geo)).filter(Boolean)
  if (!pts.length) {
    return { geojson: { type: 'FeatureCollection', features: [] }, bounds: null }
  }

  const { out, max } = aggregateToGrid(pts, props.gridPrecision)

  // mag: mapea count -> [1..6] como el ejemplo
  const magOf = (count) => {
    if (max <= 1) return 1
    return 1 + ((count - 1) * 5) / (max - 1) // 1..6
  }

  const features = out.map((p) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.lng, p.lat] },
    properties: {
      count: p.count,
      mag: magOf(p.count),
    },
  }))

  const bounds = new maplibregl.LngLatBounds()
  for (const p of pts) bounds.extend([p.lng, p.lat])

  return { geojson: { type: 'FeatureCollection', features }, bounds }
}

const pointsCount = computed(() => {
  let c = 0
  for (const l of props.logs || []) if (parseGeo(l?.geo)) c++
  return c
})

function waitForNonZeroSize(el, maxFrames = 60) {
  return new Promise((resolve, reject) => {
    let frames = 0
    const tick = () => {
      const r = el?.getBoundingClientRect?.()
      if (r && r.width > 20 && r.height > 20) return resolve()
      frames++
      if (frames >= maxFrames) return reject(new Error('Map container has zero size'))
      requestAnimationFrame(tick)
    }
    tick()
  })
}

// ---------- Map lifecycle ----------
async function initMap() {
  await nextTick()
  if (!mapEl.value || map) return

  try {
    await waitForNonZeroSize(mapEl.value)
  } catch {
    return
  }
  if (!mapEl.value) return

  const [lat, lng] = props.defaultCenter
  const startZoom = Number.isFinite(+props.defaultZoom) ? +props.defaultZoom : 5

  map = new maplibregl.Map({
    container: mapEl.value,
    style: {
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
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
        },
      ],
      id: 'blank',
    }, // ✅ mismo mapa base del demo
    center: [Number(lng), Number(lat)],
    zoom: startZoom,
    maxZoom: 18,
    renderWorldCopies: false,
  })

  map.on('style.load', () => {
    map.setProjection({ type: 'globe' })
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

  map.on('click', (e) => {
    const center = { lat: e.lngLat.lat, lng: e.lngLat.lng }
    emit('select-area', buildSummary(props.logs, center, props.clickRadiusKm))
  })

  map.once('load', () => {
    loaded = true
    map.resize()

    map.addSource('logs', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
    })

    // ✅ Heatmap EXACTO del demo (mismos colores y comportamiento)
    map.addLayer({
      id: 'logs-heat',
      type: 'heatmap',
      source: 'logs',
      maxzoom: 9,
      paint: {
        // sigue usando mag (1..6) como “peso”
        'heatmap-weight': ['interpolate', ['linear'], ['get', 'mag'], 0, 0, 6, 1],

        // ✅ más notorio (más “fuerza”)
        'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.8, 9, 5.5, 14, 7.5],

        // ✅ VERDE (bajo) -> NARANJA (medio) -> ROJO (alto)
        'heatmap-color': [
          'interpolate',
          ['linear'],
          ['heatmap-density'],
          0.0,
          'rgba(34,197,94,0)', // verde transparente (para blur)
          0.25,
          '#22c55e', // verde
          0.6,
          '#f59e0b', // naranja
          1.0,
          '#ef4444', // rojo
        ],

        // ✅ manchas más grandes
        'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 14, 9, 55, 14, 85],

        // ✅ que no se desvanezca (antes lo apagabas en zoom 9)
        'heatmap-opacity': 0.95,
      },
    })

    // ✅ Puntos como el demo (aparecen al acercarte)
    map.addLayer({
      id: 'logs-point',
      type: 'circle',
      source: 'logs',
      minzoom: 7,
      paint: {
        'circle-radius': [
          'interpolate',
          ['linear'],
          ['zoom'],
          7,
          ['interpolate', ['linear'], ['get', 'mag'], 1, 1, 6, 4],
          16,
          ['interpolate', ['linear'], ['get', 'mag'], 1, 5, 6, 50],
        ],
        'circle-color': [
          'step',
          ['get', 'mag'],
          '#22c55e', // <= 1  verde
          3.5,
          '#f59e0b', // >= 3.5 naranja
          5.0,
          '#ef4444', // >= 5 rojo
        ],
        'circle-stroke-color': 'white',
        'circle-stroke-width': 1,
        'circle-opacity': ['interpolate', ['linear'], ['zoom'], 7, 0, 8, 1],
      },
    })

    refreshHeat()

    ro = new ResizeObserver(() => {
      if (!map) return
      requestAnimationFrame(() => map.resize())
    })
    ro.observe(mapEl.value)
  })
}

function refreshHeat() {
  if (!map || !loaded) return
  const src = map.getSource('logs')
  if (!src) return

  const { geojson, bounds } = buildGeoJSONFromLogs()
  src.setData(geojson)

  if (bounds) {
    map.fitBounds(bounds, { padding: 30, maxZoom: 12 })
  }
}

onMounted(initMap)

watch(
  () => props.logs,
  async () => {
    await nextTick()
    refreshHeat()
  },
  { deep: false },
)

onBeforeUnmount(() => {
  try {
    ro?.disconnect()
    ro = null
    if (map) map.remove()
  } finally {
    map = null
    loaded = false
  }
})
</script>

<style scoped>
.mapa-container {
  height: 420px;
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.35);
}
</style>
