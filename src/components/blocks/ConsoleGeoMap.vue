<template>
  <q-card flat bordered class="q-pa-md text-white" style="background: rgba(255, 255, 255, 0.03); border-radius: 12px; border: 1px solid rgba(255, 255, 255, 0.06);">
    <div class="row items-center q-mb-sm">
      <q-icon name="map" class="q-mr-sm" color="primary" />
      <div class="text-subtitle1">Mapa de Logs (geo)</div>
      <q-space />
      <q-chip
        clickable
        v-ripple
        color="orange"
        text-color="white"
        icon="public"
        size="sm"
        class="q-mr-sm"
        @click="toggleProjection"
      >
        {{ projectionLabel }}
      </q-chip>
      <q-chip v-if="pointsCount" color="primary" text-color="white" icon="place" size="sm">
        {{ pointsCount }} puntos
      </q-chip>
    </div>

    <div class="map-wrap">
      <div ref="mapEl" class="mapa-container"></div>

      <!-- Sidebar INCRUSTADO dentro del mapa -->
      <div v-show="dlg.open" class="map-sidebar" @click.stop>
        <div class="map-sidebar__header">
          <div class="row items-center">
            <q-icon name="place" size="18px" class="q-mr-sm" color="primary" />
            <div>
              <div class="text-subtitle2 text-weight-bold text-white">Detalle por coordenada</div>
              <div class="text-caption text-grey-4">{{ dlg.centerLabel }}</div>
            </div>

            <q-space />

            <q-chip
              dense
              color="grey-9"
              text-color="grey-3"
              size="sm"
              icon="receipt_long"
              class="q-mr-sm"
            >
              {{ dlg.summary?.total ?? 0 }} logs
            </q-chip>

            <q-btn dense flat icon="close" color="grey-4" @click="dlg.open = false" />
          </div>
        </div>

        <div class="map-sidebar__body">
          <!-- Uniques (ejemplo: EventTypes) -->
          <!-- Event Types (FUERA de la card) -->
          <div class="etype-section q-mb-md">
            <div class="etype-title">EVENT TYPES</div>

            <div class="etype-pills">
              <div
                v-for="(it, i) in topEntries(dlg.summary?.byEventType, 24)"
                :key="'et-pill-' + i"
                class="etype-pill"
                :class="{ 'etype-pill--active': dlg.eventTypeFilter === it[0] }"
                :style="etypeStyle(it[0], dlg.eventTypeFilter === it[0])"
                @click="toggleEventTypeFilter(it[0])"
              >
                <span class="etype-pill__label">{{ it[0] }}</span>
                <span class="etype-pill__count">({{ it[1] }})</span>
              </div>

              <div
                v-if="dlg.eventTypeFilter"
                class="etype-pill etype-pill--clear"
                @click="toggleEventTypeFilter(null)"
              >
                LIMPIAR
              </div>
            </div>
          </div>

          <div class="logs-card">
            <div class="logs-card__title">
              <q-icon name="format_list_bulleted" size="18px" class="q-mr-sm" color="primary" />
              <div class="text-subtitle2 text-weight-bold text-white">Logs</div>

              <q-space />

              <q-chip dense color="grey-9" text-color="grey-3" size="sm">
                {{ dlg.filteredLogs.length }} / {{ dlg.logs.length }}
              </q-chip>
            </div>

            <div class="logs-card__list">
              <q-virtual-scroll
                :items="dlg.filteredLogs"
                :virtual-scroll-item-size="54"
                class="logs-virtual--flat no-scrollbar"
              >
                <template #default="{ item, index }">
                  <div class="log-item" :key="index" @click="$emit('select-log', item)">
                    <div class="log-item__left">
                      <div class="log-item__icon">
                        <q-icon name="settings" size="18px" color="white" />
                      </div>

                      <div class="log-item__main">
                        <div class="log-item__title">
                          {{ String(item?.eventType ?? 'N/A') }}
                        </div>

                        <div class="log-item__sub">
                          {{ deviceLabel(item) }}
                        </div>
                      </div>
                    </div>

                    <div class="log-item__right">
                      <q-chip dense size="sm" class="chip-user" text-color="white">
                        {{ actorShort(item) }}
                      </q-chip>

                      <q-chip dense size="sm" class="chip-date" text-color="white">
                        {{ dateShort(item?.eventTime) }}
                      </q-chip>
                    </div>
                  </div>
                </template>
              </q-virtual-scroll>
            </div>
          </div>
        </div>
      </div>
    </div>
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
  mapProjection: { type: String, default: 'globe' }, // 'globe' | 'mercator'

  // ✅ NUEVO: precisión de agrupación
  geoPrecision: { type: Number, default: 3 },
})

