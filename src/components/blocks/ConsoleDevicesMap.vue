<script setup>
import { onBeforeUnmount, onMounted, ref, watch } from 'vue'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'
import 'leaflet.markercluster/dist/MarkerCluster.css'
import 'leaflet.markercluster/dist/MarkerCluster.Default.css'
import 'leaflet.markercluster'
import { useI18n } from 'vue-i18n'

const { t } = useI18n()

// ─────────────────────────────────────────────────────────────────────────────
// PROPS & EMITS
// ─────────────────────────────────────────────────────────────────────────────
const props = defineProps({
  // [{ lat, lon, deviceId, hostname, system, status, ip, locationName, lastSeen }]
  devices: { type: Array, default: () => [] },
})

const emit = defineEmits(['select-device'])

// ─────────────────────────────────────────────────────────────────────────────
// STATE
// ─────────────────────────────────────────────────────────────────────────────
const mapEl      = ref(null)
const mapInstance = ref(null)
let clusterGroup = null
let tileLayer    = null

// ─────────────────────────────────────────────────────────────────────────────
// INIT
// ─────────────────────────────────────────────────────────────────────────────
function initMap() {
  if (mapInstance.value || !mapEl.value) return

  mapInstance.value = L.map(mapEl.value, {
    center: [19.4326, -99.1332],
    zoom: 5,
    minZoom: 2,
    maxBounds: [[-90, -180], [90, 180]],
    maxBoundsViscosity: 1.0,
    zoomControl: true,
  })

  // CARTO Dark tiles
  tileLayer = L.tileLayer(
    'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    {
      attribution: '© OpenStreetMap contributors',
      maxZoom: 19,
    },
  )
  tileLayer.addTo(mapInstance.value)

  clusterGroup = L.markerClusterGroup({
    maxClusterRadius: 60,
    disableClusteringAtZoom: 20,
    spiderfyOnMaxZoom: true,
    animate: true,
    animateAddingMarkers: true,
    iconCreateFunction: createClusterIcon,
  })

  mapInstance.value.addLayer(clusterGroup)
  renderMarkers()
}

// ─────────────────────────────────────────────────────────────────────────────
// RENDER MARKERS
// ─────────────────────────────────────────────────────────────────────────────
function renderMarkers() {
  if (!clusterGroup) return
  clusterGroup.clearLayers()

  const valid = (props.devices || []).filter(
    (d) =>
      d.lat != null &&
      d.lon != null &&
      Number.isFinite(+d.lat) &&
      Number.isFinite(+d.lon) &&
      +d.lat >= -90 &&
      +d.lat <= 90 &&
      +d.lon >= -180 &&
      +d.lon <= 180,
  )

  valid.forEach((d) => {
    const isOnline = d.status === 'ONLINE'
    const marker = L.marker([+d.lat, +d.lon], {
      icon: createDeviceIcon(isOnline),
      // Guardamos el id para identificar el marcador sin depender de coordenadas
      deviceId: d.deviceId,
    })

    bindDevicePopup(marker, d, isOnline)

    marker.on('click', () => {
      emit('select-device', {
        deviceId: d.deviceId,
        hostname: d.hostname || '',
        system: d.system || '',
        status: d.status || '',
        ip: d.ip || '',
        locationName: d.locationName || '',
        lastSeen: d.lastSeen || '',
        lat: Number(d.lat),
        lon: Number(d.lon),
      })
    })

    clusterGroup.addLayer(marker)
  })

  fitBounds(valid)
}

// ─────────────────────────────────────────────────────────────────────────────
// ICONS
// ─────────────────────────────────────────────────────────────────────────────
function createDeviceIcon(isOnline) {
  const html = isOnline
    ? `<div class="cdm-marker cdm-marker--online">
         <div class="cdm-marker__ring"></div>
         <div class="cdm-marker__dot"></div>
       </div>`
    : `<div class="cdm-marker cdm-marker--offline">
         <div class="cdm-marker__dot"></div>
       </div>`

  return L.divIcon({
    html,
    iconSize: [40, 40],
    iconAnchor: [20, 20],
    popupAnchor: [0, -22],
    className: '',
  })
}

function createClusterIcon(cluster) {
  const markers  = cluster.getAllChildMarkers()
  const online   = markers.filter((m) => m.options.deviceId &&
    (props.devices || []).find((d) => d.deviceId === m.options.deviceId)?.status === 'ONLINE').length
  const total    = markers.length
  const allOnline = online === total
  const allOffline = online === 0

  const gradient = allOnline
    ? 'linear-gradient(135deg,#22c55e,#16a34a)'
    : allOffline
      ? 'linear-gradient(135deg,#ef4444,#b91c1c)'
      : 'linear-gradient(135deg,#3b82f6,#1d4ed8)'

  const html = `
    <div class="cdm-cluster" style="background:${gradient}">
      <span>${total}</span>
    </div>`

  return L.divIcon({
    html,
    iconSize: [46, 46],
    iconAnchor: [23, 23],
    className: '',
  })
}

