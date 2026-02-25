<template>
  <!-- ✅ Funcionalidades más usadas (estilo screenshot) -->
  <div v-if="!loading" class="q-mb-lg">
    <q-card flat bordered class="func-wrap text-white q-pa-lg">
      <!-- Header -->
      <div class="flex items-center q-col-gutter-md">
        <!-- Doughnut izquierda -->
        <div class="col-auto">
          <div class="donut" :style="donutStyle">
            <div class="donut-inner">
              <div class="donut-pct">{{ donutCenterPct }}</div>
              <div class="donut-sub text-grey-5">{{ donutCenterLabel }}</div>
            </div>
          </div>
        </div>

        <!-- Título -->
        <div class="col">
          <div
            class="text-subtitle1 text-grey-4"
            :class="$q.platform.is.mobile ? 'text-subtitle2' : ''"
          >
            Funcionalidades más usadas
          </div>
          <div class="text-caption text-grey-5">
            <span v-if="funcUsage.topName">
              Top: <span class="text-white">{{ funcUsage.topName }}</span> ({{ funcUsage.topPct }}%)
            </span>
            <span v-else>Sin datos</span>
          </div>
        </div>

        <!-- Total derecha -->
        <div class="col-auto text-right">
          <div class="text-caption text-grey-5 q-mt-md">Total procesados</div>
          <div class="text-h3 text-weight-bold" :class="$q.platform.is.mobile ? 'text-h4' : ''">
            {{ funcUsage.total }}
          </div>
        </div>
      </div>

      <!-- Sub-cards -->
      <div class="row justify-center q-col-gutter-md">
        <div v-for="it in funcUsage.items" :key="it.name" class="col-12 col-md-2">
          <q-card flat bordered class="func-subcard q-pa-md">
            <div class="flex items-center q-mb-sm">
              <span class="func-dot q-mr-sm" :style="{ background: it.color }"></span>
              <div class="text-subtitle2 ellipsis" style="max-width: 70%">{{ it.name }}</div>
              <q-space />
              <div class="text-h6 text-weight-bold">{{ it.count }}</div>
            </div>

            <q-linear-progress
              :value="it.ratio"
              :color="it.qColor"
              track-color="grey-9"
              rounded
              size="10px"
            />

            <div class="row justify-between q-mt-xs text-caption text-grey-5">
              <div>{{ it.pct }}% del total</div>
              <div>{{ it.count }}/{{ funcUsage.total }}</div>
            </div>
          </q-card>
        </div>
      </div>
    </q-card>
  </div>

  <!-- ✅ Oficinas + Etiquetas + Outcome (cards estilo oficinas) -->
  <div
    v-if="!loading && (topOffices.items.length || topTags.items.length || topOutcomes.items.length)"
    class="row q-col-gutter-md q-mb-md"
  >
    <div class="col-12 col-md-4" v-if="topOffices.items.length">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="apartment" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Oficinas</div>
            <div class="toplist-subtitle text-grey-5">Top locaciones</div>
          </div>
        </div>

        <div v-for="it in topOffices.items" :key="it.label" class="q-mb-md">
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress
            :value="it.ratioToMax"
            color="cyan"
            track-color="grey-9"
            rounded
            size="8px"
            class="q-mt-xs"
          />
        </div>
      </q-card>
    </div>

    <div class="col-12 col-md-4" v-if="topTags.items.length">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="sell" color="purple" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Etiquetas</div>
            <div class="toplist-subtitle text-grey-5">Distribución de eventos</div>
          </div>
        </div>

        <div v-for="it in topTags.items" :key="it.label" class="q-mb-md">
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress
            :value="it.ratioToMax"
            color="purple"
            track-color="grey-9"
            rounded
            size="8px"
            class="q-mt-xs"
          />
        </div>
      </q-card>
    </div>

    <div class="col-12 col-md-4" v-if="topOutcomes.items.length">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="insights" color="pink" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Resultados de eventos (outcome)</div>
            <div class="toplist-subtitle text-grey-5">Top valores</div>
          </div>
        </div>

        <div v-for="it in topOutcomes.items" :key="it.label" class="q-mb-md">
          <div class="row items-center">
            <div class="col text-subtitle2">{{ it.label }}</div>
            <div class="col-auto text-grey-5">{{ it.count }}</div>
          </div>
          <q-linear-progress
            :value="it.ratioToMax"
            color="pink"
            track-color="grey-9"
            rounded
            size="8px"
            class="q-mt-xs"
          />
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ Status a través del tiempo (líneas por status) -->
  <div v-if="!loading" class="row q-col-gutter-md q-mb-md">
    <div class="col-12">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="fact_check" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Estatus</div>
            <div class="toplist-subtitle text-grey-5">Comportamiento a través del tiempo</div>
          </div>
        </div>

        <div class="status-line-wrap">
          <canvas ref="statusLineCanvas"></canvas>
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ Severidad (pie por valor único) -->
  <div v-if="!loading" class="row justify-center q-col-gutter-md q-mb-md">
    <div class="col-12">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="warning" color="orange" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Severidad</div>
            <div class="toplist-subtitle text-grey-5">Distribución por nivel</div>
          </div>
        </div>

        <div class="severity-pie-wrap">
          <canvas ref="severityPieCanvas"></canvas>
        </div>
      </q-card>
    </div>
  </div>

  <!-- ✅ SOLO: Eventos por Día + Eventos por Semana (acumulado) -->
  <div v-if="!loading && timeChartDefs.length" class="row justify-center q-col-gutter-md q-mb-md">
    <div v-for="def in timeChartDefs" :key="def.id" class="col-sm-12 col-md-4">
      <DynamicChartCard :definition="def" :logs="logsFiltrados" />
    </div>
  </div>

  <!-- ✅ Mapa geográfico -->
  <div v-if="hasGeoLogs" class="q-mt-xl">
    <ConsoleGeoMap :logs="logsFiltrados" />
  </div>

  <!-- ✅ Dispositivos de Usuarios (desde meta) -->
  <div v-if="!loading && deviceList.items.length" class="row q-col-gutter-md q-my-md">
    <div class="col-12">
      <q-card flat bordered class="toplist-card q-pa-lg text-white">
        <div class="row items-center q-mb-md">
          <q-icon name="devices" color="cyan" size="18px" class="q-mr-sm" />
          <div>
            <div class="toplist-title">Dispositivos de Usuarios</div>
            <div class="toplist-subtitle text-grey-5">Detectados desde meta</div>
          </div>
          <q-space />
          <q-chip dense color="grey-9" text-color="grey-4" size="sm">
            Total: {{ deviceList.total }}
          </q-chip>
        </div>

        <q-scroll-area class="device-scroll">
          <q-list class="device-list">
            <q-item
              v-for="d in deviceList.items"
              :key="d.key"
              class="device-item"
              clickable
              v-ripple
            >
              <q-item-section avatar>
                <q-icon name="smartphone" color="cyan" />
              </q-item-section>

              <q-item-section>
                <q-item-label class="text-weight-bold">
                  {{ d.deviceName }}
                  <span v-if="d.user" class="text-grey-5"> | {{ d.user }}</span>
                </q-item-label>

                <q-item-label caption class="text-grey-5">
                  <span v-if="d.deviceModel">{{ d.deviceModel }}</span>
                  <span v-if="d.deviceBrand"> · {{ d.deviceBrand }}</span>
                  <span v-if="d.count > 1"> · {{ d.count }} eventos</span>
                </q-item-label>
              </q-item-section>

              <!-- ✅ Desktop/tablet: chips a la derecha -->
              <q-item-section side class="device-badges">
                <div class="row items-center q-gutter-xs device-badges-row">
                  <q-chip dense :color="d.platformColor" text-color="white" size="sm">
                    {{ d.platformLabel }}
                  </q-chip>

                  <q-chip dense color="primary" text-color="white" size="sm" v-if="d.lastSeenDate">
                    {{ d.lastSeenDate }}
                  </q-chip>

                  <q-chip dense color="orange" text-color="white" size="sm" v-if="d.eventType">
                    {{ d.eventType }}
                  </q-chip>
                </div>
              </q-item-section>
            </q-item>
          </q-list>
        </q-scroll-area>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted, nextTick, onBeforeUnmount } from 'vue'