const emit = defineEmits(['select-log', 'select-area'])

const mapEl = ref(null)
let map = null
let ro = null
let loaded = false
let popup = null
let groupIndexMap = new Map() // key -> [idx, idx, ...]
let fullGeojson = { type: 'FeatureCollection', features: [] }
const dlg = ref({
  open: false,
  key: '',
  center: null, // {lat,lng}
  centerLabel: '',
  logs: [],
  filteredLogs: [],
  summary: null,
  search: '',
  eventTypeFilter: null,
})

const mapHeight = ref(420)

// mide la altura real del mapa (por si cambia responsive)
function syncMapHeight() {
  const el = mapEl.value
  if (!el) return
  const r = el.getBoundingClientRect()
  if (r?.height) mapHeight.value = Math.round(r.height)
}

const projectionType = ref('globe')
const projectionLabel = computed(() => (projectionType.value === 'globe' ? 'Globo' : 'Plano'))

// ---------------- Helpers (tuyos) ----------------
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

function statusBucket(status) {
  const s = String(status || '').toLowerCase()
  if (s.includes('success') || s.includes('ok') || s.includes('exito') || s.includes('approved'))
    return 'success'
  if (s.includes('warn') || s.includes('warning')) return 'warn'
  if (s.includes('error') || s.includes('fail') || s.includes('fall') || s.includes('rejected'))
    return 'error'
  return 'other'
}

function toGroupKey(lat, lng, p) {
  return `${lat.toFixed(p)},${lng.toFixed(p)}`
}

function dominantBucketFromCounts(cnt) {
  if ((cnt.error || 0) > 0) return 'error'
  if ((cnt.warn || 0) > 0) return 'warn'
  if ((cnt.success || 0) > 0) return 'success'
  return 'other'
}

// ✅ resumen de un grupo (sin filtro por radio)
function buildGroupSummary(groupLogs, center) {
  const byStatus = {}
  const byEventType = {}
  const byDevice = {}
  const byUser = {}
  const byOffice = {}
  const users = new Set()

  for (const l of groupLogs) {
    const st = String(l?.status ?? 'N/A').toUpperCase()
    byStatus[st] = (byStatus[st] || 0) + 1

    const et = String(l?.eventType ?? 'N/A').toUpperCase()
    byEventType[et] = (byEventType[et] || 0) + 1

    const dev = deviceLabel(l)
    byDevice[dev] = (byDevice[dev] || 0) + 1

    const u = actorLabel(l)
    if (u && u !== 'N/A') users.add(u)
    byUser[u] = (byUser[u] || 0) + 1

    const off = officeLabel(l)
    byOffice[off] = (byOffice[off] || 0) + 1
  }

  return {
    mode: 'coordinate',
    center,
    total: groupLogs.length,
    users: users.size,
    byStatus,
    byEventType,
    byDevice,
    byUser,
    byOffice,
    sample: groupLogs.slice(0, 200), // para virtual scroll (no metas todo si hay miles)
  }
}