// ─────────────────────────────────────────────────────────────────────────────
// POPUP
// ─────────────────────────────────────────────────────────────────────────────
function bindDevicePopup(marker, d, isOnline) {
  const color       = isOnline ? '#22c55e' : '#ef4444'
  const statusLabel = isOnline
    ? t('dashboard.devicesMapOnline')
    : t('dashboard.devicesMapOffline')
  const lastSeen    = d.lastSeen ? new Date(d.lastSeen).toLocaleString() : '—'
  const name        = d.hostname || d.deviceId

  marker.bindTooltip(
    `<div class="cdm-popup">
      <div class="cdm-popup__header">
        <span class="cdm-popup__dot" style="background:${color}"></span>
        <strong class="cdm-popup__name">${name}</strong>
      </div>
      <div class="cdm-popup__id">${d.deviceId}</div>
      <div class="cdm-popup__row">
        <span class="cdm-popup__label">${t('dashboard.devicesMapIp')}:</span>
        ${d.ip || '—'}
      </div>
      ${d.locationName
        ? `<div class="cdm-popup__row">
             <span class="cdm-popup__label">${t('dashboard.devicesMapLocation')}:</span>
             ${d.locationName}
           </div>`
        : ''}
      <div class="cdm-popup__row">
        <span class="cdm-popup__label">${t('dashboard.devicesMapLastSeen')}:</span>
        ${lastSeen}
      </div>
      <div class="cdm-popup__status" style="color:${color}">${statusLabel}</div>
    </div>`,
    { direction: 'top', offset: [0, -22], className: 'cdm-tooltip', sticky: false },
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// FIT BOUNDS
// ─────────────────────────────────────────────────────────────────────────────
function fitBounds(valid) {
  if (!mapInstance.value || !valid?.length) return
  const bounds = L.latLngBounds(valid.map((d) => [+d.lat, +d.lon]))
  mapInstance.value.fitBounds(bounds, { padding: [50, 50], maxZoom: 12 })
}

// ─────────────────────────────────────────────────────────────────────────────
// WATCH
// ─────────────────────────────────────────────────────────────────────────────
watch(() => props.devices, renderMarkers, { deep: false })

// ─────────────────────────────────────────────────────────────────────────────
// LIFECYCLE
// ─────────────────────────────────────────────────────────────────────────────
onMounted(initMap)

onBeforeUnmount(() => {
  if (mapInstance.value) {
    mapInstance.value.remove()
    mapInstance.value = null
  }
})
</script>

<template>
  <div>
    <div ref="mapEl" class="cdm-map" />
  </div>
</template>

<style lang="scss" scoped>
.cdm-map {
  width: 100%;
  height: 520px;
  border-radius: 12px;
}
</style>

<!-- Global: Leaflet inyecta los iconos en el DOM fuera del shadow scope -->
<style lang="scss">
// ── Marker: ONLINE (pulsing) ──────────────────────────────────────────────────
.cdm-marker {
  position: relative;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;

  &__dot {
    position: relative;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    border: 2.5px solid #fff;
    z-index: 2;
  }

  &__ring {
    position: absolute;
    top: 50%;
    left: 50%;
    width: 20px;
    height: 20px;
    transform: translate(-50%, -50%);
    border: 2px solid rgba(34, 197, 94, 0.8);
    border-radius: 50%;
    animation: cdm-pulse 1.8s ease-out infinite;
    z-index: 1;
  }

  &--online .cdm-marker__dot {
    background: #22c55e;
    box-shadow: 0 0 10px rgba(34, 197, 94, 0.55);
  }

  &--offline .cdm-marker__dot {
    background: #ef4444;
    box-shadow: 0 0 6px rgba(239, 68, 68, 0.4);
  }
}

@keyframes cdm-pulse {
  0% {
    width: 20px;
    height: 20px;
    opacity: 0.9;
  }
  100% {
    width: 46px;
    height: 46px;
    opacity: 0;
  }
}

// ── Cluster icon ──────────────────────────────────────────────────────────────
.cdm-cluster {
  width: 46px;
  height: 46px;
  border: 3px solid #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);

  span {
    font-size: 14px;
    font-weight: 800;
    color: #fff;
    line-height: 1;
  }
}

// ── Tooltip ───────────────────────────────────────────────────────────────────
.leaflet-tooltip.cdm-tooltip {
  background: rgba(10, 14, 26, 0.96) !important;
  border: 1px solid rgba(255, 255, 255, 0.1) !important;
  border-radius: 10px !important;
  box-shadow: 0 6px 20px rgba(0, 0, 0, 0.45) !important;
  padding: 0 !important;
  color: #fff;

  &::before {
    border-top-color: rgba(10, 14, 26, 0.96) !important;
  }
}

.cdm-popup {
  padding: 12px 14px;
  font-size: 12px;
  min-width: 170px;

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
    font-size: 13px;
    font-weight: 700;
    color: #fff;
    line-height: 1.2;
  }

  &__id {
    font-size: 11px;
    color: rgba(255, 255, 255, 0.45);
    margin-bottom: 6px;
    margin-left: 14px;
  }

  &__row {
    margin-bottom: 3px;
    color: rgba(255, 255, 255, 0.8);
  }

  &__label {
    color: rgba(255, 255, 255, 0.45);
    margin-right: 2px;
  }

  &__status {
    font-weight: 700;
    margin-top: 8px;
    font-size: 12px;
  }
}
</style>