import DynamicChartCard from '../blocks/DynamicChartCard.vue'
import ConsoleGeoMap from '../blocks/ConsoleGeoMap.vue'
import Chart from 'chart.js/auto'

const loading = ref(false)
const filtrosGlobales = inject('filtrosGlobales', ref({}))
const logsGlobales = inject('logsGlobales', ref([]))

const getDeep = (obj, path) =>
  String(path || '')
    .split('.')
    .reduce((o, k) => (o ? o[k] : null), obj)

const hasField = (items, path) => {
  for (const it of items || []) {
    const v = getDeep(it, path)
    if (v != null && v !== '') return true
  }
  return false
}

const logsFiltrados = computed(() => {
  let out = logsGlobales.value || []

  const values = filtrosGlobales.value?.values || {}
  const search = (filtrosGlobales.value?.busqueda || '').trim().toLowerCase()

  out = out.filter((log) => {
    for (const [k, v] of Object.entries(values)) {
      if (!v) continue
      if (String(getDeep(log, k)) !== String(v)) return false
    }
    return true
  })

  if (search) out = out.filter((l) => JSON.stringify(l).toLowerCase().includes(search))
  return out
})

const isPlainObject = (v) => v && typeof v === 'object' && !Array.isArray(v)

const tryParseJson = (v) => {
  if (typeof v !== 'string') return v
  const s = v.trim()
  if (!s.startsWith('{') || !s.endsWith('}')) return v
  try {
    return JSON.parse(s)
  } catch {
    return v
  }
}