// ✅ construye GeoJSON agrupado + bounds
function buildGroupedGeoJSONFromLogs() {
  const p = Math.max(0, Math.min(6, Number(props.geoPrecision ?? 3)))
  const groups = new Map() // key -> agg
  groupIndexMap = new Map()

  const bounds = new maplibregl.LngLatBounds()
  let hasAny = false

  for (let i = 0; i < (props.logs || []).length; i++) {
    const log = props.logs[i]
    const g = parseGeo(log?.geo)
    if (!g) continue

    const key = toGroupKey(g.lat, g.lng, p)

    if (!groups.has(key)) {
      groups.set(key, {
        key,
        sumLat: 0,
        sumLng: 0,
        n: 0,
        cnt: { success: 0, warn: 0, error: 0, other: 0 },
      })
      groupIndexMap.set(key, [])
    }

    const agg = groups.get(key)
    agg.sumLat += g.lat
    agg.sumLng += g.lng
    agg.n += 1

    const b = statusBucket(log?.status)
    agg.cnt[b] = (agg.cnt[b] || 0) + 1

    groupIndexMap.get(key).push(i)
  }

  const features = []
  for (const agg of groups.values()) {
    const lat = agg.sumLat / agg.n
    const lng = agg.sumLng / agg.n

    bounds.extend([lng, lat])
    hasAny = true

    const bucket = dominantBucketFromCounts(agg.cnt)

    features.push({
      type: 'Feature',
      geometry: { type: 'Point', coordinates: [lng, lat] },
      properties: {
        key: agg.key,
        count: agg.n,
        bucket,
      },
    })
  }

  return {
    geojson: { type: 'FeatureCollection', features },
    bounds: hasAny ? bounds : null,
  }
}

// ---------------- GPU pin icons (no DOM) ----------------
function makePinImageData(color, size = 48) {
  // 1) render normal en canvas base
  const base = document.createElement('canvas')
  base.width = size
  base.height = size
  const ctx = base.getContext('2d')

  const cx = size / 2
  const r = size * 0.17
  const cy = size * 0.33
  const tipY = size * 0.92
  const w = r * 2.35

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

  // 2) rotación 180° en un canvas final
  const out = document.createElement('canvas')
  out.width = size
  out.height = size
  const o = out.getContext('2d')

  o.translate(size / 2, size / 2)
  o.rotate(Math.PI) // ✅ 180°
  o.translate(-size / 2, -size / 2)
  o.drawImage(base, 0, 0)

  const img = o.getImageData(0, 0, size, size)
  return { width: size, height: size, data: img.data }
}

function ensurePinImages() {
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

function topEntries(obj, n = 12) {
  if (!obj) return []
  return Object.entries(obj)
    .sort((a, b) => b[1] - a[1])
    .slice(0, n)
}

function actorLabel(log) {
  return String(getDeep(log, 'actor.fullName') || getDeep(log, 'actor.username') || 'N/A')
}

function deviceLabel(log) {
  return String(
    getDeep(log, 'meta.device') ||
      getDeep(log, 'meta.platform') ||
      getDeep(log, 'meta.osVersion') ||
      'N/A',
  )
}

function officeLabel(log) {
  // Ajusta paths a como venga en tu data real:
  return String(
    getDeep(log, 'meta.office') ||
      getDeep(log, 'meta.officeName') ||
      getDeep(log, 'meta.branch') ||
      getDeep(log, 'tenant.name') ||
      getDeep(log, 'office.name') ||
      'N/A',
  )
}

function hashColorIndex(str) {
  const s = String(str || '')
  let h = 0
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) >>> 0
  return h
}

// paleta similar a tu imagen (verde / cian / ámbar / violeta / rojo)
const PILL_PALETTE = [
  { border: 'rgba(34,197,94,0.55)', glow: 'rgba(34,197,94,0.15)', text: '#4ade80' }, // green
  { border: 'rgba(34,211,238,0.55)', glow: 'rgba(34,211,238,0.15)', text: '#22d3ee' }, // cyan
  { border: 'rgba(245,158,11,0.55)', glow: 'rgba(245,158,11,0.15)', text: '#fbbf24' }, // amber
  { border: 'rgba(168,85,247,0.55)', glow: 'rgba(168,85,247,0.15)', text: '#c084fc' }, // purple
  { border: 'rgba(239,68,68,0.55)', glow: 'rgba(239,68,68,0.15)', text: '#fb7185' }, // red-ish
]

