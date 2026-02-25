<template>
  <q-card flat bordered class="q-pa-md text-white" style="background: #1e1e2f; border-radius: 12px">
    <div class="row items-center q-mb-sm">
      <q-icon name="map" class="q-mr-sm" color="primary" />
      <div class="text-subtitle1">Mapa de Logs (geo)</div>
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
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/leaflet.markercluster.js'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'

// Fix icon paths (Vite)
delete L.Icon.Default.prototype._getIconUrl
L.Icon.Default.mergeOptions({
  iconRetinaUrl: new URL('leaflet/dist/images/marker-icon-2x.png', import.meta.url).href,
  iconUrl: new URL('leaflet/dist/images/marker-icon.png', import.meta.url).href,
  shadowUrl: new URL('leaflet/dist/images/marker-shadow.png', import.meta.url).href,
})

const props = defineProps({
  logs: { type: Array, default: () => [] },
  // centro inicial
  defaultCenter: { type: Array, default: () => [19.4326, -99.1332] }, // CDMX
  defaultZoom: { type: Number, default: 5 },
  // radio para click en mapa (km)
  clickRadiusKm: { type: Number, default: 5 },
})

const emit = defineEmits([
  'select-log', // (log) -> click marcador
  'select-cluster', // (summary) -> click cluster
  'select-area', // (summary) -> click en mapa
])

const mapEl = ref(null)
let map = null
let markers = null

// -------- Helpers --------
const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

function parseGeo(geo) {
  if (!geo) return null

  // GeoJSON Point
  if (typeof geo === 'object' && geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
    const [lng, lat] = geo.coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  // {lat, lng} | {lat, lon} | {latitude, longitude}
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

  // Array [a,b]
  if (Array.isArray(geo) && geo.length >= 2) {
    const a = Number(geo[0])
    const b = Number(geo[1])
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null

    // deducción por rangos
    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lng: b }
    if (bIsLat) return { lat: b, lng: a }
    return null
  }

  // String "lat,lng"
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

  const byStatus = {}
  const byEventType = {}
  const byDevice = {}
  const users = new Set()

  for (const l of inArea) {
    const st = String(l?.status ?? 'N/A').toUpperCase()
    byStatus[st] = (byStatus[st] || 0) + 1

    const et = String(l?.eventType ?? 'N/A').toUpperCase()
    byEventType[et] = (byEventType[et] || 0) + 1

    const dev = String(getDeep(l, 'meta.device') ?? 'N/A')
    byDevice[dev] = (byDevice[dev] || 0) + 1

    const u = String(getDeep(l, 'actor.fullName') ?? '').trim()
    if (u) users.add(u)
  }

  const top = (obj, n = 7) =>
    Object.entries(obj)
      .sort((a, b) => b[1] - a[1])
      .slice(0, n)

  return {
    center,
    radiusKm,
    total: inArea.length,
    users: users.size,
    byStatus,
    byEventType,
    topEventTypes: top(byEventType),
    topDevices: top(byDevice),
    sample: inArea.slice(0, 20),
  }
}

// color del marcador basado en status
function statusColor(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('success') || s.includes('ok') || s.includes('exito')) return '#22c55e'
  if (s.includes('warn') || s.includes('warning')) return '#f59e0b'
  if (s.includes('error') || s.includes('fail') || s.includes('fall')) return '#ef4444'
  return '#3b82f6'
}

function makeMarkerIcon(color) {
  return L.divIcon({
    html: `<div style="
      background:${color};
      border:2px solid #fff;
      border-radius:50%;
      width:22px;height:22px;
      box-shadow:0 2px 8px rgba(0,0,0,.35);
    "></div>`,
    className: 'console-geo-marker',
    iconSize: [22, 22],
    iconAnchor: [11, 11],
  })
}

// -------- Map lifecycle --------
const pointsCount = computed(() => {
  let c = 0
  for (const l of props.logs || []) if (parseGeo(l?.geo)) c++
  return c
})