const normalizePlatform = (p) =>
  String(p || '')
    .trim()
    .toLowerCase()

const platformChip = (platformRaw, osVersionRaw) => {
  const p = normalizePlatform(platformRaw)
  const os = String(osVersionRaw || '').trim()

  if (p.includes('android')) return { label: `Android${os ? ` ${os}` : ''}`, color: 'positive' }
  if (p.includes('ios') || p.includes('iphone') || p.includes('apple'))
    return { label: `iOS${os ? ` ${os}` : ''}`, color: 'dark' }
  if (p) return { label: `${p}${os ? ` ${os}` : ''}`.toUpperCase(), color: 'grey' }

  // fallback si solo hay osVersion
  if (os) return { label: `OS ${os}`, color: 'grey' }
  return { label: 'N/A', color: 'grey-8' }
}

// Extrae “lo de dispositivo” desde meta (robusto a variaciones)
const extractDeviceFromMeta = (metaRaw) => {
  let meta = tryParseJson(metaRaw)
  if (!isPlainObject(meta)) return null

  // Si meta trae nested device object, lo “aplanamos”
  if (isPlainObject(meta.device)) meta = { ...meta, ...meta.device }

  const deviceName = meta.deviceName || meta.device_name || meta.modelName || meta.model_name
  const deviceModel = meta.deviceModel || meta.device_model || meta.model || meta.hardwareModel
  const deviceBrand = meta.deviceBrand || meta.device_brand || meta.brand || meta.manufacturer

  const platform = meta.platform || meta.os || meta.osName
  const osVersion = meta.osVersion || meta.androidVersion || meta.iosVersion || meta.os_version

  // Si no hay señales claras de “dispositivo”, no lo consideramos
  const hasSignal = !!deviceName || !!deviceModel || !!deviceBrand || !!platform || !!osVersion

  if (!hasSignal) return null

  return {
    deviceName: String(deviceName || deviceModel || 'Dispositivo'),
    deviceModel: deviceModel ? String(deviceModel) : '',
    deviceBrand: deviceBrand ? String(deviceBrand) : '',
    platform: platform ? String(platform) : '',
    osVersion: osVersion ? String(osVersion) : '',
  }
}