function etypeStyle(label, active) {
  const idx = hashColorIndex(label) % PILL_PALETTE.length
  const c = PILL_PALETTE[idx]

  return {
    '--pill-border': c.border,
    '--pill-glow': c.glow,
    '--pill-text': c.text,
    opacity: active ? 1 : 0.92,
  }
}

function toggleEventTypeFilter(value) {
  dlg.value.eventTypeFilter = dlg.value.eventTypeFilter === value ? null : value
  applySidebarFilters()
}

function applySidebarFilters() {
  const q = String(dlg.value.search || '')
    .trim()
    .toLowerCase()
  const et = dlg.value.eventTypeFilter

  dlg.value.filteredLogs = (dlg.value.logs || []).filter((l) => {
    if (et && String(l?.eventType ?? 'N/A') !== et) return false

    if (!q) return true
    return (
      String(l?.eventType ?? '')
        .toLowerCase()
        .includes(q) ||
      String(l?.status ?? '')
        .toLowerCase()
        .includes(q) ||
      actorLabel(l).toLowerCase().includes(q) ||
      deviceLabel(l).toLowerCase().includes(q) ||
      officeLabel(l).toLowerCase().includes(q) ||
      String(l?.message ?? '')
        .toLowerCase()
        .includes(q)
    )
  })
}

// ---------------- Build GeoJSON once (full) ----------------
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

// ---------------- Projection toggle (chip) ----------------
function applyProjection(type) {
  if (!map) return
  projectionType.value = type
  try {
    map.setProjection({ type })
  } catch (e) {
    console.warn('Projection not supported, fallback to mercator:', e)
    // fallback
    projectionType.value = 'mercator'
  }
  // re-culling al cambiar proyección
  scheduleCulling()
}

function toggleProjection() {
  if (!map) return
  const cur = map.getProjection?.()?.type || projectionType.value
  const next = cur === 'globe' ? 'mercator' : 'globe'
  applyProjection(next)
}

// ---------------- Globe culling (GPU, via source.setData) ----------------
let cullRaf = null

function lngLatToVec(lng, lat) {
  const rad = Math.PI / 180
  const φ = lat * rad
  const λ = lng * rad
  const cosφ = Math.cos(φ)
  return { x: cosφ * Math.cos(λ), y: cosφ * Math.sin(λ), z: Math.sin(φ) }
}

function isFrontHemisphere(lng, lat, cLng, cLat) {
  const a = lngLatToVec(lng, lat)
  const c = lngLatToVec(cLng, cLat)
  const dot = a.x * c.x + a.y * c.y + a.z * c.z
  return dot > 0.02 // umbral anti-parpadeo
}

function applyCullingNow() {
  if (!map || !loaded) return
  const src = map.getSource('logs-src')
  if (!src) return

  const proj = map.getProjection?.()?.type || projectionType.value
  if (proj !== 'globe') {
    src.setData(fullGeojson)
    return
  }

  const center = map.getCenter()
  const visible = fullGeojson.features.filter((f) => {
    const [lng, lat] = f.geometry.coordinates
    return isFrontHemisphere(lng, lat, center.lng, center.lat)
  })

  src.setData({ type: 'FeatureCollection', features: visible })
}

function scheduleCulling() {
  if (cullRaf) return
  cullRaf = requestAnimationFrame(() => {
    cullRaf = null
    applyCullingNow()
  })
}

function actorShort(log) {
  // usa tu actorLabel y si viene USUARIO_0XX, lo deja tal cual
  const a = actorLabel(log)
  if (!a || a === 'N/A') return 'N/A'
  return a.length > 16 ? a.slice(0, 16) + '…' : a
}

