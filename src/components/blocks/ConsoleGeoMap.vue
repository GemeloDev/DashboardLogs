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
  points: { type: Array, default: () => [] }, // [{ lat, lon, count }]
})

const emit = defineEmits(['select-point'])

// ---------------- STATE ----------------
const mapEl   = ref(null)
let map       = null
let loaded    = false
let popup     = null

const mode       = ref('points') // 'points' | 'heat'
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
  heat: DARK_TILES,
}

// ---------------- GEOJSON ----------------
const geojson = computed(() => ({
  type: 'FeatureCollection',
  features: (props.points || []).map((p) => ({
    type: 'Feature',
    geometry: { type: 'Point', coordinates: [p.lon, p.lat] },
    properties: { count: p.weight || p.count || 1 },
  })),
}))

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
    map.addSource('geo', { type: 'geojson', data: geojson.value })
    addLayers()
    fitBounds()
  })
}

// ---------------- LAYERS ----------------
function addLayers() {
  if (!map) return

  const isPoints = mode.value === 'points'
  const isHeat   = mode.value === 'heat'

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
      'heatmap-weight':    ['interpolate', ['linear'], ['get', 'count'], 0, 0, 100, 1],
      'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1.8, 9, 5.5, 14, 7.5],
      'heatmap-radius':    ['interpolate', ['linear'], ['zoom'], 0, 14, 9, 55, 14, 85],
      'heatmap-opacity':   0.95,
      'heatmap-color': [
        'interpolate', ['linear'], ['heatmap-density'],
        0.0,  'rgba(34,197,94,0)',
        0.25, '#22c55e',
        0.6,  '#f59e0b',
        1.0,  '#ef4444',
      ],
    },
  })

  if (popup) popup.remove()
  popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })

  map.on('click', 'points-layer', (e) => {
    const f = e.features?.[0]
    if (!f) return
    const [lon, lat] = f.geometry.coordinates
    emit('select-point', { lat, lon })
  })

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

  map.on('mouseenter', 'points-layer', () => { map.getCanvas().style.cursor = 'pointer' })
  map.on('mouseleave', 'points-layer', () => { map.getCanvas().style.cursor = '' })
}

// ---------------- MODE TOGGLE ----------------
function updateMode() {
  if (!map) return
  loaded = false
  map.setStyle(MAP_STYLES[mode.value])
  map.once('style.load', () => {
    loaded = true
    map.setProjection({ type: projection.value })
    map.addSource('geo', { type: 'geojson', data: geojson.value })
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

// ---------------- FIT BOUNDS ----------------
function fitBounds() {
  if (!map) return
  const pts = (props.points || []).map((p) => [p.lon, p.lat])
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
          { label: t('dashboard.mapType_points'), value: 'points' },
          { label: t('dashboard.mapType_heat'),   value: 'heat'   },
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
