export function buildRangeLabel({ granularity, days, hours, rangeLabel } = {}) {
  // Si viene rangeLabel explícito (ej: '1 día'), usarlo directamente
  if (rangeLabel) return rangeLabel

  if (granularity === 'hourly') {
    const h = hours || 24
    return `${h} ${h === 1 ? 'hora' : 'horas'}`
  }
  const d = days || 30
  return `${d} ${d === 1 ? 'día' : 'días'}`
}

export function buildContextLabel({ system, granularity, days, hours, rangeLabel } = {}) {
  const safeSystem      = system || 'Sin system'
  const safeGranularity = granularity || 'daily'
  const range           = buildRangeLabel({ granularity: safeGranularity, days, hours, rangeLabel })
  return `${safeSystem} · ${safeGranularity} · ${range}`
}

export function buildChartTitle(ctx = {}) {
  return `Gráfica: ${buildContextLabel(ctx)}`
}

export function buildChartSummary(ctx = {}) {
  const safeSystem      = ctx.system || 'Sin system'
  const safeGranularity = ctx.granularity || 'daily'
  const range           = buildRangeLabel(ctx)
  return [
    `System: ${safeSystem}`,
    `Granularity: ${safeGranularity}`,
    `Range: ${range}`
  ]
}

export function buildAlertsTitle(ctx = {}) {
  const range = buildRangeLabel(ctx)
  return `Alertas abiertas · tenant global · ${range}`
}

export function buildAlertsSummary(ctx = {}) {
  const lines = []
  lines.push('Origen: alertas globales del tenant')
  lines.push(`Granularity: ${ctx.granularity || 'daily'}`)
  lines.push(`Range: ${buildRangeLabel(ctx)}`)
  if (ctx.system) {
    lines.push(`System de referencia en conversación: ${ctx.system}`)
  }
  return lines
}