const formatYMD = (iso) => {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return ''
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

const deviceList = computed(() => {
  const items = logsFiltrados.value || []
  const map = new Map()

  for (const log of items) {
    const dev = extractDeviceFromMeta(log?.meta)
    if (!dev) continue

    const user =
      getDeep(log, 'actor.username') ||
      getDeep(log, 'usuario.usuario') ||
      getDeep(log, 'actor.id') ||
      ''

    const lastSeenTs = new Date(log?.eventTime || '').getTime()
    const eventType = String(getDeep(log, 'eventType') || '')

    // key para dedupe (ajústalo si quieres separar por usuario)
    const key = [dev.deviceName, dev.deviceModel, dev.platform, dev.osVersion, user]
      .map((x) => String(x || '').trim())
      .join('|')

    const prev = map.get(key)
    if (!prev) {
      map.set(key, {
        key,
        ...dev,
        user: user ? String(user) : '',
        count: 1,
        lastSeenTs: Number.isFinite(lastSeenTs) ? lastSeenTs : -Infinity,
        lastSeenDate: Number.isFinite(lastSeenTs) ? formatYMD(log.eventTime) : '',
        eventType: eventType || '',
      })
    } else {
      prev.count += 1
      if (Number.isFinite(lastSeenTs) && lastSeenTs > prev.lastSeenTs) {
        prev.lastSeenTs = lastSeenTs
        prev.lastSeenDate = formatYMD(log.eventTime)
        prev.eventType = eventType || prev.eventType
      }
    }
  }

  // Orden por más reciente
  const arr = Array.from(map.values()).sort((a, b) => (b.lastSeenTs || 0) - (a.lastSeenTs || 0))

  // Limita para no saturar UI
  const limited = arr.slice(0, 20)

  // Chips platform
  const out = limited.map((d) => {
    const chip = platformChip(d.platform, d.osVersion)
    return {
      ...d,
      platformLabel: chip.label,
      platformColor: chip.color,
    }
  })

  return { total: arr.length, items: out }
})

/* -------------------------
   Funcionalidades (eventType)
-------------------------- */
const FUNC_COLORS = [
  { q: 'teal', hex: '#29d3c2' },
  { q: 'pink', hex: '#ff5c8a' },
  { q: 'orange', hex: '#ff9f43' },
  { q: 'cyan', hex: '#22d3ee' },
  { q: 'purple', hex: '#a78bfa' },
  { q: 'amber', hex: '#fbbf24' },
  { q: 'green', hex: '#22c55e' },
  { q: 'red', hex: '#ef4444' },
]

const funcUsage = computed(() => {
  const items = logsFiltrados.value || []
  const total = items.length
  if (!total) {
    return { total: 0, items: [], donutSegments: [], coveragePct: 0, topName: '', topPct: 0 }
  }

  const counts = new Map()
  for (const l of items) {
    const k = String(getDeep(l, 'eventType') || 'SIN_EVENT_TYPE')
    counts.set(k, (counts.get(k) || 0) + 1)
  }

  const arr = Array.from(counts.entries())
    .map(([name, count]) => ({ name, count }))
    .sort((a, b) => b.count - a.count)

  const topN = 6
  const top = arr.slice(0, topN)
  const topSum = top.reduce((s, x) => s + x.count, 0)
  const rest = total - topSum

  const topItems = top.map((x, idx) => {
    const ratio = x.count / total
    const pct = Math.round(ratio * 1000) / 10
    const color = FUNC_COLORS[idx % FUNC_COLORS.length]
    return { ...x, ratio, pct, qColor: color.q, color: color.hex }
  })

  const donutSegments = [...topItems]
  if (rest > 0 && arr.length > topN) {
    donutSegments.push({
      name: 'Otros',
      count: rest,
      ratio: rest / total,
      pct: Math.round((rest / total) * 1000) / 10,
      qColor: 'grey',
      color: '#6b7280',
    })
  }

  const coveragePct = Math.round((topSum / total) * 1000) / 10
  const topOne = topItems[0]
  return {
    total,
    items: topItems,
    donutSegments,
    coveragePct,
    topName: topOne?.name || '',
    topPct: topOne?.pct || 0,
  }
})

const donutCenterPct = computed(() => `${Math.round(Number(funcUsage.value?.coveragePct || 0))}%`)
const donutCenterLabel = computed(() => {
  const segs = funcUsage.value?.donutSegments || []
  if (!segs.length) return 'Top'
  return segs.some((s) => s.name === 'Otros') ? 'Cobertura' : 'Distribución'
})

const donutStyle = computed(() => {
  const segs = funcUsage.value?.donutSegments || []
  if (!segs.length) return { background: 'conic-gradient(rgba(255,255,255,0.10) 0 100%)' }

  let acc = 0
  const stops = []
  for (const s of segs) {
    const start = acc
    const delta = (Number(s.ratio) || 0) * 100
    acc = start + delta
    stops.push(`${s.color} ${start}% ${acc}%`)
  }
  if (acc < 100) stops.push(`rgba(255,255,255,0.10) ${acc}% 100%`)
  return { background: `conic-gradient(${stops.join(', ')})` }
})

/* -------------------------
   Top lists: Offices, Tags, Outcome
-------------------------- */
const toCountList = (arr, { topN = 4 } = {}) => {
  const list = Array.isArray(arr) ? arr : []
  if (!list.length) return { items: [] }

  const max = Math.max(...list.map((x) => x.count || 0), 0) || 1
  return {
    items: list.slice(0, topN).map((x) => ({
      label: x.label,
      count: x.count,
      ratioToMax: (x.count || 0) / max,
    })),
  }
}

const countByKey = (logs, key, { array = false, emptyLabel = 'N/A' } = {}) => {
  const m = new Map()
  for (const l of logs || []) {
    const v = getDeep(l, key)

    if (array) {
      const a = Array.isArray(v) ? v : []
      for (const t of a) {
        const label = String(t || emptyLabel)
        m.set(label, (m.get(label) || 0) + 1)
      }
    } else {
      const label = String(v || emptyLabel)
      m.set(label, (m.get(label) || 0) + 1)
    }
  }

  return Array.from(m.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count)
}

const topOffices = computed(() =>
  toCountList(
    countByKey(logsFiltrados.value, 'location.name', { array: false, emptyLabel: 'N/A' }),
    { topN: 4 },
  ),
)
const topTags = computed(() =>
  toCountList(countByKey(logsFiltrados.value, 'tags', { array: true, emptyLabel: 'N/A' }), {
    topN: 3,
  }),
)
const topOutcomes = computed(() =>
  toCountList(countByKey(logsFiltrados.value, 'outcome', { array: false, emptyLabel: 'N/A' }), {
    topN: 3,
  }),
)

/* -------------------------
   Status line chart (Chart.js)
-------------------------- */
const statusLineCanvas = ref(null)
let statusLineChart = null

const STATUS_COLORS = [
  '#29d3c2',
  '#ff5c8a',
  '#22d3ee',
  '#ff9f43',
  '#a78bfa',
  '#22c55e',
  '#fbbf24',
  '#ef4444',
]

const toDayKey = (iso) => {
  const d = new Date(iso)
  if (!Number.isFinite(d.getTime())) return null
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  return `${y}-${m}-${day}`
}

function buildStatusSeries(logs) {
  const items = Array.isArray(logs) ? logs : []
  const byDay = new Map()
  const statuses = new Set()

  for (const l of items) {
    const day = toDayKey(l?.eventTime)
    if (!day) continue
    const st = String(getDeep(l, 'status') || 'N/A')
    statuses.add(st)
    if (!byDay.has(day)) byDay.set(day, new Map())
    const m = byDay.get(day)
    m.set(st, (m.get(st) || 0) + 1)
  }

  const labels = Array.from(byDay.keys()).sort()
  const statusList = Array.from(statuses.values()).sort()

  const datasets = statusList.map((st, idx) => {
    const color = STATUS_COLORS[idx % STATUS_COLORS.length]
    return {
      label: st,
      data: labels.map((day) => byDay.get(day)?.get(st) || 0),
      borderColor: color,
      backgroundColor: color,
      borderWidth: 2,
      pointRadius: 0,
      tension: 0.35,
    }
  })

  return { labels, datasets }
}

async function renderStatusLineChart() {
  await nextTick()
  const el = statusLineCanvas.value
  if (!el) return

  if (statusLineChart) {
    statusLineChart.destroy()
    statusLineChart = null
  }

  const { labels, datasets } = buildStatusSeries(logsFiltrados.value)
  if (!labels.length || !datasets.length) return

  statusLineChart = new Chart(el.getContext('2d'), {
    type: 'line',
    data: { labels, datasets },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: { position: 'bottom', labels: { color: 'rgba(255,255,255,0.75)', boxWidth: 10 } },
        tooltip: { titleColor: '#fff', bodyColor: '#fff' },
      },
      scales: {
        x: {
          ticks: { color: 'rgba(255,255,255,0.55)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
        y: {
          beginAtZero: true,
          ticks: { color: 'rgba(255,255,255,0.55)' },
          grid: { color: 'rgba(255,255,255,0.06)' },
        },
      },
    },
  })
}

/* -------------------------
   Severity pie chart (Chart.js)
-------------------------- */
const severityPieCanvas = ref(null)
let severityPieChart = null

const SEVERITY_ORDER = ['DEBUG', 'INFO', 'WARN', 'WARNING', 'ERROR', 'FATAL', 'CRITICAL', 'N/A']
const SEVERITY_COLORS = {
  DEBUG: '#94a3b8',
  INFO: '#22d3ee',
  WARN: '#ff9f43',
  WARNING: '#ff9f43',
  ERROR: '#ef4444',
  FATAL: '#ff5c8a',
  CRITICAL: '#a78bfa',
  'N/A': '#6b7280',
}

function countSeverity(logs) {
  const m = new Map()
  for (const l of logs || []) {
    const key = String(getDeep(l, 'severity') || 'N/A').toUpperCase()
    m.set(key, (m.get(key) || 0) + 1)
  }

  const entries = Array.from(m.entries())
  entries.sort((a, b) => {
    const ia = SEVERITY_ORDER.indexOf(a[0])
    const ib = SEVERITY_ORDER.indexOf(b[0])
    const ra = ia === -1 ? 999 : ia
    const rb = ib === -1 ? 999 : ib
    if (ra !== rb) return ra - rb
    return b[1] - a[1]
  })

  return entries.map(([label, count]) => ({ label, count }))
}

async function renderSeverityPieChart() {
  await nextTick()
  const el = severityPieCanvas.value
  if (!el) return

  if (severityPieChart) {
    severityPieChart.destroy()
    severityPieChart = null
  }

  const rows = countSeverity(logsFiltrados.value)
  if (!rows.length) return

  const labels = rows.map((r) => r.label)
  const data = rows.map((r) => r.count)
  const colors = labels.map((l) => SEVERITY_COLORS[l] || '#29d3c2')
  const total = data.reduce((s, x) => s + x, 0) || 1

  severityPieChart = new Chart(el.getContext('2d'), {
    type: 'pie', // ✅ pastel
    data: {
      labels,
      datasets: [
        {
          data,
          backgroundColor: colors,
          borderColor: 'rgba(15,20,32,0.9)',
          borderWidth: 2,
        },
      ],
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'bottom',
          labels: {
            color: 'rgba(255,255,255,0.75)',
            boxWidth: 10,
          },
        },
        tooltip: {
          titleColor: '#fff',
          bodyColor: '#fff',
          callbacks: {
            label: (ctx) => {
              const v = Number(ctx.parsed || 0)
              const pct = Math.round((v / total) * 1000) / 10
              return `${ctx.label}: ${v} (${pct}%)`
            },
          },
        },
      },
    },
  })
}

