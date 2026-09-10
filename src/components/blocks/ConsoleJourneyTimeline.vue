<template>
  <div class="journey-timeline-root">
    <div
      v-for="group in timelineGroups"
      :key="group.key"
      class="journey-group q-mb-lg"
    >
      <q-card flat bordered class="journey-group-card">
        <q-card-section class="journey-group-header">
          <div class="row items-center q-gutter-x-sm">
            <q-icon name="person" color="cyan-4" size="20px" />
            <div class="text-subtitle1 text-weight-bold text-white">
              {{ group.actorName || t('consoleSimple.timelineActorLabel') }}
            </div>
            <q-chip
              v-if="group.deviceName"
              dense
              color="purple-8"
              text-color="white"
              icon="devices"
              class="q-ml-sm"
            >
              {{ group.deviceName }}
            </q-chip>
          </div>
        </q-card-section>

        <q-card-section class="journey-group-body">
          <q-timeline color="blue-5" side="right" dark>
            <q-timeline-entry
              v-for="(entry, index) in group.entries"
              :key="entry.log.id || `${group.key}-${index}`"
              :title="entry.title"
              :subtitle="entry.subtitle"
              :icon="entry.icon"
              :color="entry.color"
              :class="{ 'timeline-entry--failure': entry.isFailure }"
            >
              <div class="journey-entry-content" @click="$emit('click-log', entry.log)">
                <div class="row items-center q-gutter-x-xs q-mb-xs">
                  <q-chip dense :color="entry.statusColor" text-color="white" size="sm">
                    {{ entry.status }}
                  </q-chip>
                  <q-chip
                    v-if="entry.isFailure"
                    dense
                    color="red"
                    text-color="white"
                    size="sm"
                    icon="warning"
                  >
                    {{ t('consoleSimple.timelineFailurePoint') }}
                  </q-chip>
                </div>
                <div class="text-caption text-grey-4 ellipsis-2-lines">
                  {{ entry.message }}
                </div>
                <div v-if="entry.eventType" class="text-caption text-grey-6 q-mt-xs">
                  {{ entry.eventType }}
                </div>
              </div>
            </q-timeline-entry>
          </q-timeline>
        </q-card-section>
      </q-card>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'

const props = defineProps({
  logs: { type: Array, default: () => [] },
  selectedActorName: { type: String, default: '' },
})

defineEmits(['click-log'])

const { t, locale } = useI18n()

const ERROR_STATUSES = new Set(['ERROR', 'FAILED', 'BLOCKED', 'REJECTED', 'FAILURE'])

function getLogTimestamp(log) {
  const raw = log?.eventTime || log?.fechaHoraDia || log?.createdAt || log?.timestamp || ''
  const time = new Date(raw).getTime()
  return Number.isFinite(time) ? time : 0
}

function formatDate(isoDate) {
  if (!isoDate) return ''
  return new Intl.DateTimeFormat(locale.value, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).format(new Date(isoDate))
}

function getActorName(log) {
  return log?.actor?.fullName || log?.actor?.username || log?.actor?.id || t('consoleSimple.timelineActorLabel')
}

function getDeviceName(log) {
  const m = log?.meta || {}
  return m.deviceName || m.deviceId || (m.platform && m.osVersion ? `${m.platform} ${m.osVersion}` : '')
}

function getGroupKey(log) {
  return `${getActorName(log)}|${getDeviceName(log)}`
}

function getStatusColor(status = '') {
  const s = String(status).toUpperCase()
  if (ERROR_STATUSES.has(s)) return 'red'
  if (s === 'WARN' || s === 'WARNING') return 'amber'
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'ALLOWED' || s === 'APPROVED') return 'green'
  return 'blue'
}

function getStatusIcon(status = '', isFailure) {
  if (isFailure) return 'warning'
  const s = String(status).toUpperCase()
  if (ERROR_STATUSES.has(s)) return 'error'
  if (s === 'WARN' || s === 'WARNING') return 'warning'
  if (s === 'SUCCESS' || s === 'COMPLETED' || s === 'ALLOWED' || s === 'APPROVED') return 'check_circle'
  return 'radio_button_checked'
}

function actorMatchesSelected(actorName = '') {
  if (!props.selectedActorName) return true
  const selected = String(props.selectedActorName).trim().toLowerCase()
  if (!selected) return true
  return String(actorName).toLowerCase().includes(selected)
}

const timelineGroups = computed(() => {
  const groups = new Map()
  const selected = String(props.selectedActorName || '').trim().toLowerCase()

  for (const log of props.logs || []) {
    const actorName = getActorName(log)
    if (selected && !actorMatchesSelected(actorName)) continue

    const key = getGroupKey(log)
    if (!groups.has(key)) {
      groups.set(key, {
        key,
        actorName,
        deviceName: getDeviceName(log),
        entries: [],
      })
    }
    groups.get(key).entries.push(log)
  }

  const sortedGroups = []
  for (const group of groups.values()) {
    const sortedEntries = [...group.entries].sort((a, b) => getLogTimestamp(b) - getLogTimestamp(a))
    let failureFound = false
    const entries = sortedEntries.map((log, idx) => {
      const status = log?.status || ''
      const isFailure = ERROR_STATUSES.has(String(status).toUpperCase()) && !failureFound
      if (isFailure) failureFound = true
      return {
        log,
        title: `${t('consoleSimple.timelineStep')} ${idx + 1}`,
        subtitle: formatDate(log?.eventTime),
        status,
        statusColor: getStatusColor(status),
        icon: getStatusIcon(status, isFailure),
        color: isFailure ? 'red' : getStatusColor(status),
        isFailure,
        message: log?.message || '',
        eventType: log?.eventType || '',
      }
    })
    sortedGroups.push({ ...group, entries })
  }

  return sortedGroups.sort((a, b) => {
    const aTime = a.entries.length ? getLogTimestamp(a.entries[0].log) : 0
    const bTime = b.entries.length ? getLogTimestamp(b.entries[0].log) : 0
    return aTime - bTime
  })
})
</script>

<style lang="scss" scoped>
.journey-timeline-root {
  padding: 8px 16px 24px;
}

.journey-group-card {
  background: rgba(255, 255, 255, 0.04);
  border: 1px solid rgba(255, 255, 255, 0.08);
  border-radius: 14px;
}

.journey-group-header {
  padding: 14px 18px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.06);
}

.journey-group-body {
  padding: 18px;
}

.journey-entry-content {
  cursor: pointer;
  padding: 10px 12px;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.03);
  transition: background 0.15s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.07);
  }
}

:deep(.q-timeline) {
  .q-timeline__content {
    padding-bottom: 8px;
  }

  .q-timeline__title {
    font-weight: 600;
    color: #fff;
    font-size: 0.95rem;
  }

  .q-timeline__subtitle {
    opacity: 0.75;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.65);
  }
}

.timeline-entry--failure {
  :deep(.q-timeline__dot) {
    box-shadow: 0 0 0 4px rgba(239, 68, 68, 0.25);
  }

  :deep(.q-timeline__title) {
    color: #ff7d7d;
  }
}
</style>
