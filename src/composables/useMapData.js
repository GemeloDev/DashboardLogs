function clean(value) {
  return String(value ?? '').trim()
}

export function getMapDeviceId(item = {}) {
  return clean(item?.meta?.deviceId || item?.deviceId)
}

export function getMapEventTimestamp(event = {}) {
  const value =
    event?.eventTime || event?.timestamp || event?.fechaHoraDia || event?.createdAt || Date.now()
  const timestamp = new Date(value).getTime()
  return Number.isFinite(timestamp) ? timestamp : 0
}

export function getLatestEventTime(events = []) {
  if (!Array.isArray(events) || !events.length) return 0
  return Math.max(...events.map(getMapEventTimestamp))
}

export function getEventRawDate(event = {}) {
  return event?.eventTime || event?.timestamp || event?.fechaHoraDia || event?.createdAt || null
}

export function getMinutesDiff(rawDate, nowMs = Date.now()) {
  if (!rawDate) return 999

  const eventMs = new Date(rawDate).getTime()
  if (!Number.isFinite(eventMs)) return 999

  let diffMs = nowMs - eventMs
  const fifteenMinutesMs = 15 * 60 * 1000
  const sixHoursMs = 6 * 60 * 60 * 1000

  // ESCUCHA puede entregar hora local marcada como UTC (o el caso inverso).
  if (Math.abs(Math.abs(diffMs) - sixHoursMs) < fifteenMinutesMs) {
    diffMs = Math.abs(diffMs) - sixHoursMs
  }

  return Math.floor(Math.abs(diffMs) / (1000 * 60))
}

export function isAuthenticationEvent(event = {}) {
  const eventType = clean(event?.eventType).toUpperCase()
  const tags = Array.isArray(event?.tags) ? event.tags : [event?.tags]
  return (
    eventType === 'AUTENTICACION_INICIO_SESION' ||
    eventType.includes('INICIO_SESION') ||
    eventType.includes('LOGIN') ||
    tags.some((tag) => {
      const value = clean(tag?.name || tag?.value || tag?.label || tag)
      return value.toUpperCase().includes('AUTH') || value.toUpperCase().includes('LOGIN')
    })
  )
}

export function isLoginAttemptEvent(event = {}) {
  return isAuthenticationEvent(event) || clean(event?.status).toUpperCase() === 'REJECTED'
}

function actorNameFrom(item = {}) {
  return clean(
    item?.actor?.fullName ||
      item?.actorName ||
      item?.fullName ||
      item?.userFullName ||
      item?.name,
  )
}

function uniqueEvents(events = []) {
  const seen = new Set()
  return events.filter((event) => {
    const key = clean(event?.id || event?.eventId) || [
      getMapDeviceId(event),
      clean(event?.eventType),
      getMapEventTimestamp(event),
    ].join('|')
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}

/** Consolida dispositivos y eventos usando deviceId como única identidad. */
export function consolidateMapDevices(devices = [], logs = []) {
  const groups = new Map()

  const ensureGroup = (rawId) => {
    const deviceId = clean(rawId)
    if (!deviceId) return null
    const key = deviceId.toLowerCase()
    if (!groups.has(key)) groups.set(key, { deviceId, devices: [], events: [] })
    return groups.get(key)
  }

  for (const device of devices || []) {
    const group = ensureGroup(getMapDeviceId(device))
    if (!group) continue
    group.devices.push(device)
    if (Array.isArray(device?.recentLogs)) group.events.push(...device.recentLogs)
  }

  for (const event of logs || []) {
    const group = ensureGroup(getMapDeviceId(event))
    if (group) group.events.push(event)
  }

  return [...groups.values()].map(({ deviceId, devices: groupedDevices, events }) => {
    const sortedEvents = uniqueEvents(events).sort(
      (a, b) => getMapEventTimestamp(b) - getMapEventTimestamp(a),
    )
    const actorEvent = sortedEvents.find((event) => actorNameFrom(event))
    const namedDevice = groupedDevices.find((device) => actorNameFrom(device))
    const latestDevice = groupedDevices.reduce((latest, device) => {
      if (!latest) return device
      return getMapEventTimestamp(device) > getMapEventTimestamp(latest) ? device : latest
    }, null)
    const base = latestDevice || groupedDevices[0] || {}
    const coordinateSource =
      sortedEvents.find((event) => {
        const lat = Number(event?.lat ?? event?.latitude ?? event?.location?.latitude)
        const lon = Number(
          event?.lon ?? event?.lng ?? event?.longitude ?? event?.location?.longitude,
        )
        return Number.isFinite(lat) && Number.isFinite(lon)
      }) || base
    const latitude = Number(
      coordinateSource?.lat ?? coordinateSource?.latitude ?? coordinateSource?.location?.latitude,
    )
    const longitude = Number(
      coordinateSource?.lon ??
        coordinateSource?.lng ??
        coordinateSource?.longitude ??
        coordinateSource?.location?.longitude,
    )
    const loginEvents = sortedEvents.filter(isLoginAttemptEvent)
    const latestEventTime = getLatestEventTime(sortedEvents)

    return {
      ...base,
      deviceId,
      actorName: actorNameFrom(actorEvent) || actorNameFrom(namedDevice),
      lat: Number.isFinite(latitude) ? latitude : Number(base?.lat ?? base?.latitude),
      lon: Number.isFinite(longitude) ? longitude : Number(base?.lon ?? base?.longitude),
      recentLogs: sortedEvents,
      events: sortedEvents,
      latestEvent: sortedEvents[0] || null,
      latestEventTime,
      lastEventTime: getEventRawDate(sortedEvents[0]) || base?.lastEventTime || base?.lastSeen || null,
      loginEvents,
      hasLoginAttempts: loginEvents.length > 0,
      failedLoginCount: loginEvents.filter((event) => {
        const eventType = clean(event?.eventType).toUpperCase()
        const status = clean(event?.status).toUpperCase()
        return eventType.includes('FALLO_INICIO_SESION') || status === 'REJECTED'
      }).length,
      latestLoginEvent: loginEvents[0] || null,
    }
  })
}