/* -------------------------
   Time series defs (ONLY day/week)
-------------------------- */
const timeChartDefs = computed(() => {
  const items = logsFiltrados.value || []
  if (!hasField(items, 'eventTime')) return []

  // Detecta rango real en los datos
  let min = Infinity
  let max = -Infinity

  for (const l of items) {
    const t = new Date(l?.eventTime).getTime()
    if (!Number.isFinite(t)) continue
    if (t < min) min = t
    if (t > max) max = t
  }

  const spanMs = Number.isFinite(min) && Number.isFinite(max) ? max - min : 0
  const spanDays = spanMs / 86400000

  // ✅ Año solo si el rango es de ~6 meses o más
  const showYear = spanDays >= 183 // ~6 meses

  const defs = [
    {
      id: 'eventsByDay',
      mode: 'timeseries',
      title: 'Eventos por Día y Acumulado',
      icon: 'timeline',
      timeKey: 'eventTime',
      timeBucket: 'day',
    },
    {
      id: 'eventsByWeek',
      mode: 'timeseries',
      title: 'Eventos por Semana y Acumulado',
      icon: 'date_range',
      timeKey: 'eventTime',
      timeBucket: 'week',
    },
    {
      id: 'eventsByMonth',
      mode: 'timeseries',
      title: 'Eventos por Mes y Acumulado',
      icon: 'calendar_month',
      timeKey: 'eventTime',
      timeBucket: 'month',
    },
  ]

  if (showYear) {
    defs.push({
      id: 'eventsByYear',
      mode: 'timeseries',
      title: 'Eventos por Año y Acumulado',
      icon: 'event',
      timeKey: 'eventTime',
      timeBucket: 'year',
    })
  }

  return defs
})

