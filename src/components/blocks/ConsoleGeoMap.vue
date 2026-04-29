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


// ---------------- STATE ----------------
const mapEl   = ref(null)
let map       = null
let loaded    = false
let popup     = null
let clusterCountMarkers = new Map()

const mode       = ref('points') // 'points' | 'heat'
const projection = ref('mercator')
const mapModeLabel = computed(() =>
  mode.value === 'points' ? t('dashboard.mapType_points') : t('dashboard.mapType_heat'),
)
const mapModeIcon = computed(() => (mode.value === 'points' ? 'place' : 'local_fire_department'))

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

function clearClusterCountMarkers() {
  for (const marker of clusterCountMarkers.values()) marker.remove()
  clusterCountMarkers = new Map()
}

function syncClusterCountMarkers() {
  if (!map || !loaded || mode.value !== 'points' || !map.getLayer('clusters')) {
    clearClusterCountMarkers()
    return
  }

  const features = map.queryRenderedFeatures({ layers: ['clusters'] })
  const visibleKeys = new Set()

  for (const feature of features) {
    const coords = feature.geometry?.coordinates
    if (!Array.isArray(coords) || coords.length < 2) continue

    const props = feature.properties || {}
    const key = String(props.cluster_id ?? `${coords[0]},${coords[1]}`)
    const count = String(props.sum ?? props.point_count ?? '')
    if (!count) continue

    visibleKeys.add(key)

    let marker = clusterCountMarkers.get(key)
    if (!marker) {
      const el = document.createElement('div')
      el.className = 'cgm-cluster-count'
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
  map.on('idle', syncClusterCountMarkers)
  map.on('moveend', syncClusterCountMarkers)
  map.on('zoomend', syncClusterCountMarkers)

  map.on('load', () => {
    loaded = true
    map.setProjection({ type: projection.value })
    addLayers()
    fitBounds()
  })
}

// ---------------- LAYERS ----------------
function addLayers() {
  if (!map) return

  if (mode.value === 'points') {
    map.addSource('geo', {
      type: 'geojson',
      data: geojson.value,
      cluster: true,
      clusterMaxZoom: 10,
      clusterRadius: 60,
      clusterProperties: { sum: ['+', ['get', 'count']] },
    })

    map.addLayer({
      id: 'clusters',
      type: 'circle',
      source: 'geo',
      filter: ['has', 'point_count'],
      paint: {
        'circle-color':        ['step', ['get', 'sum'], '#22c55e', 50, '#f59e0b', 200, '#ef4444'],
        'circle-radius':       ['step', ['get', 'point_count'], 20, 5, 28, 20, 36],
        'circle-opacity':      0.9,
        'circle-stroke-width': 2,
        'circle-stroke-color': '#fff',
      },
    })
    syncClusterCountMarkers()
    map.once('idle', syncClusterCountMarkers)

    map.addLayer({
      id: 'unclustered-point',
      type: 'circle',
      source: 'geo',
      filter: ['!', ['has', 'point_count']],
      paint: {
        'circle-color':        ['step', ['get', 'count'], '#22c55e', 5, '#f59e0b', 20, '#ef4444'],
        'circle-radius':       ['step', ['get', 'count'], 6, 5, 10, 20, 14, 100, 18],
        'circle-opacity':      0.9,
        'circle-stroke-width': 1.5,
        'circle-stroke-color': '#fff',
      },
    })

    if (popup) popup.remove()
    popup = new maplibregl.Popup({ closeButton: false, closeOnClick: false })

    map.on('mousemove', 'unclustered-point', (e) => {
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
            ${t('dashboard.eventsSeriesLabel')}: <b>${count}</b>
          </div>`,
        )
        .addTo(map)
    })
    map.on('mouseleave', 'unclustered-point', () => popup?.remove())
    map.on('mouseenter', 'unclustered-point', () => { map.getCanvas().style.cursor = 'default' })
    map.on('mouseleave', 'unclustered-point', () => { map.getCanvas().style.cursor = '' })
  } else {
    map.addSource('geo', { type: 'geojson', data: geojson.value })

    map.addLayer({
      id: 'heat-layer',
      type: 'heatmap',
      source: 'geo',
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
  }
}

// ---------------- MODE TOGGLE ----------------
function updateMode() {
  if (!map) return
  loaded = false
  clearClusterCountMarkers()
  map.setStyle(MAP_STYLES[mode.value])
  map.once('style.load', () => {
    loaded = true
    map.setProjection({ type: projection.value })
    addLayers()
    fitBounds()
  })
}

function toggleMapMode() {
  mode.value = mode.value === 'points' ? 'heat' : 'points'
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
  map.once('idle', syncClusterCountMarkers)
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
  clearClusterCountMarkers()
  if (map) map.remove()
})
</script>

<template>
  <div>
    <div class="row q-mb-sm items-center">
      <div class="toplist-title">{{ t('dashboard.dinamicMap') }}</div>
      <q-space />

      <q-btn
        dense
        unelevated
        no-caps
        color="primary"
        text-color="white"
        :icon="mapModeIcon"
        :label="mapModeLabel"
        class="q-mr-sm"
        @click="toggleMapMode"
      />
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
  </div>
</template>

<style lang="scss" scoped>
.toplist-title {
  font-size: 18px;
  font-weight: 700;
}

:global(.cgm-cluster-count) {
  align-items: center;
  color: #fff;
  display: flex;
  font-size: 12px;
  font-weight: 800;
  height: 32px;
  justify-content: center;
  line-height: 1;
  pointer-events: none;
  text-align: center;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.55);
  transform: translateY(-1px);
  user-select: none;
  width: 32px;
}

@media (max-width: 420px) {
  :deep(.q-btn__content) {
    font-size: 12px;
  }
}
</style>
