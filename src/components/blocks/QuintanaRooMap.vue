<script setup>
import { nextTick, onBeforeUnmount, onMounted, ref } from 'vue'
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'
maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

import quintanaRooGeoJson from 'src/data/quintanaRoo.json'

const mapEl = ref(null)
let map = null
let resizeObserver = null

// Calcula los bounds exactos del polígono del estado a partir del GeoJSON
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

// Construye un polígono "mundo con hueco = forma del estado"
// para usarlo como máscara con fill-rule: 'evenodd'
function buildStateMask() {
  const worldRing = [
    [-180, -90],
    [180, -90],
    [180, 90],
    [-180, 90],
    [-180, -90],
  ]
  const state = quintanaRooGeoJson.geometry
  const rings = [worldRing]
  for (const polygon of state.coordinates) {
    for (const ring of polygon) {
      rings.push(ring)
    }
  }
  return { type: 'Polygon', coordinates: rings }
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
      layers: [{ id: 'raster-tiles', type: 'raster', source: 'raster-tiles' }],
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
    // Fuente con el polígono del estado (incluye Cozumel y otras islas)
    map.addSource('qr-state', {
      type: 'geojson',
      data: quintanaRooGeoJson,
    })

    // Fuente para la máscara (mundo con hueco = estado)
    map.addSource('qr-mask', {
      type: 'geojson',
      data: buildStateMask(),
    })

    // Capa negra que cubre todo lo que NO es Quintana Roo
    map.addLayer({
      id: 'qr-mask-fill',
      type: 'fill',
      source: 'qr-mask',
      paint: {
        'fill-color': '#000000',
        'fill-opacity': 1,
      },
    })

    // Línea blanca de 2px que delimita el estado (incluye Cozumel)
    map.addLayer({
      id: 'qr-outline',
      type: 'line',
      source: 'qr-state',
      paint: {
        'line-color': '#ffffff',
        'line-width': 2,
      },
    })
  })

  resizeObserver = new ResizeObserver(() => {
    if (!map) return
    requestAnimationFrame(() => map?.resize())
  })
  resizeObserver.observe(mapEl.value)
}

onMounted(initMap)

onBeforeUnmount(() => {
  resizeObserver?.disconnect()
  resizeObserver = null
  if (map) {
    map.remove()
    map = null
  }
})
</script>

<template>
  <div ref="mapEl" class="qrm-map" />
</template>

<style lang="scss" scoped>
.qrm-map {
  width: 100%;
  height: clamp(380px, 56vh, 620px);
  min-height: 320px;
  border-radius: 14px;
  overflow: hidden;
}

@media (max-width: 600px) {
  .qrm-map {
    height: clamp(320px, 62vh, 480px);
    border-radius: 12px;
  }
}
</style>