/* -------------------------
   Geo
-------------------------- */
const parseGeoLight = (geo) => {
  if (!geo) return null

  if (typeof geo === 'object' && geo?.type === 'Point' && Array.isArray(geo.coordinates)) {
    const [lng, lat] = geo.coordinates.map(Number)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  if (typeof geo === 'object' && !Array.isArray(geo)) {
    const lat = Number(geo.lat ?? geo.latitude)
    const lng = Number(geo.lng ?? geo.lon ?? geo.longitude)
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng }
  }

  if (Array.isArray(geo) && geo.length >= 2) {
    const a = Number(geo[0]),
      b = Number(geo[1])
    if (!Number.isFinite(a) || !Number.isFinite(b)) return null
    const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
    const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
    if (aIsLat) return { lat: a, lng: b }
    if (bIsLat) return { lat: b, lng: a }
  }

  if (typeof geo === 'string') {
    const parts = geo.split(',').map((s) => Number(s.trim()))
    if (parts.length === 2 && parts.every(Number.isFinite)) {
      const [a, b] = parts
      const aIsLat = Math.abs(a) <= 90 && Math.abs(b) <= 180
      const bIsLat = Math.abs(b) <= 90 && Math.abs(a) <= 180
      if (aIsLat) return { lat: a, lng: b }
      if (bIsLat) return { lat: b, lng: a }
    }
  }

  return null
}

