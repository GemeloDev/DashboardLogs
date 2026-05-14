const TECHNICAL_ERROR_PATTERNS = [
  'llm no disponible',
  'nontransientaiexception',
  'incorrect api key',
  'invalid_api_key',
  'api key provided',
  'http 401',
]

export function buildExecutivePresentation(payload = {}, fallbackText = 'No se obtuvo resumen.') {
  const base = payload?.base || {}
  const pretty = payload?.pretty || {}
  const narrative = pretty?.executiveNarrative

  return {
    narrative: isUserSafeNarrative(narrative)
      ? narrative
      : buildFallbackNarrative(base, fallbackText),
    bullets: buildKeyPoints(base, pretty),
    recommendations: buildRecommendations(base),
  }
}

export function isUserSafeNarrative(value) {
  const text = String(value || '').trim()
  if (!text) return false

  const normalized = text.toLowerCase()
  return !TECHNICAL_ERROR_PATTERNS.some((pattern) => normalized.includes(pattern))
}

function buildFallbackNarrative(base = {}, fallbackText) {
  if (!base || !Object.keys(base).length) return fallbackText

  const total = Number(base.total || 0)
  const errorCount = Number(base.severities?.ERROR || 0)
  const errorRate = formatPercent(base.errorRate)
  const status = base.status || 'sin estado'
  const system = firstName(base.topSystemsRange) || base.suggestedFilters?.system || 'el sistema consultado'
  const eventType = firstEntry(base.topEventTypesRange)
  const topError = firstEntry(base.topErrorsRange, 'key')
  const range = buildRangeText(base)

  if (!total) {
    return range
      ? `No se registraron eventos para ${system} en el periodo ${range}.`
      : `No se registraron eventos para ${system} en el periodo consultado.`
  }

  const lines = [
    range
      ? `Se reviso el resumen diario de ${system} para el periodo ${range}.`
      : `Se reviso el resumen diario de ${system}.`,
    `Se registraron ${formatNumber(total)} eventos, con ${formatNumber(errorCount)} errores y una tasa de error de ${errorRate}. El estado general es ${status}.`,
  ]

  if (eventType) {
    lines.push(`El tipo de evento con mayor presencia fue ${eventType.name} (${formatNumber(eventType.count)} eventos).`)
  }

  if (topError) {
    lines.push(`El error recurrente principal fue: ${shorten(topError.name, 150)} (${formatNumber(topError.count)} casos).`)
  }

  return lines.filter(Boolean).join(' ')
}

function buildKeyPoints(base = {}, pretty = {}) {
  const points = []
  const total = Number(base.total || 0)
  const errorCount = Number(base.severities?.ERROR || 0)
  const system = firstEntry(base.topSystemsRange)
  const eventType = firstEntry(base.topEventTypesRange)
  const topError = firstEntry(base.topErrorsRange, 'key')

  points.push(`Eventos totales: ${formatNumber(total)}.`)
  points.push(`Tasa de error: ${formatPercent(base.errorRate)} (${formatNumber(errorCount)} errores).`)

  if (system) {
    points.push(`Sistema principal: ${system.name} (${formatNumber(system.count)} eventos).`)
  }

  if (eventType) {
    points.push(`Tipo de evento principal: ${eventType.name} (${formatNumber(eventType.count)}).`)
  }

  if (topError) {
    points.push(`Error mas frecuente: ${shorten(topError.name, 110)} (${formatNumber(topError.count)}).`)
  }

  const fallbackBullets = Array.isArray(pretty.executiveBullets)
    ? pretty.executiveBullets
    : Array.isArray(base.executiveSummary)
      ? base.executiveSummary
      : []

  return points.length ? points : fallbackBullets
}

function buildRecommendations(base = {}) {
  if (Array.isArray(base.actions) && base.actions.length) {
    return base.actions
  }

  return ['Mantener monitoreo y revisar la tendencia si incrementan los errores.']
}

function buildRangeText(base = {}) {
  if (!base.fromLocal || !base.toLocal) return ''
  const from = formatDateTime(base.fromLocal, base.tz)
  const to = formatDateTime(base.toLocal, base.tz)
  if (!from || !to) return ''
  return `${from} a ${to}`
}

function firstEntry(value, nameKey = 'name') {
  if (!Array.isArray(value) || !value.length) return null
  const item = value[0]
  const name = item?.[nameKey]
  if (!name) return null
  return {
    name,
    count: Number(item.count || 0),
  }
}

function firstName(value) {
  return firstEntry(value)?.name || ''
}

function formatPercent(value) {
  return new Intl.NumberFormat('es-MX', {
    style: 'percent',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(Number(value || 0))
}

function formatNumber(value) {
  return new Intl.NumberFormat('es-MX').format(Number(value || 0))
}

function formatDateTime(value, timeZone) {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''

  return new Intl.DateTimeFormat('es-MX', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: timeZone || undefined,
  }).format(date)
}

function shorten(value, maxLength) {
  const text = String(value || '').trim()
  if (text.length <= maxLength) return text
  return `${text.slice(0, maxLength - 3).trim()}...`
}