function dateShort(eventTime) {
  if (!eventTime) return 'N/A'
  try {
    const d = new Date(eventTime)
    // estilo como la imagen: "6 de abril de 2025"
    return d.toLocaleDateString('es-MX', { day: 'numeric', month: 'long', year: 'numeric' })
  } catch {
    return String(eventTime)
  }
}

// ---------------- Map init ----------------
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
      layers: [
        {
          id: 'simple-tiles',
          type: 'raster',
          source: 'raster-tiles',
        },
      ],
      id: 'blank',
    },
    center: [pLng, pLat],
    zoom: startZoom,
    maxZoom: 18,
    renderWorldCopies: false,
  })

  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left')

  map.on('style.load', () => {
    applyProjection(props.mapProjection === 'mercator' ? 'mercator' : 'globe')
  })

  map.once('load', () => {
    loaded = true
    map.resize()

    ensurePinImages()

    map.addSource('logs-src', {
      type: 'geojson',
      data: { type: 'FeatureCollection', features: [] },
      cluster: false,
    })

    // ✅ CÍRCULO (por grupo)
    map.addLayer({
      id: 'geo-groups',
      type: 'circle',
      source: 'logs-src',
      paint: {
        // color por cantidad (verde -> naranja -> rojo)
        'circle-color': [
          'step',
          ['get', 'count'],
          '#22c55e', // 1+
          5,
          '#f59e0b', // 5+
          20,
          '#ef4444', // 20+
        ],
        // tamaño por cantidad
        'circle-radius': [
          'step',
          ['get', 'count'],
          10, // 1+
          5,
          14, // 5+
          20,
          18, // 20+
          100,
          24, // 100+
        ],
        'circle-stroke-color': '#ffffff',
        'circle-stroke-width': 2,
        'circle-opacity': 0.95,
      },
    })

    // ✅ NÚMERO encima
    map.addLayer({
      id: 'geo-groups-count',
      type: 'symbol',
      source: 'logs-src',
      layout: {
        'text-field': ['to-string', ['get', 'count']],
        'text-size': 12,
        'text-allow-overlap': true,
      },
      paint: { 'text-color': '#ffffff' },
    })

    // cursor
    map.on('mouseenter', 'geo-groups', () => (map.getCanvas().style.cursor = 'pointer'))
    map.on('mouseleave', 'geo-groups', () => (map.getCanvas().style.cursor = ''))

    map.on('click', 'geo-groups', (e) => {
      const f = e.features?.[0]
      if (!f) return

      const key = String(f.properties?.key || '')
      const idxs = groupIndexMap.get(key) || []
      const groupLogs = idxs.map((i) => props.logs[i]).filter(Boolean)

      const [lng, lat] = f.geometry.coordinates
      const center = { lat, lng }

      const summary = buildGroupSummary(groupLogs, center)

      dlg.value.key = key
      dlg.value.center = center
      dlg.value.centerLabel = `Lat ${lat.toFixed(6)}, Lng ${lng.toFixed(6)}`
      dlg.value.logs = groupLogs
      dlg.value.filteredLogs = groupLogs
      dlg.value.summary = summary
      dlg.value.search = ''
      dlg.value.open = true
      dlg.value.eventTypeFilter = null
      applySidebarFilters()

      // Si quieres que tu panel externo se abra igual:
      // emit('select-area', summary)
    })

    map.on('click', (e) => {
      const hits = map.queryRenderedFeatures(e.point, {
        layers: ['geo-groups', 'geo-groups-count'],
      })
      if (hits?.length) return
      const center = { lat: e.lngLat.lat, lng: e.lngLat.lng }
      emit('select-area', buildSummary(props.logs, center, props.clickRadiusKm))
    })

    // ✅ culling solo al terminar interacción (fluido con 20k+)
    map.on('moveend', scheduleCulling)
    map.on('zoomend', scheduleCulling)
    map.on('rotateend', scheduleCulling)
    map.on('pitchend', scheduleCulling)

    refreshGroups()

    ro = new ResizeObserver(() => {
      if (!map) return
      requestAnimationFrame(() => map.resize())
    })
    ro.observe(mapEl.value)
  })
}

