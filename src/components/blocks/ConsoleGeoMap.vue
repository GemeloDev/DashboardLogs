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
import maplibregl from 'maplibre-gl'
import 'maplibre-gl/dist/maplibre-gl.css'

// ✅ Worker CSP (Vite/Quasar)
import workerUrl from 'maplibre-gl/dist/maplibre-gl-csp-worker.js?url'
maplibregl.setWorkerUrl?.(workerUrl)
maplibregl.workerUrl = workerUrl

const props = defineProps({
  logs: { type: Array, default: () => [] },
  defaultCenter: { type: Array, default: () => [19.4326, -99.1332] }, // [lat,lng]
  defaultZoom: { type: Number, default: 2 },
  clickRadiusKm: { type: Number, default: 5 },
})

// ✅ ya no emitimos select-cluster porque no hay clusters
const emit = defineEmits(['select-log', 'select-area'])

const mapEl = ref(null)
let map = null
let ro = null
let markerObjs = []
let popup = null
const projectionType = ref('globe')

// ---------- Helpers ----------
const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

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

// ✅ Pin marker (gota) en canvas -> {width,height,data}
function makePinImageData(color, size = 48) {
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const ctx = canvas.getContext('2d')

  const cx = size / 2
  const r = size * 0.17
  const cy = size * 0.33
  const tipY = size * 0.92
  const w = r * 2.35

  ctx.save()
  ctx.shadowColor = 'rgba(0,0,0,0.35)'
  ctx.shadowBlur = 10
  ctx.shadowOffsetX = 0
  ctx.shadowOffsetY = 4

  ctx.beginPath()
  ctx.moveTo(cx, tipY)
  ctx.bezierCurveTo(cx - w, tipY - r * 0.7, cx - w, cy + r * 1.2, cx, cy - r)
  ctx.bezierCurveTo(cx + w, cy + r * 1.2, cx + w, tipY - r * 0.7, cx, tipY)
  ctx.closePath()
  ctx.fillStyle = color
  ctx.fill()
  ctx.restore()

  ctx.beginPath()
  ctx.moveTo(cx, tipY)
  ctx.bezierCurveTo(cx - w, tipY - r * 0.7, cx - w, cy + r * 1.2, cx, cy - r)
  ctx.bezierCurveTo(cx + w, cy + r * 1.2, cx + w, tipY - r * 0.7, cx, tipY)
  ctx.closePath()
  ctx.lineWidth = 3
  ctx.strokeStyle = '#ffffff'
  ctx.stroke()

  ctx.beginPath()
  ctx.arc(cx, cy, r * 0.55, 0, Math.PI * 2)
  ctx.fillStyle = 'rgba(255,255,255,0.25)'
  ctx.fill()

  const img = ctx.getImageData(0, 0, size, size)
  return { width: size, height: size, data: img.data }
}

function ensurePinImages(map) {
  const icons = [
    ['pin-success', '#22c55e'],
    ['pin-warn', '#f59e0b'],
    ['pin-error', '#ef4444'],
    ['pin-other', '#3b82f6'],
  ]

  for (const [name, color] of icons) {
    if (map.hasImage(name)) continue
    map.addImage(name, makePinImageData(color, 48), { pixelRatio: 1 })
  }
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

function statusColor(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('success') || s.includes('ok') || s.includes('exito') || s.includes('approved')) return '#22c55e'
  if (s.includes('warn') || s.includes('warning')) return '#f59e0b'
  if (s.includes('error') || s.includes('fail') || s.includes('fall') || s.includes('rejected')) return '#ef4444'
  return '#3b82f6'
}

function makePinEl() {
  const el = document.createElement('div')
  return el
}

function clearMarkers() {
  for (const m of markerObjs) m.remove()
  markerObjs = []
}

function renderMarkers() {
  if (!map) return
  clearMarkers()

  const pts = []
  for (let i = 0; i < (props.logs || []).length; i++) {
    const log = props.logs[i]
    const p = parseGeo(log?.geo)
    if (!p) continue

    pts.push([p.lng, p.lat])

    const color = statusColor(log?.status)
    const el = makePinEl(color)

    const t = String(log?.eventType ?? 'N/A')
    const st = String(log?.status ?? 'N/A')
    const who = String(getDeep(log, 'actor.fullName') || getDeep(log, 'actor.username') || 'N/A')
    const dev = String(getDeep(log, 'meta.device') || getDeep(log, 'meta.platform') || 'N/A')
    const msg = String(log?.message ?? '')
    const time = log?.eventTime ? new Date(log.eventTime).toLocaleString('es-MX') : 'N/A'

    const popupHtml = `
      <div style="min-width:220px;" class="text-black">
        <div style="font-weight:700;margin-bottom:6px">${t}</div>
        <div><b>Status:</b> ${st}</div>
        <div><b>Usuario:</b> ${who}</div>
        <div><b>Device:</b> ${dev}</div>
        <div><b>Fecha:</b> ${time}</div>
        ${msg ? `<div style="margin-top:6px;opacity:.85">${msg}</div>` : ''}
      </div>
    `

    const marker = new maplibregl.Marker({ color })
      .setLngLat([p.lng, p.lat])
      .setPopup(new maplibregl.Popup({ offset: 18 }).setHTML(popupHtml))
      .addTo(map)

    // click => emit select-log (y abre popup)
    el.addEventListener('click', (evt) => {
      evt.stopPropagation()
      emit('select-log', log)
      marker.togglePopup()
    })

    markerObjs.push(marker)
  }

  // auto-fit
  if (pts.length) {
    const bounds = pts.reduce((b, c) => b.extend(c), new maplibregl.LngLatBounds(pts[0], pts[0]))
    map.fitBounds(bounds, { padding: 30, maxZoom: 12 })
  }
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

  const pLat = Number(props.defaultCenter?.[0] ?? 19.4326)
  const pLng = Number(props.defaultCenter?.[1] ?? -99.1332)
  const startZoom = Number.isFinite(+props.defaultZoom) ? +props.defaultZoom : 2

  map = new maplibregl.Map({
    container: mapEl.value,
    style: 'https://demotiles.maplibre.org/style.json',
    center: [pLng, pLat],
    zoom: startZoom,
    maxZoom: 18,
    renderWorldCopies: false,
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

  map.on('style.load', () => {
    projectionType.value = 'globe'
    map.setProjection({ type: 'globe' })
  })

  map.once('load', () => {
    map.resize()

    ensurePinImages(map)

    map.on('mouseenter', 'unclustered-point', () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', 'unclustered-point', () => (map.getCanvas().style.cursor = ''))

    // Click en mapa vacío -> select-area
    map.on('click', (e) => {
      const hits = map.queryRenderedFeatures(e.point, { layers: ['unclustered-point'] })
      if (hits?.length) return
      const center = { lat: e.lngLat.lat, lng: e.lngLat.lng }
      emit('select-area', buildSummary(props.logs, center, props.clickRadiusKm))
    })

    renderMarkers()

    ro = new ResizeObserver(() => {
      if (!map) return
      requestAnimationFrame(() => map.resize())
    })
    ro.observe(mapEl.value)
  })
}

onMounted(initMap)

watch(
  () => props.logs,
  async () => {
    await nextTick()
    renderMarkers()
  },
  { deep: false },
)

onBeforeUnmount(() => {
  try {
    ro?.disconnect()
    ro = null
    popup?.remove()
    popup = null
    clearMarkers()
    if (map) map.remove()
  } finally {
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
</style>