const logsConGeo = computed(() => (logsFiltrados.value || []).filter((l) => !!parseGeoLight(l.geo)))
const hasGeoLogs = computed(() => logsConGeo.value.length > 0)

/* -------------------------
   Lifecycle
-------------------------- */
const redrawCharts = () => {
  renderStatusLineChart()
  renderSeverityPieChart()
}

watch(logsFiltrados, () => redrawCharts())

onMounted(() => redrawCharts())

onBeforeUnmount(() => {
  if (statusLineChart) statusLineChart.destroy()
  if (severityPieChart) severityPieChart.destroy()
})
</script>

<style lang="scss" scoped>
.func-wrap {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border-radius: 18px;
  box-shadow: 0 8px 26px rgba(0, 0, 0, 0.45);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.func-subcard {
  background: rgba(255, 255, 255, 0.03);
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.func-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
  display: inline-block;
}

.donut {
  width: 78px;
  height: 78px;
  border-radius: 999px;
  display: grid;
  place-items: center;
  box-shadow: 0 10px 28px rgba(0, 0, 0, 0.35);
}

.donut-inner {
  width: 62px;
  height: 62px;
  border-radius: 999px;
  background: #0f1420;
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: grid;
  place-items: center;
  text-align: center;
}

.donut-pct {
  font-size: 16px;
  font-weight: 800;
  line-height: 1;
  margin-top: 5px;
}

.donut-sub {
  font-size: 10px;
  margin-top: -20px;
}

.toplist-card {
  background: linear-gradient(160deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  border-radius: 22px;
  border: 1px solid rgba(255, 255, 255, 0.06);
  box-shadow: 0 16px 44px rgba(0, 0, 0, 0.45);
}

.toplist-title {
  font-size: 18px;
  font-weight: 700;
}

.toplist-subtitle {
  font-size: 12px;
  margin-top: 2px;
}

.status-line-wrap {
  height: 260px;
}
.status-line-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

.severity-pie-wrap {
  height: 280px;
}
.severity-pie-wrap canvas {
  width: 100% !important;
  height: 100% !important;
}

.timecharts-wrap {
  width: 100%;
  max-width: 100%;
  overflow-x: clip; /* evita scroll horizontal */
  padding-left: 16px;
  padding-right: 16px;
}

/* en móvil reduce padding para que no “apriete” */
@media (max-width: 599px) {
  .timecharts-wrap {
    padding-left: 8px;
    padding-right: 8px;
  }
}

/* fuerza a que todo lo que esté dentro no crezca más del contenedor */
.timecharts-wrap :deep(.q-card),
.timecharts-wrap :deep(.q-card__section),
.timecharts-wrap :deep(.dynamic-chart-card),
.timecharts-wrap :deep(canvas) {
  max-width: 100% !important;
}

.device-list {
  padding: 0;
}

/* spacing entre items (en lugar de gap de flex) */
.device-list :deep(.device-item) {
  margin-bottom: 10px;
}
.device-list :deep(.device-item:last-child) {
  margin-bottom: 0;
}

.device-item {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

.device-badges-row {
  flex-wrap: nowrap;
}

@media (max-width: 599px) {
  .device-badges-row {
    flex-wrap: wrap; /* en móvil permite que bajen los chips */
    justify-content: flex-end;
  }
}

@media (max-width: 599px) {
  /* En móvil, deja que el texto respire */
  .device-item :deep(.q-item__section--main) {
    min-width: 0; /* importante para ellipsis y wrap */
  }

  /* Chips debajo, alineados a la izquierda y con wrap */
  .mobile-chips {
    justify-content: flex-start;
    flex-wrap: wrap;
    margin-top: 8px;
  }

  .device-badges-row {
    justify-content: center;
  }
}

/* Mejora general */
.device-item {
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.03);
  border: 1px solid rgba(255, 255, 255, 0.06);
}

/* Evita que el texto se corte raro */
.device-item :deep(.q-item__label) {
  white-space: normal;
  word-break: break-word;
}

/* Scroll para lista de dispositivos */
.device-scroll {
  height: calc(100vh - 260px);
  max-height: 420px; /* opcional */
  width: 100%;
}

.device-scroll :deep(.q-scrollarea__content) {
  min-height: 100%;
}

@media (max-width: 599px) {
  .device-scroll {
    height: 360px;
    max-height: 360px;
  }
}
</style>