function refreshGroups() {
  if (!map || !loaded) return
  const src = map.getSource('logs-src')
  if (!src) return

  const { geojson, bounds } = buildGroupedGeoJSONFromLogs()
  fullGeojson = geojson

  src.setData(fullGeojson)

  if (bounds) {
    map.fitBounds(bounds, { padding: 30, maxZoom: 12 })
  }
}

onMounted(initMap)

onMounted(() => {
  nextTick(() => syncMapHeight())
})

watch(
  () => props.logs,
  async () => {
    await nextTick()
    refreshGroups()
  },
)

watch(
  () => dlg.value.search,
  () => {
    applySidebarFilters()
  },
)

onBeforeUnmount(() => {
  try {
    ro?.disconnect()
    ro = null
    popup?.remove()
    popup = null
    if (cullRaf) cancelAnimationFrame(cullRaf)
    cullRaf = null
    if (map) map.remove()
  } finally {
    map = null
    loaded = false
  }
})

// Exporta toggleProjection y projectionLabel si tu template los usa
defineExpose({ toggleProjection, projectionLabel })
</script>

<style scoped>
/* tu mapa */
.mapa-container {
  height: 520px;
  border-radius: 10px;
  overflow: hidden;
}

.chip-disabled {
  opacity: 0.55;
  pointer-events: none;
}

.office-modal {
  width: min(1100px, 94vw);
  max-width: 1100px;
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 24, 0.96));
  border: 1px solid rgba(99, 102, 241, 0.18);
  border-radius: 18px;
  box-shadow: 0 18px 60px rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(10px);
}

.office-modal__header {
  background:
    radial-gradient(circle at 20% 0%, rgba(34, 211, 238, 0.14), transparent 40%),
    radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.14), transparent 40%);
}

.kpi-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
}

.kpi-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}

.kpi-value {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  margin-top: 4px;
}

.mini-card {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
  min-height: 120px;
}

.mini-card__title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.mini-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.logs-virtual {
  height: 320px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
}

.log-row {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
}

.log-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.office-sidebar {
  width: min(520px, 92vw); /* “ancho considerable” */
  background: linear-gradient(180deg, rgba(15, 23, 42, 0.96), rgba(9, 13, 24, 0.96));
  border-left: 1px solid rgba(99, 102, 241, 0.18);
  border-top-left-radius: 18px;
  border-bottom-left-radius: 18px;
  box-shadow: -18px 0 60px rgba(0, 0, 0, 0.55);
  overflow: hidden;
}

.office-sidebar__header {
  background:
    radial-gradient(circle at 20% 0%, rgba(34, 211, 238, 0.14), transparent 40%),
    radial-gradient(circle at 80% 0%, rgba(168, 85, 247, 0.14), transparent 40%);
}

.office-sidebar__body {
  overflow-y: auto;
  max-height: 100%;
}

.kpi-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
}

.kpi-title {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.65);
}
.kpi-value {
  font-size: 20px;
  font-weight: 800;
  color: #fff;
  margin-top: 4px;
}

.mini-card {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
}

.mini-card__title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}
.mini-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.logs-virtual {
  height: 280px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
}

.log-row {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
}
.log-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.map-wrap {
  position: relative;
}

/* Sidebar incrustado */
.map-sidebar {
  position: absolute;
  top: -1px;
  right: -1px;
  bottom: -1px;

  width: min(520px, 92%);
  background: #1e1e2f; /* ✅ igual que el mapa/card */
  border-radius: 12px;
  overflow: hidden;
  /* z-index: 5; encima del mapa */
  display: flex;
  flex-direction: column;
}