async function initMap() {
  await nextTick()
  if (!mapEl.value || map) return

  map = L.map(mapEl.value, { zoomControl: true }).setView(props.defaultCenter, props.defaultZoom)

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors',
    maxZoom: 18,
    // ✅ evita que se repita el mapa
    noWrap: true,

    // ✅ opcional: limita el mundo (lon/lat)
    bounds: L.latLngBounds([-85, -180], [85, 180]),
  }).addTo(map)

  // click en mapa -> resumen por radio
  map.on('click', async (e) => {
    const center = { lat: e.latlng.lat, lng: e.latlng.lng }
    const summary = buildSummary(props.logs, center, props.clickRadiusKm)
    emit('select-area', summary)
  })

  map.setMaxBounds(L.latLngBounds([-85, -180], [85, 180]))
  map.options.maxBoundsViscosity = 1.0

  markers = L.markerClusterGroup({
    chunkedLoading: true,
    maxClusterRadius: 60,
    spiderfyOnMaxZoom: true,
    showCoverageOnHover: false,
    disableClusteringAtZoom: 15,
    iconCreateFunction(cluster) {
      const count = cluster.getChildCount()
      return new L.DivIcon({
        html: `<div style="
          background: linear-gradient(135deg,#60a5fa 0%,#2563eb 100%);
          border:2px solid #fff;
          border-radius:50%;
          width:38px;height:38px;
          display:flex;align-items:center;justify-content:center;
          color:#fff;font-weight:700;
          box-shadow:0 4px 12px rgba(37,99,235,.35);
        "><span>${count}</span></div>`,
        className: 'console-geo-cluster',
        iconSize: new L.Point(38, 38),
      })
    },
  })

  // click en cluster -> resumen de logs del cluster
  markers.on('clusterclick', (ev) => {
    L.DomEvent.stopPropagation(ev)
    const cluster = ev.layer
    const childMarkers = cluster.getAllChildMarkers()
    const clusterLogs = childMarkers.map((m) => m.__log).filter(Boolean)

    const center = cluster.getLatLng()
    const summary = {
      ...buildSummary(clusterLogs, { lat: center.lat, lng: center.lng }, 0),
      radiusKm: null,
      mode: 'cluster',
    }
    emit('select-cluster', summary)
  })

  map.addLayer(markers)

  // primera carga
  refreshMarkers()
}

function refreshMarkers() {
  if (!map || !markers) return
  markers.clearLayers()

  const rows = (props.logs || []).map((log) => ({ log, p: parseGeo(log?.geo) })).filter((x) => x.p)

  for (const { log, p } of rows) {
    const color = statusColor(log?.status)
    const icon = makeMarkerIcon(color)

    const t = String(log?.eventType ?? 'N/A')
    const st = String(log?.status ?? 'N/A')
    const who = String(getDeep(log, 'actor.fullName') || getDeep(log, 'actor.username') || 'N/A')
    const dev = String(
      getDeep(log, 'meta.device') ||
        getDeep(log, 'meta.platform') ||
        getDeep(log, 'meta.osVersion') ||
        'N/A',
    )
    const msg = String(log?.message ?? '')
    const time = log?.eventTime ? new Date(log.eventTime).toLocaleString('es-MX') : 'N/A'

    const marker = L.marker([p.lat, p.lng], { icon })
    marker.__log = log

    marker.bindPopup(`
      <div style="min-width:220px">
        <div style="font-weight:700;margin-bottom:6px">${t}</div>
        <div><b>Status:</b> ${st}</div>
        <div><b>Usuario:</b> ${who}</div>
        <div><b>Device:</b> ${dev}</div>
        <div><b>Fecha:</b> ${time}</div>
        ${msg ? `<div style="margin-top:6px;opacity:.85">${msg}</div>` : ''}
        <div style="margin-top:8px;opacity:.7;font-size:12px">Click en el marcador para abrir detalle</div>
      </div>
    `)

    marker.on('click', (evt) => {
      L.DomEvent.stopPropagation(evt)
      emit('select-log', log)
    })

    markers.addLayer(marker)
  }

  // auto-encuadrar si hay puntos
  if (rows.length) {
    const bounds = L.latLngBounds(rows.map((r) => [r.p.lat, r.p.lng]))
    map.fitBounds(bounds, { padding: [30, 30], maxZoom: 12 })
  }
}

onMounted(initMap)

watch(
  () => props.logs,
  async () => {
    await nextTick()
    refreshMarkers()
  },
  { deep: false },
)

onBeforeUnmount(() => {
  try {
    if (markers) markers.clearLayers()
    if (map) map.remove()
  } finally {
    markers = null
    map = null
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

:deep(.leaflet-control-attribution) {
  font-size: 10px;
  opacity: 0.8;
}
</style>