.map-sidebar__header {
  padding: 12px 12px 10px 12px;
  background: rgba(255, 255, 255, 0.04);
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.map-sidebar__body {
  padding: 12px;
  overflow-y: auto;
  flex: 1;
}

/* cards estilo oficinas */
.mini-card {
  background: rgba(255, 255, 255, 0.035);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
  padding: 10px 12px;
}

.mini-card__title {
  font-size: 13px;
  font-weight: 800;
  color: #fff;
  margin-bottom: 8px;
}

.mini-card__chips {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.logs-virtual {
  height: 260px;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(0, 0, 0, 0.18);
}

.log-row {
  padding: 10px 12px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
  cursor: pointer;
}

.log-row:hover {
  background: rgba(255, 255, 255, 0.04);
}

.etype-section {
  padding: 6px 2px;
}

.etype-title {
  font-size: 11px;
  letter-spacing: 0.14em;
  font-weight: 800;
  color: rgba(255, 255, 255, 0.55);
  margin: 2px 0 10px 2px;
}

.etype-pills {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.etype-pill {
  display: inline-flex;
  align-items: center;
  gap: 8px;

  padding: 6px 10px;
  border-radius: 10px;

  background: rgba(0, 0, 0, 0.2);
  border: 2px solid var(--pill-border);

  color: var(--pill-text);
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  font-size: 9px;

  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.08) inset,
    0 0 18px var(--pill-glow);

  cursor: pointer;
  user-select: none;
  transition:
    transform 0.12s ease,
    filter 0.12s ease,
    opacity 0.12s ease;
}

.etype-pill:hover {
  transform: translateY(-1px);
  filter: brightness(1.05);
}

.etype-pill--active {
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.14) inset,
    0 0 26px var(--pill-glow);
}

.etype-pill__count {
  opacity: 0.85;
  font-weight: 800;
}

.etype-pill--clear {
  border-color: rgba(148, 163, 184, 0.4);
  color: rgba(226, 232, 240, 0.9);
  box-shadow: 0 0 0 1px rgba(255, 255, 255, 0.06) inset;
  background: rgba(255, 255, 255, 0.05);
}

.logs-card {
  background: #21826A;
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 16px;
  box-shadow: 0 18px 55px rgba(0,0,0,0.35);
  overflow: hidden;
}

.logs-card__title {
  display: flex;
  align-items: center;
  padding: 12px 14px;
  background: rgba(0,0,0,0.18);
  border-bottom: 1px solid rgba(255,255,255,0.08);
}

.logs-card__list {
  padding: 10px;
}

.logs-virtual--flat {
  height: 290px; /* ajusta según tu sidebar */
}

.log-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;

  padding: 10px 12px;
  margin-bottom: 10px;

  background: rgba(255,255,255,0.08);
  border: 1px solid rgba(255,255,255,0.10);
  border-radius: 14px;

  cursor: pointer;
  transition: transform .12s ease, background .12s ease, border-color .12s ease;
}

.log-item:hover {
  transform: translateY(-1px);
  background: rgba(255,255,255,0.10);
  border-color: rgba(255,255,255,0.16);
}

.log-item__left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.log-item__icon {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;

  background: rgba(255,255,255,0.10);
  border: 1px solid rgba(255,255,255,0.14);
}

.log-item__main {
  min-width: 0;
}

.log-item__title {
  font-weight: 900;
  color: #fff;
  letter-spacing: 0.02em;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px; /* ajusta si tu sidebar es más ancho */
}

.log-item__sub {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(255,255,255,0.75);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 260px;
}

.log-item__right {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

.chip-user {
  background: rgba(245, 158, 11, 0.95); /* naranja como la imagen */
  font-weight: 800;
}

.chip-date {
  background: rgba(59, 130, 246, 0.95); /* azul como la imagen */
  font-weight: 800;
}

.no-scrollbar {
  /* Ocultar en Chrome, Safari y Opera */
  &::-webkit-scrollbar {
    display: none;
  }

  /* Ocultar en Firefox, IE y Edge */
  -ms-overflow-style: none;  /* IE y Edge */
  scrollbar-width: none;  /* Firefox */
}
</style>
